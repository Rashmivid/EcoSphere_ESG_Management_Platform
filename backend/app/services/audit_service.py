from sqlalchemy.orm import Session
from app.models.models import AuditLog

def log_action(db: Session, actor_id: int | None, action: str, entity: str, entity_id: str | None = None, details: dict = None):
    log = AuditLog(
        actor_id=actor_id,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id is not None else None,
        details=details
    )
    db.add(log)
    db.commit()
