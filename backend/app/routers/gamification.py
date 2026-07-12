from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import (
    Challenge, ChallengeParticipation, ApprovalStatus, ChallengeStatus,
    Badge, EmployeeBadge, Reward, RewardRedemption, User, ESGConfig
)
from app.schemas.schemas import (
    ChallengeCreate, ChallengeOut, ChallengeStatusUpdate, ChallengeParticipationCreate,
    ChallengeProgressUpdate, ChallengeParticipationOut, BadgeCreate, BadgeOut,
    RewardCreate, RewardOut, LeaderboardEntry
)
from app.deps import get_current_user, require_admin, require_admin_or_head
from app.services.points_service import award_points
from app.services.audit_service import log_action
from app.services.scoring_service import recalculate_department_scores

router = APIRouter(tags=["Gamification"])

VALID_TRANSITIONS = {
    ChallengeStatus.draft: {ChallengeStatus.active, ChallengeStatus.archived},
    ChallengeStatus.active: {ChallengeStatus.under_review, ChallengeStatus.archived},
    ChallengeStatus.under_review: {ChallengeStatus.completed, ChallengeStatus.archived},
    ChallengeStatus.completed: {ChallengeStatus.archived},
    ChallengeStatus.archived: set(),
}


# ---- Challenges ----
@router.post("/gamification/challenges", response_model=ChallengeOut)
def create_challenge(payload: ChallengeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    challenge = Challenge(**payload.model_dump())
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    log_action(db, current_user.id, "create", "Challenge", challenge.id, {"title": challenge.title})
    return challenge


@router.get("/gamification/challenges", response_model=list[ChallengeOut])
def list_challenges(status: str | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.query(Challenge)
    if status:
        q = q.filter(Challenge.status == status)
    return q.all()


@router.put("/gamification/challenges/{challenge_id}/status", response_model=ChallengeOut)
def update_challenge_status(challenge_id: int, payload: ChallengeStatusUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    challenge = db.query(Challenge).get(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    new_status = ChallengeStatus(payload.status)
    if new_status not in VALID_TRANSITIONS[challenge.status]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition {challenge.status.value} -> {new_status.value}",
        )
    challenge.status = new_status
    db.commit()
    db.refresh(challenge)
    log_action(db, current_user.id, "update_status", "Challenge", challenge.id, {"status": new_status.value})
    return challenge


# ---- Challenge Participation ----
@router.post("/gamification/challenge-participations", response_model=ChallengeParticipationOut)
def join_challenge(payload: ChallengeParticipationCreate, db: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    challenge = db.query(Challenge).get(payload.challenge_id)
    if not challenge or challenge.status != ChallengeStatus.active:
        raise HTTPException(status_code=400, detail="Challenge is not active")
    existing = db.query(ChallengeParticipation).filter(
        ChallengeParticipation.challenge_id == payload.challenge_id,
        ChallengeParticipation.employee_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this challenge")
    cp = ChallengeParticipation(challenge_id=payload.challenge_id, employee_id=current_user.id)
    db.add(cp)
    db.commit()
    db.refresh(cp)
    log_action(db, current_user.id, "join", "Challenge", challenge.id)
    return cp


@router.put("/gamification/challenge-participations/{cp_id}/progress", response_model=ChallengeParticipationOut)
def update_progress(cp_id: int, payload: ChallengeProgressUpdate, db: Session = Depends(get_db),
                     current_user: User = Depends(get_current_user)):
    cp = db.query(ChallengeParticipation).get(cp_id)
    if not cp or cp.employee_id != current_user.id:
        raise HTTPException(status_code=404, detail="Participation not found")
    cp.progress = payload.progress
    if payload.proof_url:
        cp.proof_url = payload.proof_url
    db.commit()
    db.refresh(cp)
    log_action(db, current_user.id, "update_progress", "ChallengeParticipation", cp.id, {"progress": payload.progress})
    return cp


@router.put("/gamification/challenge-participations/{cp_id}/decision", response_model=ChallengeParticipationOut)
def decide_challenge_participation(cp_id: int, approve: bool, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    cp = db.query(ChallengeParticipation).get(cp_id)
    if not cp:
        raise HTTPException(status_code=404, detail="Participation not found")
    challenge = db.query(Challenge).get(cp.challenge_id)

    cfg = db.query(ESGConfig).first()
    evidence_required_globally = bool(cfg and cfg.evidence_requirement)

    if approve and evidence_required_globally and challenge.evidence_required and not cp.proof_url:
        raise HTTPException(status_code=400, detail="Proof is required before approval")

    cp.approval = ApprovalStatus.approved if approve else ApprovalStatus.rejected
    if approve:
        cp.xp_awarded = challenge.xp
    db.commit()
    db.refresh(cp)

    from app.services.notification_service import notify
    notify(db, cp.employee_id, "challenge_decision",
           f"Your challenge participation was {'approved' if approve else 'rejected'}.")

    log_action(db, current_user.id, "decide_participation", "ChallengeParticipation", cp.id, {"status": cp.approval.value})

    if approve:
        award_points(db, cp.employee_id, challenge.xp, f"completing '{challenge.title}'")
        # Event-driven Score Recalculation
        recalculate_department_scores(db)
    return cp


@router.get("/gamification/challenge-participations/mine", response_model=list[ChallengeParticipationOut])
def my_challenge_participations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ChallengeParticipation).filter(ChallengeParticipation.employee_id == current_user.id).all()


@router.get("/gamification/challenge-participations", response_model=list[ChallengeParticipationOut], dependencies=[Depends(require_admin_or_head)])
def all_challenge_participations(status: str | None = None, db: Session = Depends(get_db)):
    q = db.query(ChallengeParticipation)
    if status:
        q = q.filter(ChallengeParticipation.approval == status)
    return q.all()


# ---- Badges ----
@router.post("/gamification/badges", response_model=BadgeOut)
def create_badge(payload: BadgeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    badge = Badge(**payload.model_dump())
    db.add(badge)
    db.commit()
    db.refresh(badge)
    log_action(db, current_user.id, "create", "Badge", badge.id, {"name": badge.name})
    return badge


@router.get("/gamification/badges", response_model=list[BadgeOut])
def list_badges(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Badge).all()


@router.get("/gamification/employees/{employee_id}/badges", response_model=list[BadgeOut])
def employee_badges(employee_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    badge_ids = [eb.badge_id for eb in db.query(EmployeeBadge).filter(EmployeeBadge.employee_id == employee_id)]
    return db.query(Badge).filter(Badge.id.in_(badge_ids)).all()


# ---- Rewards ----
@router.post("/gamification/rewards", response_model=RewardOut)
def create_reward(payload: RewardCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    reward = Reward(**payload.model_dump())
    db.add(reward)
    db.commit()
    db.refresh(reward)
    log_action(db, current_user.id, "create", "Reward", reward.id, {"name": reward.name, "points": reward.points_required})
    return reward


@router.get("/gamification/rewards", response_model=list[RewardOut])
def list_rewards(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Reward).all()


@router.post("/gamification/rewards/{reward_id}/redeem")
def redeem_reward(reward_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reward = db.query(Reward).get(reward_id)
    if not reward or reward.status != "active":
        raise HTTPException(status_code=404, detail="Reward not available")
    if reward.stock <= 0:
        raise HTTPException(status_code=400, detail="Reward out of stock")
    if current_user.xp_points < reward.points_required:
        raise HTTPException(status_code=400, detail="Not enough points")

    current_user.xp_points -= reward.points_required
    reward.stock -= 1
    redemption = RewardRedemption(
        employee_id=current_user.id, reward_id=reward_id, points_spent=reward.points_required
    )
    db.add(redemption)
    db.commit()

    from app.services.notification_service import notify
    notify(db, current_user.id, "reward_redeemed", f"You redeemed '{reward.name}'.")
    log_action(db, current_user.id, "redeem_reward", "Reward", reward.id, {"points_spent": reward.points_required})
    
    # Event-driven Score Recalculation
    recalculate_department_scores(db)

    return {"detail": "Reward redeemed", "remaining_points": current_user.xp_points}


# ---- Leaderboard ----
@router.get("/gamification/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(department_id: int | None = None, limit: int = 20, db: Session = Depends(get_db),
                 _: User = Depends(get_current_user)):
    q = db.query(User)
    if department_id:
        q = q.filter(User.department_id == department_id)
    users = q.order_by(User.xp_points.desc()).limit(limit).all()
    return [
        LeaderboardEntry(
            employee_id=u.id, full_name=u.full_name, xp_points=u.xp_points,
            department_name=u.department.name if u.department else None,
        )
        for u in users
    ]
