from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.routers.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.credit import (
    CreditScoreCreate,
    CreditScoreRecord,
    CreditScoreCurrentResponse,
    CreditScoreHistoryResponse
)
from backend.app.services.credit_service import CreditService

router = APIRouter(prefix="/credit", tags=["Credit Score"])

@router.get("/current", response_model=CreditScoreCurrentResponse)
def get_current_credit_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the latest recorded credit score, change delta, and rating category."""
    return CreditService.get_current_score_summary(db, current_user.id)

@router.get("/history", response_model=CreditScoreHistoryResponse)
def get_credit_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full chronological credit score history for visualization and delta tracking."""
    summary = CreditService.get_current_score_summary(db, current_user.id)
    history = CreditService.get_score_history(db, current_user.id)
    return {
        "current": summary,
        "history": history
    }

@router.post("/history", response_model=CreditScoreCurrentResponse)
def add_credit_score(
    score_in: CreditScoreCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a newly obtained CIBIL score."""
    CreditService.record_score(
        db=db,
        user_id=current_user.id,
        score=score_in.credit_score,
        source=score_in.source or "user_reported"
    )
    return CreditService.get_current_score_summary(db, current_user.id)
