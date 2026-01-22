# Stakr

Minimal skeleton (FastAPI backend + tests + GitHub Actions) to start cleanly.

## Project layout

```
backend/
  app/
    __init__.py           # exports `app`
    main.py               # FastAPI app factory / router wiring
    routes/
      health.py           # /health, /ping
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
- Health: http://127.0.0.1:8000/health
- Ping: http://127.0.0.1:8000/ping
- Version: http://127.0.0.1:8000/version
- Swagger UI: http://127.0.0.1:8000/docs

## Run tests

```powershell
python -m pytest -q backend
```

## Lint & formatting

```powershell
python -m black backend --check
python -m isort backend --check-only
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
