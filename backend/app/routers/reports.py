from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import (
    CarbonTransaction, EmployeeParticipation, ComplianceIssue, ChallengeParticipation,
    DepartmentScore, User, AuditLog,
)
from app.deps import get_current_user, require_admin_or_head, require_admin

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/environmental")
def environmental_report(department_id: int | None = None, start: date | None = None, end: date | None = None,
                          db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.query(CarbonTransaction)
    if department_id:
        q = q.filter(CarbonTransaction.department_id == department_id)
    if start:
        q = q.filter(CarbonTransaction.date >= start)
    if end:
        q = q.filter(CarbonTransaction.date <= end)
    rows = q.all()
    total_co2 = sum(r.calculated_co2 for r in rows)
    return {"total_co2": total_co2, "transaction_count": len(rows), "transactions": [
        {"id": r.id, "department_id": r.department_id, "source_type": r.source_type,
         "calculated_co2": r.calculated_co2, "date": str(r.date)} for r in rows
    ]}


@router.get("/social")
def social_report(department_id: int | None = None, employee_id: int | None = None,
                   db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.query(EmployeeParticipation)
    if employee_id:
        q = q.filter(EmployeeParticipation.employee_id == employee_id)
    if department_id:
        q = q.join(User, User.id == EmployeeParticipation.employee_id).filter(User.department_id == department_id)
    rows = q.all()
    approved = sum(1 for r in rows if r.approval_status.value == "approved")
    return {
        "total_participations": len(rows),
        "approved": approved,
        "approval_rate_pct": round((approved / len(rows) * 100), 2) if rows else 0,
    }


@router.get("/governance", dependencies=[Depends(require_admin_or_head)])
def governance_report(department_id: int | None = None, severity: str | None = None,
                       db: Session = Depends(get_db)):
    q = db.query(ComplianceIssue)
    if department_id:
        q = q.filter(ComplianceIssue.department_id == department_id)
    if severity:
        q = q.filter(ComplianceIssue.severity == severity)
    rows = q.all()
    by_status: dict[str, int] = {}
    for r in rows:
        by_status[r.status.value] = by_status.get(r.status.value, 0) + 1
    return {"total_issues": len(rows), "by_status": by_status}


@router.get("/esg-summary")
def esg_summary_report(period: str | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    from app.services.scoring_service import overall_score
    return overall_score(db, period)


@router.get("/custom", dependencies=[Depends(require_admin_or_head)])
def custom_report(module: str | None = None, department_id: int | None = None, employee_id: int | None = None,
                   challenge_id: int | None = None, start: date | None = None, end: date | None = None,
                   db: Session = Depends(get_db)):
    """Custom Report Builder: combine filters across module/department/date range/
    employee/challenge. Returns JSON; export to PDF/Excel/CSV is done client-side
    from this payload."""
    result = {}
    if module in (None, "environmental"):
        q = db.query(CarbonTransaction)
        if department_id:
            q = q.filter(CarbonTransaction.department_id == department_id)
        if start:
            q = q.filter(CarbonTransaction.date >= start)
        if end:
            q = q.filter(CarbonTransaction.date <= end)
        result["environmental"] = [{"id": r.id, "co2": r.calculated_co2, "date": str(r.date)} for r in q.all()]

    if module in (None, "social"):
        q = db.query(EmployeeParticipation)
        if employee_id:
            q = q.filter(EmployeeParticipation.employee_id == employee_id)
        result["social"] = [{"id": r.id, "status": r.approval_status.value} for r in q.all()]

    if module in (None, "gamification") and challenge_id:
        q = db.query(ChallengeParticipation).filter(ChallengeParticipation.challenge_id == challenge_id)
        result["gamification"] = [{"id": r.id, "employee_id": r.employee_id, "xp": r.xp_awarded} for r in q.all()]

    return result


@router.get("/activity-log", dependencies=[Depends(require_admin_or_head)])
def activity_log(entity: str | None = None, actor_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(AuditLog)
    if entity:
        q = q.filter(AuditLog.entity == entity)
    if actor_id:
        q = q.filter(AuditLog.actor_id == actor_id)
    rows = q.order_by(AuditLog.timestamp.desc()).limit(200).all()
    return [{"id": r.id, "actor_id": r.actor_id, "action": r.action, "entity": r.entity,
             "entity_id": r.entity_id, "timestamp": str(r.timestamp)} for r in rows]
