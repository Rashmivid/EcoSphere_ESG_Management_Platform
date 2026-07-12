from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, ESGConfig, DepartmentScore
from app.schemas.schemas import ESGConfigUpdate, ESGConfigOut, OverallScoreOut, DepartmentScoreOut
from app.deps import get_current_user, require_admin
from app.services.scoring_service import recalculate_department_scores, overall_score, _get_config

router = APIRouter(prefix="/scoring", tags=["Scoring"])


@router.get("/config", response_model=ESGConfigOut)
def get_config(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return _get_config(db)


@router.put("/config", response_model=ESGConfigOut, dependencies=[Depends(require_admin)])
def update_config(payload: ESGConfigUpdate, db: Session = Depends(get_db)):
    cfg = _get_config(db)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(cfg, k, v)
    db.commit()
    db.refresh(cfg)
    return cfg


@router.post("/recalculate", response_model=list[DepartmentScoreOut], dependencies=[Depends(require_admin)])
def recalculate(period: str | None = None, db: Session = Depends(get_db)):
    """Manually trigger score recalculation (normally event-driven / scheduled)."""
    return recalculate_department_scores(db, period)


@router.get("/overall", response_model=OverallScoreOut)
def get_overall(period: str | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return overall_score(db, period)


@router.get("/departments/{department_id}/history", response_model=list[DepartmentScoreOut])
def department_score_history(department_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return (
        db.query(DepartmentScore)
        .filter(DepartmentScore.department_id == department_id)
        .order_by(DepartmentScore.period.asc())
        .all()
    )


@router.get("/simulate")
def whatif_simulate(env_weight: float, social_weight: float, gov_weight: float,
                     period: str | None = None, db: Session = Depends(get_db),
                     _: User = Depends(get_current_user)):
    """'What-if' ESG Simulator: recompute the overall score using
    hypothetical weights without persisting anything."""
    result = overall_score(db, period)
    scores = result["department_scores"]
    if not scores:
        return {"overall_score": 0.0}
    total = sum(
        (s.environmental_score * env_weight + s.social_score * social_weight + s.governance_score * gov_weight)
        for s in scores
    )
    return {"simulated_overall_score": round(total / len(scores), 2)}
