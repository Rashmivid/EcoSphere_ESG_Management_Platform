from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import (
    Department, CarbonTransaction, SustainabilityGoal, EmployeeParticipation,
    ChallengeParticipation, ApprovalStatus, PolicyAcknowledgement, ESGPolicy,
    Audit, ComplianceIssue, ComplianceStatus, DepartmentScore, ESGConfig,
)


def _get_config(db: Session) -> ESGConfig:
    cfg = db.query(ESGConfig).first()
    if not cfg:
        cfg = ESGConfig()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


def _environmental_score(db: Session, department_id: int) -> float:
    """Score 0-100 based on progress toward each active Sustainability Goal.
    A department with no goals defaults to a neutral 50."""
    goals = db.query(SustainabilityGoal).filter(
        SustainabilityGoal.department_id == department_id
    ).all()
    if not goals:
        return 50.0
    ratios = []
    for g in goals:
        if g.target_value:
            ratios.append(min(g.current_value / g.target_value, 1.0))
    if not ratios:
        return 50.0
    return round((sum(ratios) / len(ratios)) * 100, 2)


def _social_score(db: Session, department_id: int) -> float:
    """Score 0-100 based on the approval rate of CSR participation by
    employees in this department."""
    from app.models.models import User

    total = (
        db.query(EmployeeParticipation)
        .join(User, User.id == EmployeeParticipation.employee_id)
        .filter(User.department_id == department_id)
        .count()
    )
    if total == 0:
        return 50.0
    approved = (
        db.query(EmployeeParticipation)
        .join(User, User.id == EmployeeParticipation.employee_id)
        .filter(
            User.department_id == department_id,
            EmployeeParticipation.approval_status == ApprovalStatus.approved,
        )
        .count()
    )
    return round((approved / total) * 100, 2)


def _governance_score(db: Session, department_id: int) -> float:
    """Score 0-100 combining policy acknowledgement rate and compliance
    issue health (fewer open/overdue issues = higher score)."""
    from app.models.models import User

    total_acks = (
        db.query(PolicyAcknowledgement)
        .join(User, User.id == PolicyAcknowledgement.employee_id)
        .filter(User.department_id == department_id)
        .count()
    )
    completed_acks = (
        db.query(PolicyAcknowledgement)
        .join(User, User.id == PolicyAcknowledgement.employee_id)
        .filter(
            User.department_id == department_id,
            PolicyAcknowledgement.acknowledged_at.isnot(None),
        )
        .count()
    )
    ack_rate = (completed_acks / total_acks) if total_acks else 1.0

    total_issues = db.query(ComplianceIssue).filter(
        ComplianceIssue.department_id == department_id
    ).count()
    bad_issues = db.query(ComplianceIssue).filter(
        ComplianceIssue.department_id == department_id,
        ComplianceIssue.status.in_([ComplianceStatus.open, ComplianceStatus.overdue]),
    ).count()
    issue_health = 1.0 - (bad_issues / total_issues) if total_issues else 1.0

    return round(((ack_rate * 0.5) + (issue_health * 0.5)) * 100, 2)


def flag_overdue_compliance_issues(db: Session):
    """Marks any Open compliance issue past its due date as Overdue and
    fires a notification to the owner. Intended to run as a scheduled
    (Celery beat) task, but safe to call synchronously too."""
    from app.services.notification_service import notify

    today = date.today()
    overdue = db.query(ComplianceIssue).filter(
        ComplianceIssue.status == ComplianceStatus.open,
        ComplianceIssue.due_date < today,
    ).all()
    for issue in overdue:
        issue.status = ComplianceStatus.overdue
        db.add(issue)
        notify(db, issue.owner_id, "compliance_overdue",
               f"Compliance issue #{issue.id} is now overdue.")
    db.commit()
    return overdue


def recalculate_department_scores(db: Session, period: str | None = None) -> list[DepartmentScore]:
    """Recomputes and stores a DepartmentScore row per department for the
    given period (default: current YYYY-MM). Historical rows are preserved
    so trend charts can be built over time."""
    cfg = _get_config(db)
    period = period or datetime.utcnow().strftime("%Y-%m")

    results = []
    for dept in db.query(Department).all():
        env = _environmental_score(db, dept.id)
        soc = _social_score(db, dept.id)
        gov = _governance_score(db, dept.id)
        total = round(
            env * cfg.environmental_weight + soc * cfg.social_weight + gov * cfg.governance_weight, 2
        )

        existing = db.query(DepartmentScore).filter(
            DepartmentScore.department_id == dept.id,
            DepartmentScore.period == period,
        ).first()

        if existing:
            existing.environmental_score = env
            existing.social_score = soc
            existing.governance_score = gov
            existing.total_score = total
            existing.computed_at = datetime.utcnow()
            db.add(existing)
            results.append(existing)
        else:
            row = DepartmentScore(
                department_id=dept.id,
                environmental_score=env,
                social_score=soc,
                governance_score=gov,
                total_score=total,
                period=period,
            )
            db.add(row)
            results.append(row)

    db.commit()
    for r in results:
        db.refresh(r)
    return results


def overall_score(db: Session, period: str | None = None):
    period = period or datetime.utcnow().strftime("%Y-%m")
    scores = db.query(DepartmentScore).filter(DepartmentScore.period == period).all()
    if not scores:
        scores = recalculate_department_scores(db, period)
    if not scores:
        return {"period": period, "overall_score": 0.0, "department_scores": []}
    avg = round(sum(s.total_score for s in scores) / len(scores), 2)
    return {"period": period, "overall_score": avg, "department_scores": scores}
