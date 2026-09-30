import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class CreditScoreHistory(Base):
    __tablename__ = "credit_score_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    credit_score = Column(Integer, nullable=False)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    source = Column(String(50), default="user_reported")  # "user_reported", "onboarding", "update"

    # Relationships
    user = relationship("User", back_populates="credit_histories")
