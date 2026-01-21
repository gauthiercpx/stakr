from typing import Any, Dict

from fastapi import FastAPI, Response
from pydantic import BaseModel
from starlette import status

app = FastAPI(
    title="STAKR API",
    version="0.1.0",
    description=(
        "Demo API for the STAKR project skeleton.\n"
        "This specification documents health endpoints and a few examples."
    ),
    contact={
        "name": "STAKR Team",
        "url": "https://stakr.me",
        "email": "gauthier.coppeaux@gmail.com",
    },
    openapi_tags=[
        {"name": "Health", "description": "Liveness/readiness and ping endpoints"},
        {"name": "Examples", "description": "Example endpoints for the skeleton"},
    ],
)


# Schemas
class HealthResponse(BaseModel):
    status: str


class VersionResponse(BaseModel):
    version: str


class Item(BaseModel):
    id: int
    name: str


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Returns a minimal application health status.",
    response_model=HealthResponse,
)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.head(
    "/health",
    include_in_schema=False,
)
def health_head() -> Response:
    return Response(status_code=status.HTTP_200_OK)


@app.get(
    "/ping",
    tags=["Health"],
    summary="Ping",
    description="Quick availability check. Returns no body.",
    status_code=status.HTTP_200_OK,
)
def ping() -> Response:
    return Response(status_code=status.HTTP_200_OK)


@app.get(
    "/version",
    tags=["Examples"],
    summary="API version",
    description="Returns the exposed application version.",
    response_model=VersionResponse,
)
def version() -> VersionResponse:
    return VersionResponse(version=app.version)


@app.get(
    "/items/{item_id}",
    tags=["Examples"],
    summary="Example item lookup",
    description="Retrieves an example item by its identifier.",
    response_model=Item,
)
def get_item(item_id: int) -> Item:
    return Item(id=item_id, name=f"Item {item_id}")


@app.post(
    "/echo",
    tags=["Examples"],
    summary="Echo JSON",
    description="Returns the request JSON payload unchanged.",
)
def echo(payload: Dict[str, Any]) -> Dict[str, Any]:
    return payload
