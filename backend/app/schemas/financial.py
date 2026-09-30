import datetime
from typing import Optional
from pydantic import BaseModel, Field

class FinancialProfileBase(BaseModel):
    monthly_income: float = Field(..., ge=0, description="Monthly gross income in INR")
    monthly_expenses: float = Field(..., ge=0, description="Monthly general living expenses in INR")
    total_debt: float = Field(..., ge=0, description="Total outstanding debt in INR")
    monthly_debt_payment: float = Field(..., ge=0, description="Monthly total EMI or debt payments in INR")
    total_credit_limit: float = Field(..., ge=0, description="Total sanctioned credit card limit in INR")
    active_loans: int = Field(0, ge=0, description="Number of active loan accounts")
    missed_payments: int = Field(0, ge=0, description="Number of missed/delayed payments in recent 12 months")
    financial_goal: Optional[str] = "Improve credit score"
    credit_score: Optional[int] = Field(None, ge=300, le=900, description="Reported CIBIL / Credit score")

class FinancialProfileCreate(FinancialProfileBase):
    pass

class FinancialProfileUpdate(BaseModel):
    monthly_income: Optional[float] = Field(None, ge=0)
    monthly_expenses: Optional[float] = Field(None, ge=0)
    total_debt: Optional[float] = Field(None, ge=0)
    monthly_debt_payment: Optional[float] = Field(None, ge=0)
    total_credit_limit: Optional[float] = Field(None, ge=0)
    active_loans: Optional[int] = Field(None, ge=0)
    missed_payments: Optional[int] = Field(None, ge=0)
    financial_goal: Optional[str] = None
    credit_score: Optional[int] = Field(None, ge=300, le=900)

class FinancialProfileResponse(BaseModel):
    id: int
    user_id: int
    monthly_income: float
    monthly_expenses: float
    total_debt: float
    monthly_debt_payment: float
    total_credit_limit: float
    credit_utilization: float
    dti_ratio: float
    monthly_savings: float
    active_loans: int
    missed_payments: int
    financial_goal: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class FinancialSnapshotResponse(BaseModel):
    id: int
    income: float
    expenses: float
    debt: float
    utilization: float
    dti: float
    savings: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True
