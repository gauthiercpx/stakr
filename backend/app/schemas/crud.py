from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models import User
from app.schemas.user import UserCreate


def get_user(db: Session, user_id: int):
    """Retrieve a user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    """Retrieve a user by email (used for login)."""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate):
    """Create a new user, hashing their password."""
    # 1. Hash the password (never store plaintext)
    hashed_password = get_password_hash(user.password)

    # 2. Prepare DB user object
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        job_title=user.job_title,
        is_active=True,
    )

    # 3. Persist
    db.add(db_user)
    db.commit()
    db.refresh(db_user)  # Reload to get DB-generated ID
    return db_user
