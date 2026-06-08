# AsaanJournal

AsaanJournal is a trading journal monorepo. The active split architecture is:

- `frontend/`: `Next.js` + `React` + `TypeScript`
- `backend/`: `FastAPI` + `SQLAlchemy` + `Alembic`
- `PostgreSQL`: primary database
- `Redis`: background job / queue infrastructure

The repository also still contains the older root-level app files from the original local-first version. Those are preserved, but the current SaaS-style split stack lives under `frontend/` and `backend/`.

## Project Overview

AsaanJournal is built for traders who want to:

- create and manage trading accounts
- import broker CSVs with duplicate-safe ingestion
- add manual trades
- journal trades with templates and tags
- attach screenshots
- review analytics and calendar-based performance
- export reports and datasets
- manage profile and user settings

## Stack

### Frontend

- `Next.js 16`
- `React 19`
- `TypeScript`
- `TanStack Query`
- `TipTap`
- `Recharts`
- `lucide-react`

### Backend

- `FastAPI`
- `SQLAlchemy`
- `Alembic`
- `Pydantic`
- `PostgreSQL`
- `Redis`
- `Celery` scaffolding

### Local infrastructure

- `docker-compose`

## Repository Structure

```text
journedge/
|-- frontend/              # Next.js frontend
|-- backend/               # FastAPI backend
|-- docs/                  # Project docs
|-- docker-compose.yml     # Local Postgres/Redis/frontend/backend stack
|-- .env.example           # Root compose convenience variables
|-- backend/.env.example   # Backend runtime example env
`-- frontend/.env.example  # Frontend runtime example env
```

## Features

- User authentication: register, login, logout, password reset, email verification
- Profile management: profile update, password change, user preferences
- Account CRUD
- Manual trade CRUD
- Broker CSV import preview, validation, duplicate detection, commit, rollback
- Journal entry editing and templates
- Tags
- Screenshot upload and ownership-checked access
- Analytics summary, R-multiple, streaks, drawdown, behavioral metrics
- Calendar views
- Export dataset/report endpoints
- Admin and health routes

## Environment Setup

Do not commit real environment files. This repo includes safe examples only.

### Root

The root `.env.example` is only for local `docker compose` convenience:

```env
POSTGRES_DB=journedge
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
REDIS_PORT=6379
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### Backend

Copy `backend/.env.example` to `backend/.env` and replace placeholders:

```powershell
Copy-Item backend\.env.example backend\.env -Force
```

```bash
cp backend/.env.example backend/.env
```

Important backend values:

- `DATABASE_URL`
- `REDIS_URL`
- `SECRET_KEY`
- `FRONTEND_ORIGIN` / `FRONTEND_ORIGINS`
- storage settings if using S3-compatible object storage

### Frontend

Copy `frontend/.env.example` to `frontend/.env.local`:

```powershell
Copy-Item frontend\.env.example frontend\.env.local -Force
```

```bash
cp frontend/.env.example frontend/.env.local
```

Important frontend value:

- `BACKEND_ORIGIN`

## Local Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop or Docker Engine with Compose

### Start local services

```powershell
docker compose up -d postgres redis
```

```bash
docker compose up -d postgres redis
```

## Backend Run Commands

Run from `backend/`.

### Windows PowerShell

```powershell
Set-Location backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env -Force
alembic upgrade head
uvicorn app.main:app --reload
```

### Linux/macOS

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cp -f .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Backend default URL:

```text
http://127.0.0.1:8000
```

## Frontend Run Commands

Run from `frontend/`.

### Windows PowerShell

```powershell
Set-Location frontend
Copy-Item .env.example .env.local -Force
& 'C:\Program Files\nodejs\npm.cmd' install
& 'C:\Program Files\nodejs\npm.cmd' run dev
```

### Linux/macOS

```bash
cd frontend
cp -f .env.example .env.local
npm install
npm run dev
```

Frontend default URL:

```text
http://localhost:3000
```

## Optional Local Docker Run

You can run the full split stack with Docker:

```powershell
docker compose up --build
```

```bash
docker compose up --build
```

## Testing and Build Commands

These commands already exist in the repo:

### Backend

```bash
cd backend
python -m pytest tests -q
```

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

### Frontend smoke tests

```bash
cd frontend
npm run test:smoke
```

## Deployment Notes

- Do not deploy with example secrets or default passwords.
- Set `SECRET_KEY` to a strong random value in production.
- Use a managed `PostgreSQL` database in production.
- Use `Redis` for queue/background-job infrastructure.
- Use S3-compatible storage for screenshots/backups if deploying beyond local development.
- Set `FRONTEND_ORIGIN` / `FRONTEND_ORIGINS` to the real frontend URL.
- Set `BACKEND_ORIGIN` in the frontend deployment to the public backend URL.
- Keep `.env`, `backend/.env`, and `frontend/.env.local` out of version control.

## Fresh Upload Checklist

Before uploading this repo to GitHub:

1. Confirm local env files are not included in the upload.
2. Confirm local runtime data directories are not included:
   - `node_modules/`
   - `.next/`
   - `.venv/`
   - `backend/storage/`
   - `backups/`
   - `exports/`
   - local database files
3. Review any local-only files under the root, `backend/`, and `frontend/`.
4. Upload only the cleaned working tree contents.
