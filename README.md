<div align="center">

# 🌍 EcoSphere ESG Management Platform

**Transform sustainability into a game your team actually wants to play.**

A full-stack ESG (Environmental · Social · Governance) management platform with real-time dashboards, automated weighted scoring, event-driven notifications, and a fully gamified arena — complete with XP, badges, leaderboards, and a reward store.

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=for-the-badge&logo=python&logoColor=white)](https://www.sqlalchemy.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Local%20Dev-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<br/>

> 🚀 **Live API Docs (Swagger)** → [`http://localhost:8000/docs`](http://localhost:8000/docs)
> 🖥️ **Frontend App** → [`http://localhost:5173`](http://localhost:5173)
> ❤️ **Demo** → [`https://drive.google.com/file/d/1kIYUQJ4WbVF6-HM3zy1tjnwn6JojkwD6/view?usp=sharing)

</div>

---
<img width="959" height="428" alt="Screenshot 2026-07-12 141805" src="https://github.com/user-attachments/assets/dabd6dac-4bf4-4215-9552-7f18c3dfabf1" />
<img width="956" height="436" alt="Screenshot 2026-07-12 141733" src="https://github.com/user-attachments/assets/4cb58fa8-a5dc-4c88-be17-ce605a4b9f82" />
<img width="959" height="446" alt="Screenshot 2026-07-12 141822" src="https://github.com/user-attachments/assets/1a6ff00f-ad19-4102-9b4c-6b8cafdbbce7" />
<img width="959" height="440" alt="Screenshot 2026-07-12 141837" src="https://github.com/user-attachments/assets/6fca28e5-b203-4b27-b058-5fa3044e48ad" />


## 📋 Table of Contents

- [✨ What is EcoSphere?](#-what-is-ecosphere)
- [🎮 Feature Modules](#-feature-modules)
- [🏗 System Architecture](#-system-architecture)
- [⚙️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start — Local Setup](#-quick-start--local-setup)
- [🐳 Docker Setup](#-docker-setup)
- [👤 Demo Accounts](#-demo-accounts)
- [🔌 API Reference](#-api-reference)
- [🌱 Environment Variables](#-environment-variables)
- [🗄️ Database Models](#️-database-models)
- [⚡ Business Rules & Scoring Engine](#-business-rules--scoring-engine)
- [🔄 Event-Driven Flows](#-event-driven-flows)
- [🤝 Collaborators](#-collaborators)

---

## ✨ What is EcoSphere?

EcoSphere is a **production-grade ESG management platform** built for organizations that want to measure, track, and improve their sustainability performance — without the spreadsheets. It integrates ESG metrics directly into daily employee workflows via:

- 🌿 **Environmental** — Log carbon emissions, track sustainability goals, simulate ERP transactions with auto CO₂ calculation.
- 🤝 **Social** — Manage CSR missions, diversity metrics, and training completions with photo proof verification.
- ⚖️ **Governance** — Issue ESG policies, track employee acknowledgements, manage compliance audits.
- 🎮 **Gamification** — A full Game Arena with XP, challenge quests, badge auto-unlocking, leaderboards, and a reward store.
- 📊 **Intel Reports** — Auto-generated Environmental, Social, Governance, and ESG Summary reports.
- 🔔 **Notifications** — Real-time in-app alerts for badges, overdue compliance, and approvals.

---
## 👥 Who Uses EcoSphere & Project Scope

EcoSphere is designed for **entire organizations** — from executive directors to individual contributors. Every role has a dedicated access level with tailored views and permissions.

| Role | Real-World Title | Key Responsibilities | Primary Pages |
|---|---|---|---|
| 🔴 **Admin** | Sustainability Director / ESG Officer | Configure org-wide ESG weights, create departments, set emission factors, create CSR missions & quests, view all reports, manage audit logs | Admin · Environmental · Game Arena · Intel Reports |
| 🟠 **Department Head** | Team Lead / Floor Manager | Review & approve/reject employee CSR photo proofs, approve quest completions (awards XP), generate department reports | Social · Game Arena · Intel Reports · Dashboard |
| 🟢 **Employee** | Any staff member | Log daily carbon usage, join CSR missions & upload photo proof, accept game quests, earn XP & badges, redeem rewards, track rank on leaderboard | Environmental · Social · Game Arena · Dashboard |
| 🔵 **Auditor** | External Compliance Auditor | Read-only inspection of policies, compliance issues, acknowledgements, and the full immutable audit trail | Governance · Intel Reports |

> 💡 **Monthly Cycle:** Admin sets targets → Employees log & participate → Heads approve evidence → Scores recalculate instantly → Leadership exports Intel Reports for board presentation → Auditors verify the audit trail.

---
## 🎮 Feature Modules

| Module | Page File | Description |
|---|---|---|
| 🏠 **Dashboard** | `frontend/src/pages/Dashboard.jsx` | Live ESG score cards, E/S/G trend charts, department ranking, notification feed |
| 🌿 **Environmental** | `frontend/src/pages/Environmental.jsx` | Emission factors, carbon transaction logger, sustainability goals, ERP simulator with auto CO₂ |
| 🤝 **Social** | `frontend/src/pages/Social.jsx` | CSR activity management, Base64 photo proof uploads, diversity metrics, training completions, manager approvals |
| ⚖️ **Governance** | `frontend/src/pages/Governance.jsx` | ESG policy library, employee acknowledgements, compliance issue tracker, audit log viewer |
| 🎮 **Gamification** | `frontend/src/pages/Gamification.jsx` | Arena lobby → quest board (Easy/Medium/Hard/Epic), challenge participation with photo proof, XP leaderboard, badge showcase, reward redemption |
| 📊 **Reports** | `frontend/src/pages/Reports.jsx` | On-demand Intel reports (Environmental, Social, Governance, ESG Summary) |
| ⚙️ **Admin** | `frontend/src/pages/Admin.jsx` | Department & category management, ESG weight configuration (E/S/G %), global settings |
| 🔐 **Auth** | `frontend/src/pages/Login.jsx` · `Signup.jsx` | Animated particle login, JWT sessions, role-based access control |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER / USER                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         React 18 + Vite 5   (http://localhost:5173)          │   │
│  │                                                              │   │
│  │   AuthContext (JWT) ── Axios client ── React Router v6       │   │
│  │                                                              │   │
│  │   Pages: Dashboard · Environmental · Social · Governance     │   │
│  │          Gamification · Reports · Admin · Login · Signup     │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────────────┘
                              │  REST API  (JSON over HTTP)
                              │  Bearer JWT in Authorization header
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│               FastAPI 0.111  (http://localhost:8000)                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────────────┐  │
│  │  CORS       │  │  JWT Auth   │  │  RBAC Dependency Guards    │  │
│  │  Middleware │  │  Middleware │  │  (admin / head / employee) │  │
│  └─────────────┘  └─────────────┘  └────────────────────────────┘  │
│                                                                     │
│  Routers: auth · org · environmental · social · governance          │
│           gamification · scoring · reports · notifications          │
│                                                                     │
│  Services:                                                          │
│  ├── scoring_service.py     (event-driven E/S/G score recalc)       │
│  ├── badge_service.py       (XP-triggered badge auto-award)         │
│  ├── points_service.py      (XP credit/debit on approve/redeem)     │
│  ├── audit_service.py       (write-once immutable audit trail)      │
│  └── notification_service   (in-app notification fan-out)           │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  SQLAlchemy ORM
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│           SQLite (dev)   ·   PostgreSQL 15+ (production)            │
│                                                                     │
│  Users · Departments · CarbonTransactions · CSRActivities           │
│  Challenges · Badges · Rewards · ESGPolicies · ComplianceIssues     │
│  DepartmentScores · ESGConfig · AuditLogs · Notifications           │
│  DiversityMetrics · TrainingCompletions · ProductESGProfiles        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

### 🐍 Backend

| Technology | Version | Role | Link |
|---|---|---|---|
| **Python** | 3.11+ | Runtime | [python.org](https://www.python.org/downloads/) |
| **FastAPI** | 0.111.0 | REST API framework with auto OpenAPI docs | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) |
| **SQLAlchemy** | 2.0.30 | ORM & database abstraction layer | [sqlalchemy.org](https://www.sqlalchemy.org/) |
| **Pydantic** | 2.7.1 | Request/response data validation & serialization | [docs.pydantic.dev](https://docs.pydantic.dev/) |
| **Pydantic-Settings** | 2.2.1 | `.env` → typed settings class | [pydantic-settings docs](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) |
| **Uvicorn** | 0.30.1 | ASGI server with `--reload` for dev | [uvicorn.org](https://www.uvicorn.org/) |
| **python-jose** | 3.3.0 | JWT token generation & verification (HS256) | [github.com/mpdavis/python-jose](https://github.com/mpdavis/python-jose) |
| **passlib + bcrypt** | 1.7.4 / 4.0.1 | Secure password hashing | [passlib.readthedocs.io](https://passlib.readthedocs.io/) |
| **python-multipart** | 0.0.9 | Form data parsing (OAuth2 password flow) | [pypi.org](https://pypi.org/project/python-multipart/) |
| **email-validator** | 2.1.1 | Pydantic `EmailStr` field validation | [pypi.org](https://pypi.org/project/email-validator/) |
| **alembic** | 1.13.1 | Database schema migrations | [alembic.sqlalchemy.org](https://alembic.sqlalchemy.org/) |
| **python-dotenv** | 1.0.1 | Load `.env` at runtime | [pypi.org](https://pypi.org/project/python-dotenv/) |
| **SQLite** | built-in | Zero-config local dev database | [sqlite.org](https://www.sqlite.org/) |
| **PostgreSQL** | 15+ | Production-grade relational database | [postgresql.org](https://www.postgresql.org/) |

### ⚛️ Frontend

| Technology | Version | Role | Link |
|---|---|---|---|
| **React** | 18+ | UI component framework | [react.dev](https://react.dev/) |
| **Vite** | 5.x | Lightning-fast build tool & HMR dev server | [vitejs.dev](https://vitejs.dev/) |
| **React Router DOM** | v6 | Client-side SPA routing | [reactrouter.com](https://reactrouter.com/) |
| **Axios** | latest | HTTP client with JWT interceptors & 401 redirect | [axios-http.com](https://axios-http.com/) |
| **Recharts** | latest | Composable chart library (line, bar, radar, pie) | [recharts.org](https://recharts.org/) |
| **CSS Variables** | — | Full design token system (dark/light, neon glows) | — |
| **Canvas API** | — | Animated particle systems on login & game lobby | [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) |
| **FileReader API** | — | Local Base64 image encoding for proof uploads | [MDN FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) |
| **Google Fonts** | — | `Orbitron` (game UI) + `Inter` (body text) | [fonts.google.com](https://fonts.google.com/) |

### 🛠 Tooling

| Tool | Purpose | Link |
|---|---|---|
| **Docker + Docker Compose** | One-command containerized environment | [docker.com](https://www.docker.com/) |
| **Git** | Version control | [git-scm.com](https://git-scm.com/) |
| **VS Code** | Recommended IDE | [code.visualstudio.com](https://code.visualstudio.com/) |

---

## 📁 Project Structure

```
ecosphere/
│
├── README.md                          ← You are here
├── docker-compose.yml                 ← One-command Docker setup
├── .gitignore
├── make_history.py                    ← Git commit history generator script
│
├── backend/
│   ├── requirements.txt               ← All pip dependencies
│   ├── seed.py                        ← Demo data seeder (run once)
│   ├── .env                           ← ⚙️ Your local config (edit this!)
│   ├── .env.example                   ← Template for .env
│   ├── Dockerfile
│   │
│   └── app/
│       ├── main.py                    ← FastAPI app, CORS, lifespan, router mount
│       ├── deps.py                    ← DI: get_db, get_current_user, role guards
│       │
│       ├── core/
│       │   ├── config.py              ← Settings class (reads .env via Pydantic-Settings)
│       │   ├── database.py            ← SQLAlchemy engine, SessionLocal, Base
│       │   └── security.py            ← JWT signing/verification, bcrypt hashing
│       │
│       ├── models/
│       │   └── models.py              ← All 25+ SQLAlchemy ORM table definitions
│       │
│       ├── schemas/
│       │   └── schemas.py             ← All Pydantic request/response schemas
│       │
│       ├── routers/
│       │   ├── auth.py                ← POST /auth/login-json · /signup · GET /me
│       │   ├── org.py                 ← /org/departments · /org/categories
│       │   ├── environmental.py       ← /emission-factors · /carbon-transactions · /goals · /simulate-erp-transaction
│       │   ├── social.py              ← /activities · /participations · /diversity-metrics · /training-completions
│       │   ├── governance.py          ← /policies · /compliance-issues · /audits
│       │   ├── gamification.py        ← /challenges · /challenge-participations · /badges · /rewards · /leaderboard
│       │   ├── scoring.py             ← /scoring/score · /scoring/config
│       │   ├── reports.py             ← /reports/environmental · /social · /governance · /esg-summary
│       │   └── notifications.py       ← /notifications
│       │
│       └── services/
│           ├── scoring_service.py     ← Event-driven E/S/G weighted score recalculation
│           ├── badge_service.py       ← XP-triggered badge auto-award engine
│           ├── points_service.py      ← XP credit/debit (approvals, redemptions)
│           ├── audit_service.py       ← Immutable write-once audit trail logger
│           └── notification_service.py ← In-app notification fan-out
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx                   ← React DOM root
        ├── App.jsx                    ← Route definitions (React Router v6)
        ├── index.css                  ← Design system: CSS vars, tokens, animations
        │
        ├── api/
        │   └── client.js              ← Axios instance: baseURL + JWT Bearer interceptor
        │
        ├── context/
        │   └── AuthContext.jsx        ← Global auth state: login/logout/user + localStorage
        │
        ├── components/
        │   └── Layout.jsx             ← Sidebar nav, XP HUD bar, animated background
        │
        └── pages/
            ├── Login.jsx              ← Particle canvas login + demo quick-login buttons
            ├── Signup.jsx             ← Animated registration with role selection
            ├── Dashboard.jsx          ← ESG score overview, trend charts, dept rankings
            ├── Environmental.jsx      ← Carbon tracker, goals, ERP simulator console
            ├── Social.jsx             ← CSR missions, photo proof uploader, diversity & training tabs
            ├── Governance.jsx         ← Policy library, compliance tracker, audit viewer
            ├── Gamification.jsx       ← 🎮 Arena lobby → Quests · Leaderboard · Badges · Rewards
            ├── Reports.jsx            ← Intel report generator (4 report types)
            └── Admin.jsx              ← Org settings, ESG weight configurator
```

---

## 🚀 Quick Start — Local Setup

You need **two terminals open** at the same time — one for the backend, one for the frontend.

### Terminal 1 — Backend (FastAPI + Uvicorn)

```powershell
# 1. Navigate to backend
cd C:\ecosphere\backend

# 2. Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install all dependencies
pip install -r requirements.txt

# 4. Seed the database with demo accounts and data (run ONCE)
python seed.py

# 5. Start the development server
uvicorn app.main:app --reload --port 8000
```

✅ **Backend is ready** when you see:
```
INFO:     Application startup complete.
Startup check: flagged 0 overdue compliance issues.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Terminal 2 — Frontend (React + Vite)

```powershell
# 1. Navigate to frontend
cd C:\ecosphere\frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite dev server
npm run dev
```

✅ **Frontend is ready** when you see:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### Re-seeding the Database

If you need to reset to a clean state:
```powershell
del C:\ecosphere\backend\ecosphere.db
cd C:\ecosphere\backend
.\venv\Scripts\activate
python seed.py
```

---

## 🐳 Docker Setup

Run the entire stack — backend + database + frontend — with a single command:

```powershell
cd C:\ecosphere
docker-compose up --build
```
## 👤 Demo Accounts

The `seed.py` script creates these accounts automatically. On the **Login page**, click a **DEMO PLAYER** tile to auto-fill any credential:

| Role | Email | Password | Access Level |
|---|---|---|---|
| 🔴 **Admin** | `admin@ecosphere.io` | `Admin123!` | Full platform access, org settings, ESG weight config |
| 🟠 **Department Head** | `head.eng@ecosphere.io` | `Head123!` | CSR approvals, quest approvals, dept reports |
| 🟢 **Employee** | `raj@ecosphere.io` | `Employee123!` | Participate in activities, accept quests, earn XP |
| 🟢 **Employee** | `mei@ecosphere.io` | `Employee123!` | Secondary employee account for leaderboard testing |

> 💡 **Full test flow:** Log in as `raj@ecosphere.io` → accept a quest → upload photo proof → log out → log in as `head.eng@ecosphere.io` → approve the quest → watch XP awarded and score recalculate.

---

## 🔌 API Reference

All endpoints are prefixed with `http://localhost:8000`. Full interactive docs at **[/docs](http://localhost:8000/docs)**.

### 🔐 Auth — `/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/login-json` | Public | Login with email + password, returns JWT access token |
| `POST` | `/auth/signup` | Public | Register a new employee account |
| `GET` | `/auth/me` | JWT | Get the currently authenticated user's profile |

### 🏢 Organization — `/org`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/org/departments` | JWT | List all departments |
| `POST` | `/org/departments` | Admin | Create a new department |
| `GET` | `/org/categories` | JWT | List all ESG categories |
| `POST` | `/org/categories` | Admin | Create a new category |

### 🌿 Environmental — `/environmental`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET/POST` | `/environmental/emission-factors` | JWT / Admin | List or create emission conversion factors |
| `GET/POST` | `/environmental/carbon-transactions` | JWT | View or log carbon emission transactions |
| `GET/POST` | `/environmental/goals` | JWT / Admin | View or set department sustainability goals |
| `POST` | `/environmental/simulate-erp-transaction` | JWT | Simulate ERP transaction with auto CO₂ calculation |
| `GET/POST` | `/environmental/product-esg-profiles` | JWT | Manage product-level ESG lifecycle data |

### 🤝 Social — `/social`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET/POST` | `/social/activities` | JWT | List or create CSR missions |
| `POST` | `/social/activities/{id}/participate` | Employee | Join a CSR activity |
| `GET` | `/social/participations` | Head / Admin | View all participation submissions |
| `PUT` | `/social/participations/{id}/decision` | Head / Admin | Approve or reject (awards XP, triggers scoring) |
| `GET/POST` | `/social/diversity-metrics` | JWT | Log or view diversity reporting data |
| `GET/POST` | `/social/training-completions` | JWT | Assign or mark training as complete |

### ⚖️ Governance — `/governance`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET/POST` | `/governance/policies` | JWT / Admin | Manage ESG policy documents |
| `POST` | `/governance/policies/{id}/acknowledge` | Employee | Record a policy acknowledgement |
| `GET/POST` | `/governance/compliance-issues` | JWT | Log and track compliance issues |
| `PUT` | `/governance/compliance-issues/{id}` | Head / Admin | Update issue status |
| `GET/POST` | `/governance/audits` | JWT / Auditor | View or create audit records |

### 🎮 Gamification — `/gamification`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET/POST` | `/gamification/challenges` | JWT / Admin | List active quests or create new ones |
| `POST` | `/gamification/challenge-participations` | Employee | Accept / enroll in a quest |
| `GET` | `/gamification/challenge-participations/mine` | Employee | View my active quests and proof status |
| `GET` | `/gamification/challenge-participations` | Head / Admin | View all pending quest submissions |
| `PUT` | `/gamification/challenge-participations/{id}/progress` | Employee | Update progress % and upload Base64 photo proof |
| `PUT` | `/gamification/challenge-participations/{id}/decision` | Head / Admin | Approve or reject (awards XP, triggers scoring) |
| `GET/POST` | `/gamification/badges` | JWT / Admin | View badge catalog or create badges |
| `GET/POST` | `/gamification/rewards` | JWT / Admin | View reward catalog or add items |
| `POST` | `/gamification/rewards/{id}/redeem` | Employee | Redeem a reward (deducts XP from balance) |
| `GET` | `/gamification/leaderboard` | JWT | Ranked employee XP leaderboard |

### 📊 Scoring — `/scoring`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/scoring/score` | JWT | Current E/S/G scores for your department |
| `POST` | `/scoring/score/compute` | Admin | Manually trigger full score recalculation |
| `GET/PUT` | `/scoring/config` | Admin | View or update ESG weight configuration |

### 📋 Reports — `/reports`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/reports/environmental` | Head / Admin | Environmental performance report |
| `GET` | `/reports/social` | Head / Admin | Social CSR and participation report |
| `GET` | `/reports/governance` | Head / Admin | Governance compliance and policy report |
| `GET` | `/reports/esg-summary` | Head / Admin | Combined ESG summary with scoring breakdown |

### 🔔 Notifications — `/notifications`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/notifications` | JWT | Get current user's notification feed |
| `PUT` | `/notifications/{id}/read` | JWT | Mark a notification as read |

---

## 🌱 Environment Variables

Edit `backend/.env` to configure the backend:

```env
# ── Database ────────────────────────────────────────────────────────
# SQLite (zero-config local development):
DATABASE_URL=sqlite:///./ecosphere.db

# PostgreSQL (production):
# DATABASE_URL=postgresql://user:password@localhost:5432/ecosphere

# ── Security ────────────────────────────────────────────────────────
SECRET_KEY=change-this-to-a-long-random-string-at-least-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ── CORS ────────────────────────────────────────────────────────────
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:3000"]

# ── App ─────────────────────────────────────────────────────────────
PROJECT_NAME=EcoSphere ESG Platform
```

---

## 🗄️ Database Models

### Core

| Model | Table | Purpose |
|---|---|---|
| `User` | `users` | Employees, Heads, Admins, Auditors. Stores XP balance, role, department FK |
| `Department` | `departments` | Org unit with head assignment and ESG ownership |
| `Category` | `categories` | ESG classification tags for activities and policies |

### 🌿 Environmental

| Model | Table | Purpose |
|---|---|---|
| `EmissionFactor` | `emission_factors` | CO₂ conversion coefficients per activity type (e.g. kgCO₂/km) |
| `CarbonTransaction` | `carbon_transactions` | Individual emission log entries linked to source activity |
| `SustainabilityGoal` | `sustainability_goals` | Department-level emission reduction targets with progress |
| `ProductESGProfile` | `product_esg_profiles` | Product lifecycle environmental data |

### 🤝 Social

| Model | Table | Purpose |
|---|---|---|
| `CSRActivity` | `csr_activities` | Mission definitions with XP value and evidence toggle |
| `Participation` | `participations` | Employee join records: `pending/approved/rejected` + Base64 proof URL |
| `DiversityMetric` | `diversity_metrics` | Headcount diversity breakdowns by category |
| `TrainingCompletion` | `training_completions` | Training assignment and completion tracking |

### ⚖️ Governance

| Model | Table | Purpose |
|---|---|---|
| `ESGPolicy` | `esg_policies` | Policy documents with version and effective date |
| `PolicyAcknowledgement` | `policy_acknowledgements` | Timestamped employee read receipts |
| `ComplianceIssue` | `compliance_issues` | Issues with `open/in_progress/resolved/overdue` lifecycle |
| `Audit` | `audits` | Audit records with findings and auditor assignment |

### 🎮 Gamification

| Model | Table | Purpose |
|---|---|---|
| `Challenge` | `challenges` | Quest definitions: `draft/active/under_review/completed/archived` |
| `ChallengeParticipation` | `challenge_participations` | Employee quest enrollment with progress % and Base64 photo proof |
| `Badge` | `badges` | Achievement definitions with JSON unlock rules |
| `UserBadge` | `user_badges` | Many-to-many: employees ↔ earned badges |
| `Reward` | `rewards` | Redeemable catalog items with stock count and XP cost |
| `Redemption` | `redemptions` | Reward claim records |

### Scoring & Audit

| Model | Table | Purpose |
|---|---|---|
| `DepartmentScore` | `department_scores` | Aggregated E/S/G component scores per department per period |
| `ESGConfig` | `esg_config` | Org-level weight config (default: E=40%, S=30%, G=30%) |
| `AuditLog` | `audit_logs` | Immutable write-once event trail for all state changes |
| `Notification` | `notifications` | In-app notification records with read status |

---

## ⚡ Business Rules & Scoring Engine

### ESG Score Formula

The scoring engine (`backend/app/services/scoring_service.py`) runs **synchronously** after every meaningful event — no batch jobs, no cron needed.

```
Overall ESG Score = (E_score × E_weight) + (S_score × S_weight) + (G_score × G_weight)

Default weights (configurable via Admin → ESG Weights):
  E_weight = 0.40
  S_weight = 0.30
  G_weight = 0.30
```

**How each component is calculated:**

| Component | Formula |
|---|---|
| **Environmental (E)** | Average % goal completion across all active sustainability goals |
| **Social (S)** | `approved_participations ÷ total_participations × 100` |
| **Governance (G)** | `(policy_acknowledgement_rate × 50%) + (compliance_health_index × 50%)` |

### Business Rules

| Rule | Behaviour |
|---|---|
| **Auto Emission Calculation** | Toggle in Environmental Settings. When ON, ERP simulation auto-creates `CarbonTransaction` records using matching emission factor |
| **Evidence Requirement** | Per-activity toggle. When ON, managers cannot approve participation without a Base64 photo proof submitted |
| **Quest Photo Proof** | Employee picks image from device → FileReader converts to Base64 data URL → stored directly in DB → rendered inline in manager approval panel |
| **Badge Auto-Award** | On every XP credit, `badge_service.check_and_award_badges()` evaluates all badge JSON unlock rules against the employee's current XP and stats |
| **Reward Redemption** | Claiming deducts `points_required` from the employee's `xp_points` balance and decrements the reward `stock` count |
| **Compliance Overdue Flagging** | On server startup, `flag_overdue_compliance_issues()` runs in the `lifespan` context manager and marks past-due issues as `overdue` |
| **RBAC Guards** | Every endpoint declares its minimum role. `deps.py` raises HTTP 403 for any unauthorized access attempt |

---

## 🔄 Event-Driven Flows

### Flow 1: Employee Completes a CSR Mission

```
Employee clicks "Upload Photo" on active CSR card
    → FileReader.readAsDataURL() converts image to Base64 data URL
    → PUT /social/participations/{id}  {proof_url: "data:image/..."}
    → Manager sees photo rendered inline in Pending Approvals panel
    → Manager clicks "✅ Approve"
    → PUT /social/participations/{id}/decision?approve=true
        → points_service.award_xp(employee, activity.xp_reward)
        → badge_service.check_and_award_badges(employee)
        → scoring_service.recalculate_department_scores(db)
        → audit_service.log("participation_approved", ...)
        → notification_service.notify(employee, "Mission approved! +XP awarded")
```

### Flow 2: Employee Accepts and Completes a Quest

```
Employee clicks "⚔ ACCEPT QUEST"
    → POST /gamification/challenge-participations {challenge_id: X}
    → Card changes to show "⏳ PENDING APPROVAL" + "📎 UPLOAD PHOTO"
    → Employee picks image → FileReader converts to Base64
    → PUT /gamification/challenge-participations/{id}/progress
        {progress: 100, proof_url: "data:image/..."}
    → Manager sees photo in Manager Approvals panel (bottom of Quests tab)
    → Manager clicks "✅ APPROVE"
    → PUT /gamification/challenge-participations/{id}/decision?approve=true
        → points_service.award_xp(employee, challenge.xp)
        → badge_service.check_and_award_badges(employee)
        → scoring_service.recalculate_department_scores(db)
        → Card updates to "✅ APPROVED"
```

### Flow 3: ERP Auto-Emission Calculation

```
Admin enables "Auto Emission Calculation" in Environmental Settings
    → POST /environmental/simulate-erp-transaction
        {type: "fleet", quantity: 500, unit: "km"}
    → Backend finds matching EmissionFactor for "fleet"
    → Calculates: co2_kg = 500 × factor.co2_per_unit
    → Creates CarbonTransaction record automatically
    → scoring_service.recalculate_department_scores(db) → E_score updates
    → Dashboard carbon chart refreshes on next load
```

---

## 🤝 Collaborators

| Name | Role |
|---|---|
| **Ruchika Verma** | Project Lead · Backend Architecture · ESG Domain Design |
| **Archana Agrahari** | Frontend Development · UI/UX Design System |
| **Rashmi** | Backend Development · API & Service Layer |
| **Divyanshi Singh** | QA & Testing · Data Validation |

---

<div align="center">
Built with 🌍 for a sustainable future
</div>
