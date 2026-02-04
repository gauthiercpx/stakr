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
    id: UUID
    is_active: bool
    is_admin: bool

    model_config = ConfigDict(from_attributes=True)
