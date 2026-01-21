# Stakr

Minimal skeleton (FastAPI backend + tests + GitHub Actions) to start cleanly.

## Structure
```
backend/
  app/
    main.py            # FastAPI app (health, ping, version, items, echo)
  tests/
    test_health.py     # minimal API checks
  requirements.txt     # runtime dependencies
  dev-requirements.txt # lint/test tools
.github/workflows/
  sonar.yml            # CI: lint, tests, coverage, SonarCloud
sonar-project.properties # Sonar config (backend only)
README.md               # Project usage notes
```

## Prerequisites
- Python 3.12
- Any shell (examples use PowerShell; adapt venv activation for your shell)

## Installation
```powershell
# From repo root
python -m venv .venv
. .\.venv\Scripts\Activate.ps1

pip install -r backend/requirements.txt
pip install -r backend/dev-requirements.txt
```
```bash
# If you prefer bash
python -m venv .venv
source .venv/bin/activate

pip install -r backend/requirements.txt
pip install -r backend/dev-requirements.txt
```

## Run the API
```powershell
uvicorn app.main:app --app-dir backend --reload --port 8000
```
- Healthcheck: http://127.0.0.1:8000/health
- Docs (Swagger): http://127.0.0.1:8000/docs

## Run tests
```powershell
pytest -q backend
```
(Optional) with coverage:
```powershell
pytest backend --cov=backend --cov-report=term-missing --cov-report=xml:backend/coverage.xml
```

## Code quality (optional)
```powershell
black backend --check; isort backend --check-only; flake8 backend
```

## CI
- GitHub Actions runs lint, tests (with coverage), and SonarCloud on push/PR to main/master.
