from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.database import get_db
from app.schemas import crud as crud_user
from app.schemas import user as schemas_user

router = APIRouter(tags=["Auth"])


@router.post(
    "/register",
    summary="Register",
    description="Creates a new user account.",
    response_model=schemas_user.User,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "User created"},
        400: {"description": "Email already in use"},
    },
)
def register(
    user_in: schemas_user.UserCreate, db: Session = Depends(get_db)
) -> schemas_user.User:
    user = crud_user.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use"
        )

    return crud_user.create_user(db=db, user=user_in)


@router.post(
    "/token",
    summary="Login",
    description="Exchanges username/password for a JWT access token.",
    responses={
        200: {"description": "Access token"},
        401: {"description": "Invalid credentials"},
    },
)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    user = crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires,
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get(
    "/users/me",
    summary="Get current user",
    description="Returns the authenticated user.",
    response_model=schemas_user.User,
)
def read_users_me(current_user=Depends(deps.get_current_user)) -> schemas_user.User:
    return current_user
