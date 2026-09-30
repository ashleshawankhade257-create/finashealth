import json
import logging
from typing import Dict, Any, Optional
import httpx
from backend.app.core.config import settings
from backend.app.schemas.ai import AIAdviceResponse, StepItem, MonthlyTarget

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Credit Assistant, an educational financial wellness AI for users in India.
Analyze the user's provided financial metrics and explain their credit-health situation clearly.
Use only the information supplied in the request.
Do not invent financial data.
Do not claim access to CIBIL, banks, credit bureaus, or private financial accounts.
Do not guarantee a future credit score.
Identify the most important financial bottlenecks.
Provide practical, prioritized actions.
Consider Indian financial terminology such as CIBIL score, EMI, credit utilization, loans, and missed payments.
Clearly distinguish calculated metrics from reported credit scores.
Do not provide regulated investment, tax, lending, or legal advice.
Return strictly valid JSON matching the specified JSON schema without any markdown formatting or ticks.
"""

def generate_deterministic_fallback(financial_data: Dict[str, Any]) -> AIAdviceResponse:
    """Generate high-quality rule-based deterministic financial recommendations when AI is offline."""
    credit_score = financial_data.get("credit_score") or 650
    income = financial_data.get("monthly_income", 0)
    expenses = financial_data.get("monthly_expenses", 0)
    debt = financial_data.get("total_debt", 0)
    emi = financial_data.get("monthly_debt_payment", 0)
    credit_limit = financial_data.get("total_credit_limit", 0)
    utilization = financial_data.get("credit_utilization", 0)
    dti = financial_data.get("dti_ratio", 0)
    missed_payments = financial_data.get("missed_payments", 0)
    active_loans = financial_data.get("active_loans", 0)
    savings = income - expenses - emi

    risks = []
    positives = []
    priorities = []
    plan: list[StepItem] = []
    targets: list[MonthlyTarget] = []

    # Analyze credit score
    if credit_score < 600:
        risks.append("Reported credit score is in the Poor band (<600), which restricts access to institutional credit.")
    elif credit_score < 700:
        risks.append("Score is in the Fair band (600-699). Lenders may charge higher interest rates or processing fees.")
    else:
        positives.append(f"Strong reported credit score of {credit_score}, indicating established credit discipline.")

    # Analyze utilization
    if utilization > 50:
        risks.append(f"Credit card utilization is high at {utilization:.1f}% (recommended threshold is under 30%).")
        priorities.append("Bring revolving credit card balances below 30% of total sanctioned limits.")
    elif utilization <= 30 and credit_limit > 0:
        positives.append(f"Healthy credit utilization of {utilization:.1f}%, keeping credit appetite low.")

    # Analyze DTI
    if dti > 40:
        risks.append(f"High Debt-to-Income (DTI) ratio of {dti:.1f}%. Over 40% of income is committed to EMIs.")
        priorities.append("Avoid taking any new credit lines until existing debt burden decreases.")
    else:
        positives.append(f"Comfortable DTI ratio of {dti:.1f}%, leaving reasonable disposable headroom.")

    # Missed payments
    if missed_payments > 0:
        risks.append(f"{missed_payments} missed/delayed payment(s) reported, which heavily penalize credit scores.")
        priorities.append("Set up NACH / Auto-Debit mandates for all active loans and credit cards immediately.")
    else:
        positives.append("Clean payment record with zero missed payments reported.")

    # Monthly cash flow
    if savings < 0:
        risks.append("Monthly cash flow is negative. Expenses and debt payments exceed current income.")
        priorities.append("Audit discretionary subscriptions and pause non-essential spends immediately.")
    else:
        positives.append(f"Positive monthly disposable savings of ₹{savings:,.0f} available for debt paydown.")

    # Build 5-step plan
    plan.append(StepItem(
        step=1,
        title="Automate Every EMI & Credit Card Minimum Due",
        description="Payment history constitutes roughly 35% of your credit profile. Activate auto-debit on your primary bank account so no bill cycle is missed.",
        target_timeline="Week 1 - 2",
        impact_level="High"
    ))
    plan.append(StepItem(
        step=2,
        title="Target 30% Credit Utilization Ceiling",
        description=f"Your current utilization is {utilization:.1f}%. Aim to repay balances or request an issuer limit enhancement without increasing spending.",
        target_timeline="Month 1 - 3",
        impact_level="High"
    ))
    plan.append(StepItem(
        step=3,
        title="Deploy Debt Avalanche or Snowball on High-Cost Debt",
        description="Prioritize outstanding credit card rollovers and personal loans first to stop interest compounding, while continuing base EMIs on secured loans.",
        target_timeline="Month 2 - 6",
        impact_level="High"
    ))
    plan.append(StepItem(
        step=4,
        title="Establish a 3-Month Emergency Liquidity Buffer",
        description="Direct at least 15% of monthly savings into a high-yield liquid mutual fund or sweep-in fixed deposit to prevent future debt dependency during unexpected events.",
        target_timeline="Month 3 - 9",
        impact_level="Medium"
    ))
    plan.append(StepItem(
        step=5,
        title="Periodic Credit Report Audit & Dispute Check",
        description="Request an official bureau report once every quarter to confirm resolved accounts are reported as 'Closed' and not 'Settled' or 'Written Off'.",
        target_timeline="Quarterly",
        impact_level="Medium"
    ))

    targets.append(MonthlyTarget(
        month="Month 1",
        target_metric="Payment Discipline",
        action_goal="100% on-time payment track record; enable standing instructions on all accounts."
    ))
    targets.append(MonthlyTarget(
        month="Month 2",
        target_metric="Credit Utilization",
        action_goal=f"Reduce utilization from {utilization:.1f}% towards target threshold of 30%."
    ))
    targets.append(MonthlyTarget(
        month="Month 3",
        target_metric="Debt Servicing Headroom",
        action_goal="Clear at least one minor outstanding revolving balance to free up monthly cash flow."
    ))

    overall = f"Based on your profile with a reported score of {credit_score}, a DTI of {dti:.1f}%, and {utilization:.1f}% credit utilization, your financial posture is poised for meaningful improvement by targeting high-interest debt and maintaining strict payment consistency."

    return AIAdviceResponse(
        overall_assessment=overall,
        risk_factors=risks if risks else ["No acute risk factors detected; maintain proactive financial oversight."],
        positive_factors=positives if positives else ["Solid foundation with documented metrics ready for optimization."],
        priority_actions=priorities if priorities else ["Maintain low credit card balance utilization and build emergency funds."],
        five_step_plan=plan,
        monthly_targets=targets,
        explanation="This analysis analyzes user-provided numbers to highlight bottlenecks in debt allocation, repayment reliability, and credit bandwidth in the Indian lending landscape.",
        disclaimer="AI-generated educational guidance. This tool is not an authorized credit bureau, bank, or NBFC, and does not guarantee specific bureau credit score increases."
    )

class GeminiService:
    @staticmethod
    async def analyze_financial_profile(financial_data: Dict[str, Any]) -> AIAdviceResponse:
        """Analyze financial data using Gemini 2.5 Flash with structured JSON schema or graceful fallback."""
        api_key = settings.GEMINI_API_KEY
        model = settings.GEMINI_MODEL or "gemini-2.5-flash"

        if not api_key or api_key == "MY_GEMINI_API_KEY" or api_key.startswith("your-"):
            logger.info("Gemini API key not configured. Using deterministic financial intelligence engine.")
            return generate_deterministic_fallback(financial_data)

        prompt_payload = {
            "financial_data": financial_data,
            "instruction": "Analyze this user's credit health for the Indian financial context. Respond with valid JSON matching the exact schema."
        }

        request_body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": SYSTEM_PROMPT},
                        {"text": json.dumps(prompt_payload)}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json",
            }
        }

        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(endpoint, json=request_body)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        parsed = json.loads(text_content)
                        return AIAdviceResponse(**parsed)
                else:
                    logger.warning(f"Gemini API returned status {res.status_code}: {res.text}. Falling back to rule engine.")
        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}. Falling back to rule engine.")

        return generate_deterministic_fallback(financial_data)
