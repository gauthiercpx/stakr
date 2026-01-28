from pydantic import BaseModel, ConfigDict, EmailStr


# Shared attributes
class UserBase(BaseModel):
    email: EmailStr


# Attributes received during registration (Input)
class UserCreate(UserBase):
    password: str


# Attributes sent to the client (Output)
class User(UserBase):
    id: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
