"""Example endpoints for the project skeleton."""

from typing import Any, Dict

from fastapi import APIRouter, Body

from app.core.version import APP_VERSION
from app.schemas.common import Item, VersionResponse

router = APIRouter(tags=["Examples"])


@router.get(
    "/version",
    summary="API version",
    description="Returns the exposed application version.",
    response_model=VersionResponse,
)
def version() -> VersionResponse:
    return VersionResponse(version=APP_VERSION)


@router.get(
    "/items/{item_id}",
    summary="Example item lookup",
    description="Retrieves an example item by its identifier.",
    response_model=Item,
)
def get_item(item_id: int) -> Item:
    return Item(id=item_id, name=f"Item {item_id}")


@router.post(
    "/echo",
    summary="Echo JSON",
    description="Returns the request JSON payload unchanged.",
)
def echo(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    return payload
