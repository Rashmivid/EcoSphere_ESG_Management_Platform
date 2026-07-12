from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.models import EmissionFactor, CarbonTransaction, SustainabilityGoal, User, ESGConfig, ProductESGProfile
from app.schemas.schemas import (
    EmissionFactorCreate, EmissionFactorOut, CarbonTransactionCreate, CarbonTransactionOut,
    GoalCreate, GoalOut, ProductESGProfileCreate, ProductESGProfileOut
)
from app.deps import get_current_user, require_admin, require_admin_or_head
from app.services.audit_service import log_action
from app.services.scoring_service import recalculate_department_scores

router = APIRouter(prefix="/environmental", tags=["Environmental"])


@router.post("/emission-factors", response_model=EmissionFactorOut)
def create_emission_factor(payload: EmissionFactorCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    ef = EmissionFactor(**payload.model_dump())
    db.add(ef)
    db.commit()
    db.refresh(ef)
    log_action(db, current_user.id, "create", "EmissionFactor", ef.id, {"source_type": ef.source_type, "co2_per_unit": ef.co2_per_unit})
    return ef


@router.get("/emission-factors", response_model=list[EmissionFactorOut])
def list_emission_factors(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(EmissionFactor).all()


@router.post("/carbon-transactions", response_model=CarbonTransactionOut)
def create_carbon_transaction(payload: CarbonTransactionCreate, db: Session = Depends(get_db),
                               current_user: User = Depends(get_current_user)):
    factor = db.query(EmissionFactor).get(payload.emission_factor_id)
    if not factor:
        raise HTTPException(status_code=400, detail="Invalid emission_factor_id")
    
    cfg = db.query(ESGConfig).first()
    auto = bool(cfg and cfg.auto_emission_calculation)

    calculated_co2 = payload.amount * factor.co2_per_unit
    tx = CarbonTransaction(
        department_id=payload.department_id,
        source_type=payload.source_type,
        source_record_id=payload.source_record_id,
        emission_factor_id=payload.emission_factor_id,
        amount=payload.amount,
        calculated_co2=calculated_co2,
        date=payload.date or date.today(),
        auto_calculated=auto,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    
    log_action(db, current_user.id, "create", "CarbonTransaction", tx.id, {"co2": calculated_co2})
    # Event-driven Score Recalculation
    recalculate_department_scores(db)
    return tx


@router.get("/carbon-transactions", response_model=list[CarbonTransactionOut])
def list_carbon_transactions(department_id: int | None = None, db: Session = Depends(get_db),
                              _: User = Depends(get_current_user)):
    q = db.query(CarbonTransaction)
    if department_id:
        q = q.filter(CarbonTransaction.department_id == department_id)
    return q.order_by(CarbonTransaction.date.desc()).all()


@router.get("/carbon-transactions/rollup")
def carbon_rollup(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    """Department Carbon Tracking: total CO2 per department."""
    rows = (
        db.query(CarbonTransaction.department_id, func.sum(CarbonTransaction.calculated_co2))
        .group_by(CarbonTransaction.department_id)
        .all()
    )
    return [{"department_id": r[0], "total_co2": float(r[1] or 0)} for r in rows]


@router.post("/goals", response_model=GoalOut)
def create_goal(payload: GoalCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    goal = SustainabilityGoal(**payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    log_action(db, current_user.id, "create", "SustainabilityGoal", goal.id, {"metric": goal.metric, "target": goal.target_value})
    return goal


@router.get("/goals", response_model=list[GoalOut])
def list_goals(department_id: int | None = None, db: Session = Depends(get_db),
               _: User = Depends(get_current_user)):
    q = db.query(SustainabilityGoal)
    if department_id:
        q = q.filter(SustainabilityGoal.department_id == department_id)
    return q.all()


@router.put("/goals/{goal_id}/progress", response_model=GoalOut)
def update_goal_progress(goal_id: int, current_value: float, db: Session = Depends(get_db),
                          current_user: User = Depends(get_current_user)):
    goal = db.query(SustainabilityGoal).get(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal.current_value = current_value
    db.commit()
    db.refresh(goal)
    
    log_action(db, current_user.id, "update_progress", "SustainabilityGoal", goal.id, {"current_value": current_value})
    # Event-driven Score Recalculation
    recalculate_department_scores(db)
    return goal


# ---- Product ESG Profile Endpoints (spec-required) ----
@router.post("/product-profiles", response_model=ProductESGProfileOut)
def create_product_profile(payload: ProductESGProfileCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_head)):
    # Check if profile already exists for this product ID
    p = db.query(ProductESGProfile).filter(ProductESGProfile.product_id == payload.product_id).first()
    if p:
        p.product_name = payload.product_name
        p.esg_attributes = payload.esg_attributes
    else:
        p = ProductESGProfile(**payload.model_dump())
        db.add(p)
    db.commit()
    db.refresh(p)
    log_action(db, current_user.id, "create", "ProductESGProfile", p.id, {"product_id": payload.product_id})
    return p


@router.get("/product-profiles", response_model=list[ProductESGProfileOut])
def list_product_profiles(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(ProductESGProfile).all()


# ---- ERP Simulation Endpoint (spec-required Auto Emission Calculation flow) ----
@router.post("/simulate-erp-transaction")
def simulate_erp_transaction(
    source_type: str, # purchase | manufacturing | expense | fleet
    amount: float,
    department_id: int,
    source_record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Simulates an ERP business operation (e.g. Purchase, manufacturing, expense, fleet).
    If auto_emission_calculation toggle is enabled in settings, it automatically calculates
    and logs a corresponding CarbonTransaction in real-time."""
    cfg = db.query(ESGConfig).first()
    if not cfg or not cfg.auto_emission_calculation:
        return {"detail": "Auto Emission Calculation is disabled in configuration settings."}

    # Find the corresponding emission factor
    factor = db.query(EmissionFactor).filter(EmissionFactor.source_type == source_type).first()
    if not factor:
        raise HTTPException(status_code=400, detail=f"No default emission factor configured for source type: {source_type}")

    calculated_co2 = amount * factor.co2_per_unit
    tx = CarbonTransaction(
        department_id=department_id,
        source_type=source_type,
        source_record_id=source_record_id,
        emission_factor_id=factor.id,
        amount=amount,
        calculated_co2=calculated_co2,
        date=date.today(),
        auto_calculated=True,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    log_action(db, current_user.id, "auto_calculate_emission", "CarbonTransaction", tx.id, {"source": source_type, "co2": calculated_co2})
    # Event-driven Score Recalculation
    recalculate_department_scores(db)

    return {"detail": "ERP transaction simulated and carbon emissions calculated automatically.", "transaction": tx}
