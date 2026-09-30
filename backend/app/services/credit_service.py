from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.credit_history import CreditScoreHistory
from backend.app.core.config import settings
import datetime

class CreditService:
    @staticmethod
    def get_score_category(score: Optional[int]) -> Tuple[str, str, str]:
        """
        Return (category_name, color_token, interpretation) based on CIBIL-style score bands.
        """
        if score is None:
            return "No Score", "slate", "Record your score to unlock insights."
        
        if score <= settings.SCORE_POOR_MAX:
            return "Poor", "rose", "Credit risk is elevated. Significant opportunity to rebuild credit through disciplined payments."
        elif score <= settings.SCORE_FAIR_MAX:
            return "Fair", "amber", "Below average credit profile. Small adjustments can quickly boost you into the Good range."
        elif score <= settings.SCORE_GOOD_MAX:
            return "Good", "blue", "Healthy credit profile. Eligible for most standard loans and competitive credit cards."
        elif score <= settings.SCORE_VERY_GOOD_MAX:
            return "Very Good", "emerald", "Strong credit history. Qualifies for prime interest rates and premier credit limits."
        else:
            return "Excellent", "violet", "Elite financial standing. Maximum loan eligibility and lowest possible interest rates."

    @staticmethod
    def record_score(db: Session, user_id: int, score: int, source: str = "user_reported") -> CreditScoreHistory:
        """Record a new credit score entry for the user."""
        entry = CreditScoreHistory(
            user_id=user_id,
            credit_score=score,
            source=source,
            recorded_at=datetime.datetime.utcnow()
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def get_current_score_summary(db: Session, user_id: int) -> Dict[str, Any]:
        """Fetch current score, previous score, delta, category, and interpretation."""
        histories = db.query(CreditScoreHistory)\
            .filter(CreditScoreHistory.user_id == user_id)\
            .order_by(CreditScoreHistory.recorded_at.desc())\
            .all()
        
        if not histories:
            category, color, interpretation = CreditService.get_score_category(None)
            return {
                "current_score": None,
                "previous_score": None,
                "delta": None,
                "category": category,
                "category_color": color,
                "recorded_at": None,
                "interpretation": interpretation
            }
        
        current_entry = histories[0]
        prev_entry = histories[1] if len(histories) > 1 else None
        
        current_score = current_entry.credit_score
        prev_score = prev_entry.credit_score if prev_entry else None
        delta = (current_score - prev_score) if prev_score is not None else 0
        
        category, color, interpretation = CreditService.get_score_category(current_score)
        
        return {
            "current_score": current_score,
            "previous_score": prev_score,
            "delta": delta,
            "category": category,
            "category_color": color,
            "recorded_at": current_entry.recorded_at,
            "interpretation": interpretation
        }

    @staticmethod
    def get_score_history(db: Session, user_id: int) -> List[CreditScoreHistory]:
        """Get chronological history of credit scores."""
        return db.query(CreditScoreHistory)\
            .filter(CreditScoreHistory.user_id == user_id)\
            .order_by(CreditScoreHistory.recorded_at.asc())\
            .all()
