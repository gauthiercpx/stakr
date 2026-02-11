"""Health endpoints.

- `GET /health`: liveness probe (no dependency checks).
- `GET /ready`: readiness probe (checks database connectivity).
- `GET /db-test` is a hidden backward-compatible alias for `/ready`.
- `GET /version`: backend version.
"""

import logging
from typing import Any, Dict

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.version import APP_VERSION
from app.schemas.common import DatabaseTestResponse, ErrorResponse, HealthResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Liveness probe",
    description=(
        "Indicates whether the API process is running " "(does not check dependencies)."
    ),
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get(
    "/ready",
    summary="Readiness probe",
    description=(
        "Checks whether dependencies are ready " "(currently: database connectivity)."
    ),
    response_model=DatabaseTestResponse,
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "Service is ready"},
        503: {"description": "Service is not ready", "model": ErrorResponse},
    },
)
def ready(db: Session = Depends(get_db)) -> DatabaseTestResponse:
    try:
        db.execute(text("SELECT 1"))
        return DatabaseTestResponse(status="ready")
    except Exception:
        logger.exception("Readiness check failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service not ready",
        )


@router.get("/db-test", include_in_schema=False)
def db_test(db: Session = Depends(get_db)) -> DatabaseTestResponse:
    return ready(db)


@router.get(
    "/version",
    summary="Backend version",
    description="Returns the backend application version.",
    operation_id="health_version",
    status_code=status.HTTP_200_OK,
)
def version() -> dict:
    return {"version": APP_VERSION}


@router.post(
    "/echo",
    summary="Echo JSON",
    description="Returns the request JSON payload unchanged.",
    operation_id="health_echo",
)
def echo(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return payload
