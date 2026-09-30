import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class FinancialSnapshot(Base):
    __tablename__ = "financial_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    income = Column(Float, nullable=False)
    expenses = Column(Float, nullable=False)
    debt = Column(Float, nullable=False)
    utilization = Column(Float, nullable=False)
    dti = Column(Float, nullable=False)
    savings = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="snapshots")
