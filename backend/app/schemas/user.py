from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


# Shared attributes
class UserBase(BaseModel):
    email: EmailStr


# Attributes received during registration (Input)
class UserCreate(UserBase):
    password: str
    first_name: str
    last_name: str
    job_title: Optional[str] = None


# Attributes sent to the client (Output)
class User(UserBase):
    # Expose DB columns directly so frontend can access them without relying
    # on a computed property. These match the DB schema where they are nullable.
    id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
