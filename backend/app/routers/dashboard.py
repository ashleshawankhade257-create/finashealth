from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.routers.deps import get_current_user
from backend.app.models.user import User
from backend.app.services.credit_service import CreditService
from backend.app.services.financial_service import FinancialService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve combined summary data for the main fintech dashboard."""
    score_summary = CreditService.get_current_score_summary(db, current_user.id)
    profile = FinancialService.get_or_create_profile(db, current_user.id)

    if not profile:
        return {
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
                "profile_picture": current_user.profile_picture,
                "has_profile": False
            },
            "score": score_summary,
            "profile": None,
            "metrics": {
                "dti": {"value": 0, "status": "No Data", "action": "Complete onboarding"},
                "utilization": {"value": 0, "status": "No Data", "action": "Complete onboarding"},
                "savings": {"value": 0, "status": "No Data", "action": "Complete onboarding"},
                "debt": {"value": 0, "status": "No Data", "action": "Complete onboarding"},
                "loans": {"value": 0, "status": "No Data", "action": "Complete onboarding"},
                "missed_payments": {"value": 0, "status": "No Data", "action": "Complete onboarding"}
            }
        }

    savings = round(profile.monthly_income - profile.monthly_expenses - profile.monthly_debt_payment, 2)
    
    # Evaluate DTI status
    if profile.dti_ratio <= 20:
        dti_status = "Optimal"
        dti_color = "emerald"
        dti_action = "Excellent debt control. Keep debt obligations under this threshold."
    elif profile.dti_ratio <= 35:
        dti_status = "Manageable"
        dti_color = "blue"
        dti_action = "Healthy range for most lenders. Avoid accumulating discretionary debt."
    elif profile.dti_ratio <= 45:
        dti_status = "High"
        dti_color = "amber"
        dti_action = "Consider prepayment strategies to free up income capacity."
    else:
        dti_status = "Critical"
        dti_color = "rose"
        dti_action = "High vulnerability. Prioritize loan consolidation or aggressive debt paydown."

    # Evaluate Utilization status
    if profile.credit_utilization <= 30:
        util_status = "Optimal"
        util_color = "emerald"
        util_action = "Superb credit discipline. This boosts CIBIL rating significantly."
    elif profile.credit_utilization <= 50:
        util_status = "Moderate"
        util_color = "amber"
        util_action = "Aim to pay down card balances before statement generation date."
    else:
        util_status = "High Risk"
        util_color = "rose"
        util_action = "Credit bureau flags >50% utilization as high credit dependence."

    # Evaluate Savings
    if savings > (profile.monthly_income * 0.2):
        savings_status = "Strong"
        savings_color = "emerald"
        savings_action = "Saving >20% of gross income. Build your emergency buffer."
    elif savings > 0:
        savings_status = "Positive"
        savings_color = "blue"
        savings_action = "Cash flow is positive, but build more buffer against emergencies."
    else:
        savings_status = "Deficit"
        savings_color = "rose"
        savings_action = "Expenses exceed income. Immediate budget restructuring required."

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "profile_picture": current_user.profile_picture,
            "has_profile": True
        },
        "score": score_summary,
        "profile": {
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
            "financial_goal": profile.financial_goal
        },
        "metrics": {
            "dti": {
                "value": profile.dti_ratio,
                "status": dti_status,
                "color": dti_color,
                "action": dti_action
            },
            "utilization": {
                "value": profile.credit_utilization,
                "status": util_status,
                "color": util_color,
                "action": util_action
            },
            "savings": {
                "value": savings,
                "status": savings_status,
                "color": savings_color,
                "action": savings_action
            },
            "debt": {
                "value": profile.total_debt,
                "status": "Monitored",
                "color": "slate",
                "action": f"₹{profile.monthly_debt_payment:,.0f} committed in monthly debt servicing."
            },
            "loans": {
                "value": profile.active_loans,
                "status": "Active Accounts",
                "color": "slate",
                "action": "Ensure all loan accounts reflect active auto-debit."
            },
            "missed_payments": {
                "value": profile.missed_payments,
                "status": "Warning" if profile.missed_payments > 0 else "Clean Record",
                "color": "rose" if profile.missed_payments > 0 else "emerald",
                "action": "Maintain zero 30+ DPD (days past due) records." if profile.missed_payments == 0 else "Immediate remediation recommended to prevent bureau reporting."
            }
        }
    }

@router.get("/analytics")
def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Provide structured chart series for Recharts LineChart and PieChart."""
    histories = CreditService.get_score_history(db, current_user.id)
    profile = FinancialService.get_or_create_profile(db, current_user.id)
    snapshots = FinancialService.get_snapshots(db, current_user.id)

    # 1. Credit Score Timeline (for Recharts LineChart)
    score_timeline = []
    for h in histories:
        score_timeline.append({
            "id": h.id,
            "date": h.recorded_at.strftime("%b %d, %Y"),
            "shortDate": h.recorded_at.strftime("%b %d"),
            "score": h.credit_score,
            "source": h.source
        })

    # 2. Credit Utilization Pie Chart Data
    used_credit = 0.0
    available_credit = 0.0
    utilization_pct = 0.0

    if profile and profile.total_credit_limit > 0:
        used_credit = min(profile.total_debt, profile.total_credit_limit)
        available_credit = max(0.0, profile.total_credit_limit - used_credit)
        utilization_pct = profile.credit_utilization
    elif profile and profile.total_debt > 0:
        used_credit = profile.total_debt
        available_credit = 0.0
        utilization_pct = 100.0

    utilization_data = [
        {"name": "Used Credit", "value": round(used_credit, 2), "color": "#f43f5e"},
        {"name": "Available Credit", "value": round(available_credit, 2), "color": "#10b981"}
    ]

    # 3. Monthly Financial Snapshots
    snapshot_series = []
    for s in snapshots:
        snapshot_series.append({
            "date": s.created_at.strftime("%b %d"),
            "income": s.income,
            "expenses": s.expenses,
            "debt": s.debt,
            "savings": s.savings,
            "dti": s.dti,
            "utilization": s.utilization
        })

    return {
        "score_timeline": score_timeline,
        "utilization_breakdown": utilization_data,
        "utilization_percentage": utilization_pct,
        "total_credit_limit": profile.total_credit_limit if profile else 0,
        "snapshots": snapshot_series
    }
