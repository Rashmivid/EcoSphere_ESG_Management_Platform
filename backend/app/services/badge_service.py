from sqlalchemy.orm import Session
from app.models.models import (
    Badge, EmployeeBadge, User, ChallengeParticipation, ApprovalStatus, ESGConfig
)
from app.services.notification_service import notify


def _get_config(db: Session) -> ESGConfig:
    cfg = db.query(ESGConfig).first()
    if not cfg:
        cfg = ESGConfig()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


def evaluate_badges_for_employee(db: Session, employee_id: int):
    """Generic rule evaluator over Badge.unlock_rule JSON, e.g.:
    {"type": "xp", "min": 100}
    {"type": "challenges_completed", "min": 5}
    New badges can be added purely via data -- no code changes required.
    """
    cfg = _get_config(db)
    if not cfg.badge_auto_award:
        return []

    user = db.query(User).filter(User.id == employee_id).first()
    if not user:
        return []

    already_earned_ids = {
        eb.badge_id for eb in db.query(EmployeeBadge).filter(EmployeeBadge.employee_id == employee_id)
    }
    newly_awarded = []

    for badge in db.query(Badge).all():
        if badge.id in already_earned_ids:
            continue
        rule = badge.unlock_rule or {}
        rtype = rule.get("type")
        unlocked = False

        if rtype == "xp":
            unlocked = user.xp_points >= rule.get("min", 10**9)
        elif rtype == "challenges_completed":
            completed = (
                db.query(ChallengeParticipation)
                .filter(
                    ChallengeParticipation.employee_id == employee_id,
                    ChallengeParticipation.approval == ApprovalStatus.approved,
                )
                .count()
            )
            unlocked = completed >= rule.get("min", 10**9)

        if unlocked:
            eb = EmployeeBadge(employee_id=employee_id, badge_id=badge.id)
            db.add(eb)
            db.commit()
            newly_awarded.append(badge)
            notify(db, employee_id, "badge_unlocked", f"You unlocked the '{badge.name}' badge!")

    return newly_awarded
