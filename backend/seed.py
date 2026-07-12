"""
Seed script — populates the database with realistic demo data so the app
never demos empty (departments, employees, CSR activities, a challenge,
an overdue compliance issue, badges, rewards).

Run with:  python seed.py   (from inside backend/, with venv activated)
"""
from datetime import date, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import (
    Department, User, RoleEnum, Category, EmissionFactor, SustainabilityGoal,
    CSRActivity, Challenge, ChallengeStatus, Badge, Reward, ESGPolicy,
    Audit, ComplianceIssue, ESGConfig,
)

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(User).count() > 0:
    print("Database already has data. Skipping seed.")
else:
    # Departments
    eng = Department(name="Engineering", code="ENG", employee_count=0)
    sales = Department(name="Sales", code="SALES", employee_count=0)
    ops = Department(name="Operations", code="OPS", employee_count=0)
    db.add_all([eng, sales, ops])
    db.commit()

    # Users
    admin = User(email="admin@ecosphere.io", full_name="Ava Admin",
                 hashed_password=hash_password("Admin123!"), role=RoleEnum.admin)
    head = User(email="head.eng@ecosphere.io", full_name="Priya Sharma",
                hashed_password=hash_password("Head123!"), role=RoleEnum.department_head,
                department_id=eng.id)
    emp1 = User(email="raj@ecosphere.io", full_name="Raj Verma",
                hashed_password=hash_password("Employee123!"), role=RoleEnum.employee,
                department_id=eng.id)
    emp2 = User(email="mei@ecosphere.io", full_name="Mei Chen",
                hashed_password=hash_password("Employee123!"), role=RoleEnum.employee,
                department_id=sales.id)
    db.add_all([admin, head, emp1, emp2])
    db.commit()

    eng.employee_count = 2
    sales.employee_count = 1
    db.commit()

    # ESG Config (default weights already 40/30/30)
    db.add(ESGConfig())

    # Categories
    csr_cat = Category(name="Environment Cleanup", type="csr_activity")
    challenge_cat = Category(name="Energy Saving", type="challenge")
    db.add_all([csr_cat, challenge_cat])
    db.commit()

    # Emission Factors
    db.add_all([
        EmissionFactor(source_type="fleet", unit="liter_diesel", co2_per_unit=2.68),
        EmissionFactor(source_type="expense", unit="kwh", co2_per_unit=0.82),
    ])

    # Sustainability Goal
    db.add(SustainabilityGoal(department_id=eng.id, metric="CO2 reduction (kg)",
                               target_value=1000, current_value=350,
                               deadline=date.today() + timedelta(days=90)))

    # CSR Activity
    db.add(CSRActivity(title="Riverbank Cleanup Drive", category_id=csr_cat.id,
                        date=date.today() + timedelta(days=14),
                        description="Community river cleanup event.", evidence_required=True))

    # Challenge (active)
    db.add(Challenge(title="Cut office energy use by 10%", category_id=challenge_cat.id,
                      description="Reduce your team's measured energy consumption by 10% this month.",
                      xp=150, difficulty="medium", evidence_required=True,
                      deadline=date.today() + timedelta(days=30), status=ChallengeStatus.active))

    # Badges
    db.add_all([
        Badge(name="Green Starter", description="Earn your first 50 XP.",
              unlock_rule={"type": "xp", "min": 50}, icon="🌱"),
        Badge(name="Challenge Champion", description="Complete 3 challenges.",
              unlock_rule={"type": "challenges_completed", "min": 3}, icon="🏆"),
    ])

    # Rewards
    db.add_all([
        Reward(name="Eco Water Bottle", description="Reusable stainless steel bottle.",
               points_required=100, stock=25),
        Reward(name="Extra Day Off", description="One additional paid day off.",
               points_required=500, stock=10),
    ])

    # Policy
    policy = ESGPolicy(title="Code of Conduct v2", version="2.0", effective_date=date.today())
    db.add(policy)
    db.commit()

    # Audit + an overdue Compliance Issue (so the dashboard never looks empty)
    audit = Audit(scope="Q2 Governance Review", department_id=ops.id, status="completed",
                   date_range_start=date.today() - timedelta(days=60),
                   date_range_end=date.today() - timedelta(days=30))
    db.add(audit)
    db.commit()

    db.add(ComplianceIssue(audit_id=audit.id, department_id=ops.id, severity="high",
                            description="Missing fire-safety inspection record.",
                            owner_id=head.id, due_date=date.today() - timedelta(days=5)))

    db.commit()
    print("Seed complete.")
    print("Login as admin:        admin@ecosphere.io / Admin123!")
    print("Login as dept head:    head.eng@ecosphere.io / Head123!")
    print("Login as employee:     raj@ecosphere.io / Employee123!")

db.close()
