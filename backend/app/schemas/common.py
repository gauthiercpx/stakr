"""Shared/commonly used response schemas."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class PingResponse(BaseModel):
    message: str


class VersionResponse(BaseModel):
    version: str


class Item(BaseModel):
    id: int
    name: str
