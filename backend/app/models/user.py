import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Nullable for pure OAuth accounts
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    profile_picture = Column(String(1024), nullable=True)
    auth_provider = Column(String(50), default="local")  # "local", "google"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    financial_profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    credit_histories = relationship("CreditScoreHistory", back_populates="user", cascade="all, delete-orphan", order_by="CreditScoreHistory.recorded_at.asc()")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan", order_by="Recommendation.created_at.desc()")
    snapshots = relationship("FinancialSnapshot", back_populates="user", cascade="all, delete-orphan", order_by="FinancialSnapshot.created_at.asc()")
