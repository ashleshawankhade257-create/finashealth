import json
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.routers.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.recommendation import Recommendation
from backend.app.schemas.ai import AIAdviceResponse, AIAnalyzeRequest
from backend.app.services.financial_service import FinancialService
from backend.app.services.credit_service import CreditService
from backend.app.services.gemini_service import GeminiService

router = APIRouter(prefix="/ai", tags=["AI Advisor"])

@router.post("/analyze", response_model=AIAdviceResponse)
async def analyze_credit_health(
    request: Optional[AIAnalyzeRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger AI Credit Advisor analysis:
    Gathers user's real financial metrics and sends structured data to Google Gemini.
    Validates output, saves recommendation in database, and returns personalized plan.
    """
    profile = FinancialService.get_or_create_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your financial profile onboarding first."
        )
    
    score_summary = CreditService.get_current_score_summary(db, current_user.id)

    financial_data = {
        "user_name": current_user.name,
        "credit_score": score_summary.get("current_score"),
        "credit_category": score_summary.get("category"),
        "monthly_income": profile.monthly_income,
        "monthly_expenses": profile.monthly_expenses,
        "monthly_debt_payment": profile.monthly_debt_payment,
        "total_debt": profile.total_debt,
        "total_credit_limit": profile.total_credit_limit,
        "credit_utilization": profile.credit_utilization,
        "dti_ratio": profile.dti_ratio,
        "missed_payments": profile.missed_payments,
        "active_loans": profile.active_loans,
        "financial_goal": profile.financial_goal or "Improve credit score",
        "custom_note": request.custom_note if request else None
    }

    advice = await GeminiService.analyze_financial_profile(financial_data)

    # Persist in DB
    try:
        rec_entry = Recommendation(
            user_id=current_user.id,
            analysis=json.dumps(advice.dict()),
            recommendations=json.dumps([s.dict() for s in advice.five_step_plan])
        )
        db.add(rec_entry)
        db.commit()
    except Exception:
        db.rollback()

    return advice

@router.post("/recommendations", response_model=AIAdviceResponse)
async def get_recommendations(
    request: Optional[AIAnalyzeRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Alias endpoint for AI recommendations."""
    return await analyze_credit_health(request, current_user, db)

@router.get("/latest")
def get_latest_advice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the user's most recent AI recommendations from the database."""
    latest = db.query(Recommendation)\
        .filter(Recommendation.user_id == current_user.id)\
        .order_by(Recommendation.created_at.desc())\
        .first()
    
    if not latest:
        return None
    
    try:
        data = json.loads(latest.analysis)
        data["created_at"] = latest.created_at
        return data
    except Exception:
        return None
