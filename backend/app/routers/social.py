from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import (
    CSRActivity, EmployeeParticipation, ApprovalStatus, User, ESGConfig,
    DiversityMetric, TrainingCompletion
)
from app.schemas.schemas import (
    CSRActivityCreate, CSRActivityOut, ParticipationCreate, ParticipationSubmitProof,
    ParticipationDecision, ParticipationOut,
    DiversityMetricCreate, DiversityMetricOut,
    TrainingCompletionCreate, TrainingCompletionOut
)
from app.deps import get_current_user, require_admin_or_head, require_admin
from app.services.points_service import award_points
from app.services.audit_service import log_action
from app.services.scoring_service import recalculate_department_scores

router = APIRouter(prefix="/social", tags=["Social"])

POINTS_PER_CSR_APPROVAL = 20


def _get_config(db: Session) -> ESGConfig:
    cfg = db.query(ESGConfig).first()
    if not cfg:
        cfg = ESGConfig()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


@router.post("/activities", response_model=CSRActivityOut)
def create_activity(payload: CSRActivityCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    activity = CSRActivity(**payload.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    
    log_action(db, current_user.id, "create", "CSRActivity", activity.id, {"title": activity.title})
    return activity


@router.get("/activities", response_model=list[CSRActivityOut])
def list_activities(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(CSRActivity).all()


@router.post("/participations", response_model=ParticipationOut)
def join_activity(payload: ParticipationCreate, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    activity = db.query(CSRActivity).get(payload.activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    existing = db.query(EmployeeParticipation).filter(
        EmployeeParticipation.employee_id == current_user.id,
        EmployeeParticipation.activity_id == payload.activity_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this activity")
    p = EmployeeParticipation(employee_id=current_user.id, activity_id=payload.activity_id)
    db.add(p)
    db.commit()
    db.refresh(p)
    
    log_action(db, current_user.id, "join", "CSRActivity", activity.id)
    return p


@router.put("/participations/{p_id}/proof", response_model=ParticipationOut)
def submit_proof(p_id: int, payload: ParticipationSubmitProof, db: Session = Depends(get_db),
                  current_user: User = Depends(get_current_user)):
    p = db.query(EmployeeParticipation).get(p_id)
    if not p or p.employee_id != current_user.id:
        raise HTTPException(status_code=404, detail="Participation not found")
    p.proof_url = payload.proof_url
    db.commit()
    db.refresh(p)
    
    log_action(db, current_user.id, "submit_proof", "CSRActivity", p.activity_id)
    return p


@router.put("/participations/{p_id}/decision", response_model=ParticipationOut)
def decide_participation(p_id: int, payload: ParticipationDecision, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    p = db.query(EmployeeParticipation).get(p_id)
    if not p:
        raise HTTPException(status_code=404, detail="Participation not found")

    cfg = _get_config(db)
    activity = db.query(CSRActivity).get(p.activity_id)
    if payload.approve and cfg.evidence_requirement and activity.evidence_required and not p.proof_url:
        raise HTTPException(status_code=400, detail="Proof is required before approval")

    p.approval_status = ApprovalStatus.approved if payload.approve else ApprovalStatus.rejected
    if payload.approve:
        p.points_earned = POINTS_PER_CSR_APPROVAL
        p.completion_date = datetime.utcnow()
    db.commit()
    db.refresh(p)

    from app.services.notification_service import notify
    notify(db, p.employee_id, "csr_decision",
           f"Your CSR participation was {'approved' if payload.approve else 'rejected'}.")

    log_action(db, current_user.id, "decide_participation", "CSRActivity", p.activity_id, {"status": p.approval_status.value})

    if payload.approve:
        award_points(db, p.employee_id, POINTS_PER_CSR_APPROVAL, "a CSR activity")
        # Event-driven Score Recalculation
        recalculate_department_scores(db)

    return p


@router.get("/participations/mine", response_model=list[ParticipationOut])
def my_participations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(EmployeeParticipation).filter(EmployeeParticipation.employee_id == current_user.id).all()


@router.get("/participations", response_model=list[ParticipationOut], dependencies=[Depends(require_admin_or_head)])
def all_participations(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(EmployeeParticipation)
    if status:
        q = q.filter(EmployeeParticipation.approval_status == status)
    return q.all()


# ---- Diversity Metrics Endpoints ----
@router.post("/diversity-metrics", response_model=DiversityMetricOut)
def create_diversity_metric(payload: DiversityMetricCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if this metric is already set for the user to update or create
    dm = db.query(DiversityMetric).filter(
        DiversityMetric.employee_id == current_user.id,
        DiversityMetric.field == payload.field
    ).first()
    if dm:
        dm.value = payload.value
        dm.submitted_at = datetime.utcnow()
    else:
        dm = DiversityMetric(
            employee_id=current_user.id,
            field=payload.field,
            value=payload.value
        )
        db.add(dm)
    db.commit()
    db.refresh(dm)
    log_action(db, current_user.id, "submit_diversity_metric", "DiversityMetric", dm.id, {"field": payload.field})
    return dm


@router.get("/diversity-metrics", response_model=list[DiversityMetricOut])
def list_diversity_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Non-admins only see their own metrics, admins see all
    if current_user.role in ("admin", "department_head"):
        return db.query(DiversityMetric).all()
    return db.query(DiversityMetric).filter(DiversityMetric.employee_id == current_user.id).all()


# ---- Training Completion Endpoints ----
@router.post("/training-completions", response_model=TrainingCompletionOut)
def create_training_completion(payload: TrainingCompletionCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    tc = TrainingCompletion(**payload.model_dump())
    db.add(tc)
    db.commit()
    db.refresh(tc)
    log_action(db, current_user.id, "create_training_completion", "TrainingCompletion", tc.id, {"training_name": payload.training_name, "employee_id": payload.employee_id})
    return tc


@router.get("/training-completions", response_model=list[TrainingCompletionOut])
def list_training_completions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role in ("admin", "department_head"):
        return db.query(TrainingCompletion).all()
    return db.query(TrainingCompletion).filter(TrainingCompletion.employee_id == current_user.id).all()


@router.put("/training-completions/{tc_id}", response_model=TrainingCompletionOut)
def update_training_completion(tc_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tc = db.query(TrainingCompletion).get(tc_id)
    if not tc:
        raise HTTPException(status_code=404, detail="Training record not found")
    
    # Check permissions: only the assigned employee can mark completed, or an admin/head
    if tc.employee_id != current_user.id and current_user.role not in ("admin", "department_head"):
        raise HTTPException(status_code=403, detail="Not authorized to update this record")
        
    tc.status = status
    if status == "completed":
        tc.completed_at = datetime.utcnow()
    else:
        tc.completed_at = None
    db.commit()
    db.refresh(tc)
    
    log_action(db, current_user.id, "update_training_completion", "TrainingCompletion", tc.id, {"status": status})
    return tc
