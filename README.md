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

```powershell
cd backend
docker build -t stakr-backend:local .
docker run --rm -p 8000:8000 stakr-backend:local
```

## CI

GitHub Actions runs:
- Black / isort / flake8
- pytest (+ coverage.xml)
- SonarCloud scan

