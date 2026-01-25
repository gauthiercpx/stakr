"""Shared/commonly used response schemas."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class VersionResponse(BaseModel):
    version: str


class Item(BaseModel):
    id: int
    name: str


class DatabaseTestResponse(BaseModel):
    status: str


class ErrorResponse(BaseModel):
    """Generic error payload (matches FastAPI's default HTTPException shape)."""

    detail: str
