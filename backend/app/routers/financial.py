from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.routers.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.financial_profile import FinancialProfile
from backend.app.schemas.financial import (
    FinancialProfileCreate,
    FinancialProfileUpdate,
    FinancialProfileResponse,
    FinancialSnapshotResponse
)
from backend.app.services.financial_service import FinancialService
from backend.app.services.credit_service import CreditService

router = APIRouter(prefix="/financial", tags=["Financial Profile"])

@router.get("/profile", response_model=Optional[FinancialProfileResponse])
def get_financial_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the current user's financial profile."""
    profile = FinancialService.get_or_create_profile(db, current_user.id)
    if not profile:
        return None
    
    # Calculate savings
    savings = round(profile.monthly_income - profile.monthly_expenses - profile.monthly_debt_payment, 2)
    
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "monthly_income": profile.monthly_income,
        "monthly_expenses": profile.monthly_expenses,
        "total_debt": profile.total_debt,
        "monthly_debt_payment": profile.monthly_debt_payment,
        "total_credit_limit": profile.total_credit_limit,
        "credit_utilization": profile.credit_utilization,
        "dti_ratio": profile.dti_ratio,
        "monthly_savings": savings,
        "active_loans": profile.active_loans,
        "missed_payments": profile.missed_payments,
        "financial_goal": profile.financial_goal,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at
    }

@router.post("/profile", response_model=FinancialProfileResponse)
def create_financial_profile(
    profile_in: FinancialProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create initial profile from onboarding wizard."""
    profile = FinancialService.upsert_profile(db, current_user.id, profile_in)
    
    # If credit score was supplied in onboarding, record it in history
    if profile_in.credit_score is not None:
        CreditService.record_score(
            db=db,
            user_id=current_user.id,
            score=profile_in.credit_score,
            source="onboarding"
        )
    
    savings = round(profile.monthly_income - profile.monthly_expenses - profile.monthly_debt_payment, 2)
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "monthly_income": profile.monthly_income,
        "monthly_expenses": profile.monthly_expenses,
        "total_debt": profile.total_debt,
        "monthly_debt_payment": profile.monthly_debt_payment,
        "total_credit_limit": profile.total_credit_limit,
        "credit_utilization": profile.credit_utilization,
        "dti_ratio": profile.dti_ratio,
        "monthly_savings": savings,
        "active_loans": profile.active_loans,
        "missed_payments": profile.missed_payments,
        "financial_goal": profile.financial_goal,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at
    }

@router.put("/profile", response_model=FinancialProfileResponse)
def update_financial_profile(
    profile_in: FinancialProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update financial data:
    Recalculates DTI, credit utilization, and monthly savings,
    records a snapshot, and records a new credit score if provided.
    """
    profile = FinancialService.get_or_create_profile(db, current_user.id)
    
    # Merge existing values with incoming updates
    income = profile_in.monthly_income if profile_in.monthly_income is not None else (profile.monthly_income if profile else 0.0)
    expenses = profile_in.monthly_expenses if profile_in.monthly_expenses is not None else (profile.monthly_expenses if profile else 0.0)
    debt = profile_in.total_debt if profile_in.total_debt is not None else (profile.total_debt if profile else 0.0)
    debt_payment = profile_in.monthly_debt_payment if profile_in.monthly_debt_payment is not None else (profile.monthly_debt_payment if profile else 0.0)
    credit_limit = profile_in.total_credit_limit if profile_in.total_credit_limit is not None else (profile.total_credit_limit if profile else 0.0)
    active_loans = profile_in.active_loans if profile_in.active_loans is not None else (profile.active_loans if profile else 0)
    missed_payments = profile_in.missed_payments if profile_in.missed_payments is not None else (profile.missed_payments if profile else 0)
    goal = profile_in.financial_goal or (profile.financial_goal if profile else "Improve credit score")

    payload = FinancialProfileCreate(
        monthly_income=income,
        monthly_expenses=expenses,
        total_debt=debt,
        monthly_debt_payment=debt_payment,
        total_credit_limit=credit_limit,
        active_loans=active_loans,
        missed_payments=missed_payments,
        financial_goal=goal
    )

    updated = FinancialService.upsert_profile(db, current_user.id, payload)

    if profile_in.credit_score is not None:
        CreditService.record_score(
            db=db,
            user_id=current_user.id,
            score=profile_in.credit_score,
            source="update"
        )

    savings = round(updated.monthly_income - updated.monthly_expenses - updated.monthly_debt_payment, 2)
    return {
        "id": updated.id,
        "user_id": updated.user_id,
        "monthly_income": updated.monthly_income,
        "monthly_expenses": updated.monthly_expenses,
        "total_debt": updated.total_debt,
        "monthly_debt_payment": updated.monthly_debt_payment,
        "total_credit_limit": updated.total_credit_limit,
        "credit_utilization": updated.credit_utilization,
        "dti_ratio": updated.dti_ratio,
        "monthly_savings": savings,
        "active_loans": updated.active_loans,
        "missed_payments": updated.missed_payments,
        "financial_goal": updated.financial_goal,
        "created_at": updated.created_at,
        "updated_at": updated.updated_at
    }

@router.get("/snapshots", response_model=List[FinancialSnapshotResponse])
def get_snapshots(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve historical snapshots of financial metrics."""
    return FinancialService.get_snapshots(db, current_user.id)
