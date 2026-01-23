import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Récupère l'URL de ton secret ou de ton .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Crée le moteur SQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Crée une usine à sessions (pour faire des requêtes)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# C'est CE "Base" que tout le monde cherche !
Base = declarative_base()

# Utilitaire pour obtenir la DB dans tes routes FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()