import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.main import app
from backend.app.database.database import Base, get_db
from backend.app.services.financial_service import FinancialService
from backend.app.services.credit_service import CreditService

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True, scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

client = TestClient(app)

def test_health_check():
    """Verify health endpoint returns status 200."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_financial_calculations_unit():
    """Verify mathematical formulas for DTI, Utilization, and Savings."""
    # Monthly Income = 60,000, EMI = 12,000 => DTI = 20%
    # Total Debt = 72,000, Total Credit Limit = 100,000 => Utilization = 72%
    # Monthly Expenses = 35,000 => Savings = 60,000 - 35,000 - 12,000 = 13,000
    metrics = FinancialService.calculate_metrics(
        monthly_income=60000.0,
        monthly_expenses=35000.0,
        total_debt=72000.0,
        monthly_debt_payment=12000.0,
        total_credit_limit=100000.0
    )
    assert metrics["dti_ratio"] == 20.0
    assert metrics["credit_utilization"] == 72.0
    assert metrics["monthly_savings"] == 13000.0

def test_credit_categories():
    """Verify CIBIL score band mapping."""
    cat, color, _ = CreditService.get_score_category(520)
    assert cat == "Poor"
    cat, color, _ = CreditService.get_score_category(640)
    assert cat == "Fair"
    cat, color, _ = CreditService.get_score_category(710)
    assert cat == "Good"
    cat, color, _ = CreditService.get_score_category(770)
    assert cat == "Very Good"
    cat, color, _ = CreditService.get_score_category(820)
    assert cat == "Excellent"

def test_user_registration_and_login():
    """Verify user registration, token generation, and login."""
    reg_data = {
        "name": "Aarav Sharma",
        "email": "aarav.test@example.com",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    }
    reg_res = client.post("/auth/register", json=reg_data)
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    assert token is not None

    # Test duplicate registration rejection
    dup_res = client.post("/auth/register", json=reg_data)
    assert dup_res.status_code == 400

    # Test login
    login_res = client.post("/auth/login", json={
        "email": "aarav.test@example.com",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert login_res.json()["access_token"] is not None

    # Test invalid login credentials
    bad_login = client.post("/auth/login", json={
        "email": "aarav.test@example.com",
        "password": "WrongPassword"
    })
    assert bad_login.status_code == 401

def test_protected_routes_unauthorized():
    """Ensure protected routes reject unauthenticated requests."""
    res = client.get("/auth/me")
    assert res.status_code == 401
    res = client.get("/dashboard/summary")
    assert res.status_code == 401

def test_financial_profile_and_dashboard_flow():
    """Verify onboarding financial profile creation, score tracking, and dashboard summary."""
    # Register user
    reg = client.post("/auth/register", json={
        "name": "Priya Patel",
        "email": "priya.patel@example.com",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Onboarding profile setup
    profile_data = {
        "monthly_income": 75000.0,
        "monthly_expenses": 30000.0,
        "total_debt": 150000.0,
        "monthly_debt_payment": 15000.0,
        "total_credit_limit": 200000.0,
        "active_loans": 1,
        "missed_payments": 0,
        "financial_goal": "Improve credit score",
        "credit_score": 710
    }
    prof_res = client.post("/financial/profile", json=profile_data, headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["dti_ratio"] == 20.0
    assert prof_res.json()["credit_utilization"] == 75.0

    # Test dashboard summary
    dash_res = client.get("/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    summary = dash_res.json()
    assert summary["score"]["current_score"] == 710
    assert summary["score"]["category"] == "Good"
    assert summary["profile"]["monthly_income"] == 75000.0

    # Update credit score
    new_score_res = client.post("/credit/history", json={"credit_score": 735}, headers=headers)
    assert new_score_res.status_code == 200
    assert new_score_res.json()["current_score"] == 735
    assert new_score_res.json()["delta"] == 25  # +25 points improvement
