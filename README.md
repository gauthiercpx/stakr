# Stakr

FastAPI backend + Vite/React frontend skeleton (tests + CI/CD) to start cleanly.

## Architecture

- **Backend**: `backend/` (FastAPI API)
- **Frontend**: `frontend/` (Vite + React)

Production is **split**:
- the frontend is built and deployed as a **static website**
- the backend is deployed as an **API**

## Documentation

- Frontend docs: `frontend/README.md`
- Backend docs: `backend/README.md`

## Quickstart (local dev)

### Option A (recommended): frontend with Vite, backend with Docker

This matches the split production setup.

1) Start the backend API + database (Docker Compose)

This is the easiest way to avoid DB connectivity problems from containers.

```powershell
# From repo root

docker build -t stakr:local .

docker compose -f docker-compose.dev.yml up -d

docker compose -f docker-compose.dev.yml logs -f api
```

2) Start the frontend (Vite dev server)

```powershell
cd frontend
npm install
npm run dev
```

Urls:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

---

#### Alternative (Option A2): backend container talking to a Postgres running on your host

If you already have Postgres running locally on your machine, you can run the API
container with an env file.

```powershell
# From repo root

docker build -t stakr:local .

docker run --rm -p 8000:8000 --env-file backend\.env.docker stakr:local
```

> On Windows/macOS, that `DATABASE_URL` should use `host.docker.internal`.

### Option B: run everything locally (no Docker)

```powershell
py -3.12 -m venv .venv
. .\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
python -m pip install -r backend\dev-requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload --port 8000

cd frontend
npm install
npm run dev
```

## Docker notes (Windows)

- Make sure `backend/.env.docker` is saved as **UTF-8 (without BOM)**.
  A non-UTF-8 encoded file can cause `UnicodeDecodeError`.
