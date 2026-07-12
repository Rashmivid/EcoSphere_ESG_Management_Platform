from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.models.models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue, ComplianceStatus, User
from app.schemas.schemas import (
    PolicyCreate, PolicyOut, AuditCreate, AuditOut, ComplianceIssueCreate, ComplianceIssueOut,
)
from app.deps import get_current_user, require_admin, require_admin_or_head
from app.services.scoring_service import flag_overdue_compliance_issues, recalculate_department_scores
from app.services.audit_service import log_action

router = APIRouter(prefix="/governance", tags=["Governance"])


# ---- Policies ----
@router.post("/policies", response_model=PolicyOut)
def create_policy(payload: PolicyCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    policy = ESGPolicy(**payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    log_action(db, current_user.id, "create", "ESGPolicy", policy.id, {"title": policy.title})
    return policy


@router.get("/policies", response_model=list[PolicyOut])
def list_policies(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(ESGPolicy).all()


@router.post("/policies/{policy_id}/acknowledge")
def acknowledge_policy(policy_id: int, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_user)):
    policy = db.query(ESGPolicy).get(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    ack = db.query(PolicyAcknowledgement).filter(
        PolicyAcknowledgement.employee_id == current_user.id,
        PolicyAcknowledgement.policy_id == policy_id,
    ).first()
    if not ack:
        ack = PolicyAcknowledgement(employee_id=current_user.id, policy_id=policy_id)
    ack.acknowledged_at = datetime.utcnow()
    db.add(ack)
    db.commit()
    
    log_action(db, current_user.id, "acknowledge", "ESGPolicy", policy_id)
    # Event-driven Score Recalculation
    recalculate_department_scores(db)
    return {"detail": "Policy acknowledged"}


@router.get("/policies/{policy_id}/acknowledgement-rate")
def acknowledgement_rate(policy_id: int, db: Session = Depends(get_db),
                          _: User = Depends(require_admin_or_head)):
    total_users = db.query(User).count()
    acked = db.query(PolicyAcknowledgement).filter(
        PolicyAcknowledgement.policy_id == policy_id,
        PolicyAcknowledgement.acknowledged_at.isnot(None),
    ).count()
    rate = (acked / total_users * 100) if total_users else 0
    return {"policy_id": policy_id, "acknowledged": acked, "total_employees": total_users, "rate_pct": round(rate, 2)}


# ---- Audits ----
@router.post("/audits", response_model=AuditOut)
def create_audit(payload: AuditCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    audit = Audit(**payload.model_dump())
    db.add(audit)
    db.commit()
    db.refresh(audit)
    log_action(db, current_user.id, "create", "Audit", audit.id, {"scope": audit.scope})
    return audit


@router.get("/audits", response_model=list[AuditOut])
def list_audits(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Audit).all()


@router.put("/audits/{audit_id}/status", response_model=AuditOut)
def update_audit_status(audit_id: int, status: str, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    audit = db.query(Audit).get(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    audit.status = status
    db.commit()
    db.refresh(audit)
    log_action(db, current_user.id, "update_status", "Audit", audit.id, {"status": status})
    # Event-driven Score Recalculation
    recalculate_department_scores(db)
    return audit


# ---- Compliance Issues ----
@router.post("/compliance-issues", response_model=ComplianceIssueOut)
def create_compliance_issue(payload: ComplianceIssueCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    issue = ComplianceIssue(**payload.model_dump())
    db.add(issue)
    db.commit()
    db.refresh(issue)

    from app.services.notification_service import notify
    notify(db, issue.owner_id, "compliance_issue_raised",
           f"A new compliance issue was assigned to you (due {issue.due_date}).")
           
    log_action(db, current_user.id, "create", "ComplianceIssue", issue.id, {"description": issue.description, "owner_id": issue.owner_id})
    # Event-driven Score Recalculation
    recalculate_department_scores(db)
    return issue


@router.get("/compliance-issues", response_model=list[ComplianceIssueOut])
def list_compliance_issues(department_id: int | None = None, severity: str | None = None,
                            status: str | None = None, db: Session = Depends(get_db),
                            _: User = Depends(get_current_user)):
    q = db.query(ComplianceIssue)
    if department_id:
        q = q.filter(ComplianceIssue.department_id == department_id)
    if severity:
        q = q.filter(ComplianceIssue.severity == severity)
    if status:
        q = q.filter(ComplianceIssue.status == status)
    return q.all()


@router.put("/compliance-issues/{issue_id}/status", response_model=ComplianceIssueOut)
def update_issue_status(issue_id: int, status: ComplianceStatus, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    issue = db.query(ComplianceIssue).get(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")
    issue.status = status
    db.commit()
    db.refresh(issue)
    log_action(db, current_user.id, "update_status", "ComplianceIssue", issue.id, {"status": status.value})
    # Event-driven Score Recalculation
    recalculate_department_scores(db)
    return issue


@router.post("/compliance-issues/flag-overdue")
def flag_overdue(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    """Manually trigger the daily overdue-check (normally a Celery beat task)."""
    overdue = flag_overdue_compliance_issues(db)
    log_action(db, current_user.id, "flag_overdue", "ComplianceIssue", None, {"flagged_count": len(overdue)})
    recalculate_department_scores(db)
    return {"flagged": len(overdue)}


@router.get("/dashboard")
def governance_dashboard(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    from sqlalchemy import func
    by_severity = dict(
        db.query(ComplianceIssue.severity, func.count(ComplianceIssue.id)).group_by(ComplianceIssue.severity).all()
    )
    overdue_count = db.query(ComplianceIssue).filter(ComplianceIssue.status == ComplianceStatus.overdue).count()
    open_count = db.query(ComplianceIssue).filter(ComplianceIssue.status == ComplianceStatus.open).count()
    return {"open_issues": open_count, "overdue_issues": overdue_count, "issues_by_severity": by_severity}
