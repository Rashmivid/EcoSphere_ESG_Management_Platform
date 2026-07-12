from datetime import datetime
from datetime import date as Date   # aliased to avoid collision with fields named 'date'
from typing import Optional, Any
from pydantic import BaseModel, EmailStr


class ORMBase(BaseModel):
    class Config:
        from_attributes = True


# ---- Auth ----
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    department_id: Optional[int] = None


class UserOut(ORMBase):
    id: int
    email: EmailStr
    full_name: str
    role: str
    department_id: Optional[int] = None
    xp_points: int


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---- Department / Category ----
class DepartmentCreate(BaseModel):
    name: str
    code: str
    head_id: Optional[int] = None
    parent_department_id: Optional[int] = None


class DepartmentOut(DepartmentCreate, ORMBase):
    id: int
    employee_count: int
    status: str


class CategoryCreate(BaseModel):
    name: str
    type: str


class CategoryOut(CategoryCreate, ORMBase):
    id: int
    status: str


# ---- Environmental ----
class EmissionFactorCreate(BaseModel):
    source_type: str
    unit: str
    co2_per_unit: float


class EmissionFactorOut(EmissionFactorCreate, ORMBase):
    id: int


class CarbonTransactionCreate(BaseModel):
    department_id: int
    source_type: str
    source_record_id: Optional[str] = None
    emission_factor_id: int
    amount: float
    date: Optional[Date] = None


class CarbonTransactionOut(ORMBase):
    id: int
    department_id: int
    source_type: str
    emission_factor_id: int
    amount: float
    calculated_co2: float
    date: Optional[Date]
    auto_calculated: bool


class GoalCreate(BaseModel):
    department_id: int
    metric: str
    target_value: float
    deadline: Optional[Date] = None


class GoalOut(GoalCreate, ORMBase):
    id: int
    current_value: float


# ---- Social ----
class CSRActivityCreate(BaseModel):
    title: str
    category_id: Optional[int] = None
    date: Optional[Date] = None
    description: Optional[str] = None
    evidence_required: bool = True


class CSRActivityOut(CSRActivityCreate, ORMBase):
    id: int


class ParticipationCreate(BaseModel):
    activity_id: int


class ParticipationSubmitProof(BaseModel):
    proof_url: str


class ParticipationDecision(BaseModel):
    approve: bool


class ParticipationOut(ORMBase):
    id: int
    employee_id: int
    activity_id: int
    proof_url: Optional[str]
    approval_status: str
    points_earned: int
    completion_date: Optional[datetime]


# ---- Governance ----
class PolicyCreate(BaseModel):
    title: str
    version: str = "1.0"
    document_url: Optional[str] = None
    effective_date: Optional[Date] = None


class PolicyOut(PolicyCreate, ORMBase):
    id: int


class AuditCreate(BaseModel):
    scope: str
    department_id: Optional[int] = None
    auditor_ids: list[int] = []
    date_range_start: Optional[Date] = None
    date_range_end: Optional[Date] = None


class AuditOut(ORMBase):
    id: int
    scope: str
    department_id: Optional[int]
    auditor_ids: list[int]
    date_range_start: Optional[Date]
    date_range_end: Optional[Date]
    status: str


class ComplianceIssueCreate(BaseModel):
    audit_id: Optional[int] = None
    department_id: Optional[int] = None
    severity: str = "medium"
    description: str
    owner_id: int
    due_date: Date


class ComplianceIssueOut(ComplianceIssueCreate, ORMBase):
    id: int
    status: str


# ---- Gamification ----
class ChallengeCreate(BaseModel):
    title: str
    category_id: Optional[int] = None
    description: Optional[str] = None
    xp: int = 0
    difficulty: str = "easy"
    evidence_required: bool = True
    deadline: Optional[Date] = None


class ChallengeOut(ChallengeCreate, ORMBase):
    id: int
    status: str


class ChallengeStatusUpdate(BaseModel):
    status: str


class ChallengeParticipationCreate(BaseModel):
    challenge_id: int


class ChallengeProgressUpdate(BaseModel):
    progress: float
    proof_url: Optional[str] = None


class ChallengeParticipationOut(ORMBase):
    id: int
    challenge_id: int
    employee_id: int
    progress: float
    proof_url: Optional[str]
    approval: str
    xp_awarded: int


class BadgeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    unlock_rule: dict[str, Any]
    icon: Optional[str] = None


class BadgeOut(BadgeCreate, ORMBase):
    id: int


class RewardCreate(BaseModel):
    name: str
    description: Optional[str] = None
    points_required: int
    stock: int = 0


class RewardOut(RewardCreate, ORMBase):
    id: int
    status: str


class LeaderboardEntry(BaseModel):
    employee_id: int
    full_name: str
    xp_points: int
    department_name: Optional[str] = None


# ---- Scoring ----
class ESGConfigUpdate(BaseModel):
    environmental_weight: Optional[float] = None
    social_weight: Optional[float] = None
    governance_weight: Optional[float] = None
    auto_emission_calculation: Optional[bool] = None
    evidence_requirement: Optional[bool] = None
    badge_auto_award: Optional[bool] = None


class ESGConfigOut(ORMBase):
    id: int
    environmental_weight: float
    social_weight: float
    governance_weight: float
    auto_emission_calculation: bool
    evidence_requirement: bool
    badge_auto_award: bool


class DepartmentScoreOut(ORMBase):
    id: int
    department_id: int
    environmental_score: float
    social_score: float
    governance_score: float
    total_score: float
    period: str
    computed_at: datetime


class OverallScoreOut(BaseModel):
    period: str
    overall_score: float
    department_scores: list[DepartmentScoreOut]


# ---- Notifications ----
class NotificationOut(ORMBase):
    id: int
    type: str
    message: str
    read: bool
    created_at: datetime


# ---- Diversity Metrics, Training Completion, and Product ESG Profile ----
class DiversityMetricCreate(BaseModel):
    field: str
    value: Optional[str] = None

class DiversityMetricOut(DiversityMetricCreate, ORMBase):
    id: int
    employee_id: int
    submitted_at: datetime

class TrainingCompletionCreate(BaseModel):
    training_name: str
    employee_id: int
    status: str = "pending"

class TrainingCompletionOut(TrainingCompletionCreate, ORMBase):
    id: int
    completed_at: Optional[datetime]

class ProductESGProfileCreate(BaseModel):
    product_id: str
    product_name: str
    esg_attributes: dict[str, Any] = {}

class ProductESGProfileOut(ProductESGProfileCreate, ORMBase):
    id: int
    created_at: datetime

