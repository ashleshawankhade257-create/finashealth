from typing import List, Optional
from pydantic import BaseModel, Field

class StepItem(BaseModel):
    step: int
    title: str
    description: str
    target_timeline: str
    impact_level: str  # "High", "Medium", "Low"

class MonthlyTarget(BaseModel):
    month: str
    target_metric: str
    action_goal: str

class AIAdviceResponse(BaseModel):
    overall_assessment: str
    risk_factors: List[str]
    positive_factors: List[str]
    priority_actions: List[str]
    five_step_plan: List[StepItem]
    monthly_targets: List[MonthlyTarget]
    explanation: str
    disclaimer: str = "This analysis is for educational purposes only and does not constitute certified financial or lending advice."

class AIAnalyzeRequest(BaseModel):
    custom_note: Optional[str] = None
