from sqlalchemy.orm import Session
from app.models.models import User
from app.services.badge_service import evaluate_badges_for_employee
from app.services.notification_service import notify


def award_points(db: Session, employee_id: int, points: int, reason: str):
    """Shared points/XP service used by both Social (CSR approval) and
    Gamification (Challenge approval) modules, so XP always stays consistent
    across the platform."""
    user = db.query(User).filter(User.id == employee_id).first()
    if not user:
        return None
    user.xp_points += points
    db.commit()
    db.refresh(user)

    notify(db, employee_id, "points_awarded", f"You earned {points} XP for {reason}.")
    evaluate_badges_for_employee(db, employee_id)
    return user
