import datetime
from typing import Optional, Any
from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    analysis: Any
    recommendations: Any
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class RecommendationSave(BaseModel):
    analysis: Any
    recommendations: Any
