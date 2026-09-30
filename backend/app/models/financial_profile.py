import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    monthly_income = Column(Float, nullable=False, default=0.0)
    monthly_expenses = Column(Float, nullable=False, default=0.0)
    total_debt = Column(Float, nullable=False, default=0.0)
    monthly_debt_payment = Column(Float, nullable=False, default=0.0)
    total_credit_limit = Column(Float, nullable=False, default=0.0)
    credit_utilization = Column(Float, nullable=False, default=0.0)
    dti_ratio = Column(Float, nullable=False, default=0.0)
    active_loans = Column(Integer, nullable=False, default=0)
    missed_payments = Column(Integer, nullable=False, default=0)
    financial_goal = Column(String(255), nullable=True, default="Improve credit score")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="financial_profile")
