import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class CreditScoreCreate(BaseModel):
    credit_score: int = Field(..., ge=300, le=900, description="CIBIL-style score between 300 and 900")
    source: Optional[str] = "user_reported"

class CreditScoreRecord(BaseModel):
    id: int
    credit_score: int
    recorded_at: datetime.datetime
    source: str

    class Config:
        from_attributes = True

class CreditScoreCurrentResponse(BaseModel):
    current_score: Optional[int] = None
    previous_score: Optional[int] = None
    delta: Optional[int] = None
    category: str = "Not Available"
    category_color: str = "gray"
    recorded_at: Optional[datetime.datetime] = None
    interpretation: str = "Enter your current CIBIL score to get started."

class CreditScoreHistoryResponse(BaseModel):
    current: CreditScoreCurrentResponse
    history: List[CreditScoreRecord]
