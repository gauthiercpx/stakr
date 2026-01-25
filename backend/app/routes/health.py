"""Health endpoints.

- `GET /health`: liveness probe (no dependency checks).
- `GET /ready`: readiness probe (checks database connectivity).
- `GET /db-test` is a hidden backward-compatible alias for `/ready`.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.database import get_db
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
        500: {"description": "Dependency check failed", "model": ErrorResponse},
    },
)
def ready(db: Session = Depends(get_db)) -> DatabaseTestResponse:
    try:
        db.execute(text("SELECT 1"))
        return DatabaseTestResponse(status="ready")
    except Exception:
        logger.exception("Readiness check failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service not ready",
        )


@router.get("/db-test", include_in_schema=False)
def db_test(db: Session = Depends(get_db)) -> DatabaseTestResponse:
    return ready(db)
