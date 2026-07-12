from sqlalchemy.orm import Session
from app.models.models import Notification


def notify(db: Session, user_id: int, type_: str, message: str) -> Notification:
    """Create an in-app notification. In production this would also publish
    to an email worker (Celery task) and/or a WebSocket channel."""
    n = Notification(user_id=user_id, type=type_, message=message)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n
