from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models import User
from app.schemas.user import UserCreate


def get_user(db: Session, user_id: int):
    """Récupère un user par son ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    """Récupère un user par son email (utile pour le login)"""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate):
    """Crée un nouvel utilisateur en hachant son mot de passe"""
    # 1. On hache le mot de passe (on ne stocke jamais en clair !)
    hashed_password = get_password_hash(user.password)

    # 2. On prépare l'objet pour la BDD
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        job_title=user.job_title,
        is_active=True,
    )

    # 3. On sauvegarde
    db.add(db_user)
    db.commit()
    db.refresh(db_user)  # On recharge pour avoir l'ID généré par la BDD
    return db_user
