from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.base import Base  # ✅ dùng lại đúng Base

DATABASE_URL = "sqlite:///./database.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    from app import models  # Ensure models are loaded
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
