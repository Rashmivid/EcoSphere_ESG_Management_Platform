from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Department, Category, User, RoleEnum
from app.schemas.schemas import DepartmentCreate, DepartmentOut, CategoryCreate, CategoryOut, UserOut
from app.deps import get_current_user, require_admin

router = APIRouter(tags=["Organization"])


# ---- Departments ----
@router.post("/org/departments", response_model=DepartmentOut, dependencies=[Depends(require_admin)])
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db)):
    if db.query(Department).filter(Department.code == payload.code).first():
        raise HTTPException(status_code=400, detail="Department code already exists")
    dept = Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("/org/departments", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Department).all()


@router.get("/org/departments/{dept_id}", response_model=DepartmentOut)
def get_department(dept_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    dept = db.query(Department).get(dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@router.put("/org/departments/{dept_id}", response_model=DepartmentOut, dependencies=[Depends(require_admin)])
def update_department(dept_id: int, payload: DepartmentCreate, db: Session = Depends(get_db)):
    dept = db.query(Department).get(dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for k, v in payload.model_dump().items():
        setattr(dept, k, v)
    db.commit()
    db.refresh(dept)
    return dept


# ---- Categories ----
@router.post("/org/categories", response_model=CategoryOut, dependencies=[Depends(require_admin)])
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    cat = Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.get("/org/categories", response_model=list[CategoryOut])
def list_categories(type: str | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    q = db.query(Category)
    if type:
        q = q.filter(Category.type == type)
    return q.all()


# ---- Employee directory ----
@router.get("/org/employees", response_model=list[UserOut])
def list_employees(department_id: int | None = None, db: Session = Depends(get_db),
                    _: User = Depends(get_current_user)):
    q = db.query(User)
    if department_id:
        q = q.filter(User.department_id == department_id)
    return q.all()


@router.put("/org/employees/{user_id}/role", response_model=UserOut, dependencies=[Depends(require_admin)])
def set_role(user_id: int, role: RoleEnum, db: Session = Depends(get_db)):
    """Admin-only promotion path -- e.g. Employee -> Department Head."""
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    db.refresh(user)
    return user
