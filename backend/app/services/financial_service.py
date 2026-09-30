from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from backend.app.models.financial_profile import FinancialProfile
from backend.app.models.snapshot import FinancialSnapshot
from backend.app.schemas.financial import FinancialProfileCreate, FinancialProfileUpdate
import datetime

class FinancialService:
    @staticmethod
    def calculate_metrics(
        monthly_income: float,
        monthly_expenses: float,
        total_debt: float,
        monthly_debt_payment: float,
        total_credit_limit: float
    ) -> Dict[str, float]:
        """
        Calculate DTI, Credit Utilization, and Monthly Savings safely without division by zero.
        """
        # Debt-to-Income: (Monthly Debt Payments / Monthly Gross Income) * 100
        dti = 0.0
        if monthly_income > 0:
            dti = round((monthly_debt_payment / monthly_income) * 100, 2)

        # Credit Utilization: (Total Debt or Revolving Debt / Total Credit Limit) * 100
        utilization = 0.0
        if total_credit_limit > 0:
            utilization = round((min(total_debt, total_credit_limit) / total_credit_limit) * 100, 2)
        elif total_debt > 0:
            utilization = 100.0

        # Monthly Savings: Monthly Income - Monthly Expenses - Monthly Debt Payments
        savings = round(monthly_income - monthly_expenses - monthly_debt_payment, 2)

        return {
            "dti_ratio": dti,
            "credit_utilization": utilization,
            "monthly_savings": savings
        }

    @staticmethod
    def get_or_create_profile(db: Session, user_id: int) -> Optional[FinancialProfile]:
        """Retrieve the user's financial profile."""
        return db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()

    @staticmethod
    def save_snapshot(
        db: Session,
        user_id: int,
        income: float,
        expenses: float,
        debt: float,
        utilization: float,
        dti: float,
        savings: float
    ) -> FinancialSnapshot:
        """Record an immutable snapshot of financial health metrics."""
        snapshot = FinancialSnapshot(
            user_id=user_id,
            income=income,
            expenses=expenses,
            debt=debt,
            utilization=utilization,
            dti=dti,
            savings=savings,
            created_at=datetime.datetime.utcnow()
        )
        db.add(snapshot)
        db.commit()
        db.refresh(snapshot)
        return snapshot

    @staticmethod
    def upsert_profile(db: Session, user_id: int, profile_in: FinancialProfileCreate) -> FinancialProfile:
        """Create or update a financial profile and automatically compute indicators."""
        metrics = FinancialService.calculate_metrics(
            monthly_income=profile_in.monthly_income,
            monthly_expenses=profile_in.monthly_expenses,
            total_debt=profile_in.total_debt,
            monthly_debt_payment=profile_in.monthly_debt_payment,
            total_credit_limit=profile_in.total_credit_limit
        )

        profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
        if not profile:
            profile = FinancialProfile(
                user_id=user_id,
                monthly_income=profile_in.monthly_income,
                monthly_expenses=profile_in.monthly_expenses,
                total_debt=profile_in.total_debt,
                monthly_debt_payment=profile_in.monthly_debt_payment,
                total_credit_limit=profile_in.total_credit_limit,
                credit_utilization=metrics["credit_utilization"],
                dti_ratio=metrics["dti_ratio"],
                active_loans=profile_in.active_loans,
                missed_payments=profile_in.missed_payments,
                financial_goal=profile_in.financial_goal or "Improve credit score"
            )
            db.add(profile)
        else:
            profile.monthly_income = profile_in.monthly_income
            profile.monthly_expenses = profile_in.monthly_expenses
            profile.total_debt = profile_in.total_debt
            profile.monthly_debt_payment = profile_in.monthly_debt_payment
            profile.total_credit_limit = profile_in.total_credit_limit
            profile.credit_utilization = metrics["credit_utilization"]
            profile.dti_ratio = metrics["dti_ratio"]
            profile.active_loans = profile_in.active_loans
            profile.missed_payments = profile_in.missed_payments
            if profile_in.financial_goal:
                profile.financial_goal = profile_in.financial_goal

        db.commit()
        db.refresh(profile)

        # Record financial snapshot
        FinancialService.save_snapshot(
            db=db,
            user_id=user_id,
            income=profile.monthly_income,
            expenses=profile.monthly_expenses,
            debt=profile.total_debt,
            utilization=metrics["credit_utilization"],
            dti=metrics["dti_ratio"],
            savings=metrics["monthly_savings"]
        )

        return profile

    @staticmethod
    def get_snapshots(db: Session, user_id: int) -> List[FinancialSnapshot]:
        """Fetch all historical snapshots for charting."""
        return db.query(FinancialSnapshot)\
            .filter(FinancialSnapshot.user_id == user_id)\
            .order_by(FinancialSnapshot.created_at.asc())\
            .all()
