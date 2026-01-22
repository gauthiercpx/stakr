"""Health-related endpoints."""

from fastapi import APIRouter, Response
from starlette import status

from app.schemas.common import HealthResponse, PingResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Health check",
    description="Returns a minimal application health status.",
    response_model=HealthResponse,
)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@router.head(
    "/health",
    include_in_schema=False,
)
def health_head() -> Response:
    return Response(status_code=status.HTTP_200_OK)


@router.get(
    "/ping",
    summary="Ping",
    description="Quick availability check.",
    response_model=PingResponse,
)
def ping() -> PingResponse:
    return PingResponse(message="pong")
