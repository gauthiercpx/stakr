# Stakr

Minimal skeleton (FastAPI backend + tests + GitHub Actions) to start cleanly.

## Project layout

```
backend/
  app/
    __init__.py           # exports `app`
    main.py               # FastAPI app wiring
    routes/
      health.py           # /health, /ready
      examples.py         # /version, /items/{id}, /echo
    schemas/
      common.py           # Pydantic response models
  tests/
    test_health.py        # API smoke tests
    test_openapi.py       # OpenAPI JSON sanity check
  Dockerfile              # backend container image (Python 3.12)
  requirements.txt        # runtime dependencies
  dev-requirements.txt    # dev tooling (black/isort/flake8/pytest)
  pyproject.toml          # tool configuration
.github/workflows/
  sonar.yml               # CI: lint, tests, coverage, SonarCloud
```

## Requirements

- Python 3.12

## Install (Windows / PowerShell)

```powershell
# From repo root
py -3.12 -m venv .venv
. .\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
python -m pip install -r backend\dev-requirements.txt
```

## Run the API

```powershell
# From repo root
python -m uvicorn app:app --app-dir backend --reload --port 8000
```

Endpoints:
- Liveness: http://127.0.0.1:8000/health
- Readiness (DB check): http://127.0.0.1:8000/ready
- Version: http://127.0.0.1:8000/version
- Swagger UI: http://127.0.0.1:8000/docs

## Run tests

If `pytest` is not found, it usually means your venv is not activated or the tool isn't installed.
Use `python -m ...` to always run the tool from the current interpreter.

```powershell
# Option A (recommended): run from backend/ (uses backend/pyproject.toml)
cd backend
python -m pytest

# Option B: run from repo root
python -m pytest -q backend
```

## Lint & formatting

```powershell
# Run from repo root
python -m black backend
python -m isort backend
python -m flake8 backend
```

## Docker (backend)

The container runs `backend/entrypoint.sh` which will:
- run `alembic upgrade head` **only if** `DATABASE_URL` is set
- then start Uvicorn

Because of that, if you run the container without env vars you will see:
`DATABASE_URL is not set; skipping migrations.`

### Run (local)

We intentionally **do not** bake `.env` into the Docker image (secrets must not be shipped in images).
Instead, inject config at runtime.

We keep two env files:
- `backend/.env` for local commands (uses `localhost`)
- `backend/.env.docker` for containers (uses `host.docker.internal`)

```powershell
cd backend

docker build -t stakr-backend:local .

# Run with env vars loaded from backend/.env.docker
# (DATABASE_URL must be present in this file)
docker run --rm -p 8000:8000 --env-file .env.docker stakr-backend:local
```

### Run (Azure)

In Azure Container Apps, set `DATABASE_URL` as an environment variable (often backed by a secret).
The same entrypoint will then run migrations on startup.

## Migrations (Alembic)

Alembic uses `DATABASE_URL`. Run these from `backend/` so it picks up the local `alembic.ini`.

```powershell
cd backend

# Generate a new migration from model changes
python -m alembic revision --autogenerate -m "your message"

# Apply all pending migrations
python -m alembic upgrade head

# Downgrade one revision
python -m alembic downgrade -1

# Downgrade to a specific revision
python -m alembic downgrade <revision_id>

# Show current revision in the database
python -m alembic current

# Show history
python -m alembic history
```

Notes:
- If `DATABASE_URL` is missing or points to the wrong host/port, `upgrade`/`downgrade` will fail.
- For Docker runs, prefer `--env-file .env.docker` so migrations use the same connection string as the app.
- Use `revision --autogenerate` only after your SQLAlchemy models are updated.

## CI

GitHub Actions runs:
- Black / isort / flake8
- pytest (+ coverage.xml)
- SonarCloud scan
