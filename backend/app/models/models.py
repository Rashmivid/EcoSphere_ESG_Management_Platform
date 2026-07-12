import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Date,
    Text, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class RoleEnum(str, enum.Enum):
    admin = "admin"
    department_head = "department_head"
    employee = "employee"
    auditor = "auditor"


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ChallengeStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    under_review = "under_review"
    completed = "completed"
    archived = "archived"


class ComplianceStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    overdue = "overdue"


# ---------- Master Data ----------

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    head_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    parent_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    employee_count = Column(Integer, default=0)
    status = Column(String, default="active")

    employees = relationship("User", back_populates="department", foreign_keys="User.department_id")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(RoleEnum), default=RoleEnum.employee)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    xp_points = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # csr_activity | challenge
    status = Column(String, default="active")


class EmissionFactor(Base):
    __tablename__ = "emission_factors"
    id = Column(Integer, primary_key=True)
    source_type = Column(String, nullable=False)  # purchase | manufacturing | expense | fleet
    unit = Column(String, nullable=False)
    co2_per_unit = Column(Float, nullable=False)


class SustainabilityGoal(Base):
    __tablename__ = "sustainability_goals"
    id = Column(Integer, primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    metric = Column(String, nullable=False)
    target_value = Column(Float, nullable=False)
    current_value = Column(Float, default=0)
    deadline = Column(Date, nullable=True)


class ESGPolicy(Base):
    __tablename__ = "esg_policies"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    version = Column(String, default="1.0")
    document_url = Column(String, nullable=True)
    effective_date = Column(Date, nullable=True)


class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    unlock_rule = Column(JSON, nullable=False)  # e.g. {"type": "xp", "min": 100}
    icon = Column(String, nullable=True)


class Reward(Base):
    __tablename__ = "rewards"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    points_required = Column(Integer, nullable=False)
    stock = Column(Integer, default=0)
    status = Column(String, default="active")


# ---------- Transactional Data ----------

class CarbonTransaction(Base):
    __tablename__ = "carbon_transactions"
    id = Column(Integer, primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    source_type = Column(String, nullable=False)
    source_record_id = Column(String, nullable=True)
    emission_factor_id = Column(Integer, ForeignKey("emission_factors.id"))
    amount = Column(Float, nullable=False)
    calculated_co2 = Column(Float, nullable=False)
    date = Column(Date, default=datetime.utcnow)
    auto_calculated = Column(Boolean, default=False)


class CSRActivity(Base):
    __tablename__ = "csr_activities"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    evidence_required = Column(Boolean, default=True)


class EmployeeParticipation(Base):
    __tablename__ = "employee_participations"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    activity_id = Column(Integer, ForeignKey("csr_activities.id"))
    proof_url = Column(String, nullable=True)
    approval_status = Column(SAEnum(ApprovalStatus), default=ApprovalStatus.pending)
    points_earned = Column(Integer, default=0)
    completion_date = Column(DateTime, nullable=True)


class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    description = Column(Text, nullable=True)
    xp = Column(Integer, default=0)
    difficulty = Column(String, default="easy")
    evidence_required = Column(Boolean, default=True)
    deadline = Column(Date, nullable=True)
    status = Column(SAEnum(ChallengeStatus), default=ChallengeStatus.draft)


class ChallengeParticipation(Base):
    __tablename__ = "challenge_participations"
    id = Column(Integer, primary_key=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"))
    employee_id = Column(Integer, ForeignKey("users.id"))
    progress = Column(Float, default=0)
    proof_url = Column(String, nullable=True)
    approval = Column(SAEnum(ApprovalStatus), default=ApprovalStatus.pending)
    xp_awarded = Column(Integer, default=0)


class EmployeeBadge(Base):
    __tablename__ = "employee_badges"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    badge_id = Column(Integer, ForeignKey("badges.id"))
    awarded_at = Column(DateTime, default=datetime.utcnow)


class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    reward_id = Column(Integer, ForeignKey("rewards.id"))
    points_spent = Column(Integer, nullable=False)
    redeemed_at = Column(DateTime, default=datetime.utcnow)


class PolicyAcknowledgement(Base):
    __tablename__ = "policy_acknowledgements"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    policy_id = Column(Integer, ForeignKey("esg_policies.id"))
    acknowledged_at = Column(DateTime, nullable=True)


class Audit(Base):
    __tablename__ = "audits"
    id = Column(Integer, primary_key=True)
    scope = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    auditor_ids = Column(JSON, default=list)
    date_range_start = Column(Date, nullable=True)
    date_range_end = Column(Date, nullable=True)
    status = Column(String, default="planned")


class ComplianceIssue(Base):
    __tablename__ = "compliance_issues"
    id = Column(Integer, primary_key=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    severity = Column(String, default="medium")  # low | medium | high | critical
    description = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(SAEnum(ComplianceStatus), default=ComplianceStatus.open)


class DepartmentScore(Base):
    __tablename__ = "department_scores"
    id = Column(Integer, primary_key=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    environmental_score = Column(Float, default=0)
    social_score = Column(Float, default=0)
    governance_score = Column(Float, default=0)
    total_score = Column(Float, default=0)
    period = Column(String, nullable=False)  # e.g. "2026-07"
    computed_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ESGConfig(Base):
    __tablename__ = "esg_config"
    id = Column(Integer, primary_key=True)
    environmental_weight = Column(Float, default=0.4)
    social_weight = Column(Float, default=0.3)
    governance_weight = Column(Float, default=0.3)
    auto_emission_calculation = Column(Boolean, default=False)
    evidence_requirement = Column(Boolean, default=True)
    badge_auto_award = Column(Boolean, default=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(JSON, nullable=True)


# ---------- Social: Diversity & Training (spec-required) ----------

class DiversityMetric(Base):
    __tablename__ = "diversity_metrics"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    field = Column(String, nullable=False)   # e.g. "gender", "nationality" — kept generic/optional
    value = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)


class TrainingCompletion(Base):
    __tablename__ = "training_completions"
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    training_name = Column(String, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String, default="pending")   # pending | completed


# ---------- Master Data: Product ESG Profile (spec-required) ----------

class ProductESGProfile(Base):
    __tablename__ = "product_esg_profiles"
    id = Column(Integer, primary_key=True)
    product_id = Column(String, nullable=False, unique=True)  # external ERP product ID
    product_name = Column(String, nullable=False)
    esg_attributes = Column(JSON, default=dict)  # flexible JSONB for ESG metadata
    created_at = Column(DateTime, default=datetime.utcnow)

