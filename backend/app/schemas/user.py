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
    # on a computed property. `name` remains optional for compatibility.
    id: UUID
    first_name: str
    last_name: str
    job_title: Optional[str] = None



    model_config = ConfigDict(from_attributes=True)
