from sqlalchemy import (
    create_engine, Column, String, Float,
    Integer, Boolean, DateTime
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# En dev : SQLite automatique, en prod : PostgreSQL via .env
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./netfree.db")

if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
    )
else:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id          = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email       = Column(String(255), unique=True, index=True, nullable=True)
    phone       = Column(String(20), unique=True, nullable=True)
    mb_left     = Column(Float, default=0.0)
    daily_limit = Column(Float, default=300.0)
    ads_watched = Column(Integer, default=0)
    esim_active = Column(Boolean, default=False)
    esim_iccid  = Column(String(50), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    last_reset  = Column(DateTime, default=datetime.utcnow)


class AdView(Base):
    __tablename__ = "ad_views"
    id         = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id    = Column(String(36), index=True)
    mb_granted = Column(Float)
    brand      = Column(String(100), nullable=True)
    viewed_at  = Column(DateTime, default=datetime.utcnow)


class DailyUsage(Base):
    __tablename__ = "daily_usage"
    id        = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id   = Column(String(36), index=True)
    date      = Column(String(10), index=True)
    mb_used   = Column(Float, default=0.0)
    ads_count = Column(Integer, default=0)


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
