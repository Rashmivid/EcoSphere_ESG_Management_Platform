from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import models  # noqa: F401
from app.services.scoring_service import flag_overdue_compliance_issues

from app.routers import auth, org, environmental, social, governance, gamification, scoring, reports, notifications

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-flag overdue compliance issues on startup
    db = SessionLocal()
    try:
        flagged = flag_overdue_compliance_issues(db)
        print(f"Startup check: flagged {len(flagged)} overdue compliance issues.")
    except Exception as e:
        print(f"Error flagging overdue issues on startup: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ESG Management Platform API — Environmental, Social, Governance & Gamification",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(org.router)
app.include_router(environmental.router)
app.include_router(social.router)
app.include_router(governance.router)
app.include_router(gamification.router)
app.include_router(scoring.router)
app.include_router(reports.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "docs": "/docs",
        "status": "ok",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
