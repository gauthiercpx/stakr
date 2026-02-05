from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


# Shared attributes
class UserBase(BaseModel):
    email: EmailStr


# Attributes received during registration (Input)
class UserCreate(UserBase):
    password: str


# Attributes sent to the client (Output)
class User(UserBase):
    # Expose DB columns directly so frontend can access them without relying
    # on a computed property. `name` remains optional for compatibility.
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    id: UUID
    is_active: bool
    is_superuser: bool

    model_config = ConfigDict(from_attributes=True)
