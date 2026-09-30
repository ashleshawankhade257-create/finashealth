import os
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.database.database import engine, Base, SessionLocal
from backend.app.routers import auth, financial, credit, dashboard, ai, users
from backend.app.models.user import User
from backend.app.models.financial_profile import FinancialProfile
from backend.app.models.credit_history import CreditScoreHistory
from backend.app.models.snapshot import FinancialSnapshot
from backend.app.core.security import hash_password

def seed_demo_user():
    """Seed the optional demo user requested in specification."""
    db = SessionLocal()
    try:
        demo_email = "demo@creditassistant.in"
        existing = db.query(User).filter(User.email == demo_email).first()
        if not existing:
            demo_user = User(
                name="Demo User",
                email=demo_email,
                password_hash=hash_password("DemoPassword123!"),
                auth_provider="local"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Financial profile
            profile = FinancialProfile(
                user_id=demo_user.id,
                monthly_income=60000.0,
                monthly_expenses=35000.0,
                total_debt=180000.0,
                monthly_debt_payment=12000.0,
                total_credit_limit=250000.0,
                credit_utilization=72.0,
                dti_ratio=20.0,
                active_loans=2,
                missed_payments=1,
                financial_goal="Improve credit score"
            )
            db.add(profile)

            # Historical score records showing growth
            dates_scores = [
                (datetime.datetime.utcnow() - datetime.timedelta(days=120), 640),
                (datetime.datetime.utcnow() - datetime.timedelta(days=90), 652),
                (datetime.datetime.utcnow() - datetime.timedelta(days=60), 660),
                (datetime.datetime.utcnow() - datetime.timedelta(days=30), 671),
                (datetime.datetime.utcnow(), 680),
            ]
            for recorded_date, sc in dates_scores:
                hist = CreditScoreHistory(
                    user_id=demo_user.id,
                    credit_score=sc,
                    source="user_reported",
                    recorded_at=recorded_date
                )
                db.add(hist)

            # Snapshot
            snap = FinancialSnapshot(
                user_id=demo_user.id,
                income=60000.0,
                expenses=35000.0,
                debt=180000.0,
                utilization=72.0,
                dti=20.0,
                savings=13000.0,
                created_at=datetime.datetime.utcnow()
            )
            db.add(snap)
            db.commit()
            print("Demo user seeded successfully: demo@creditassistant.in / DemoPassword123!")
    except Exception as e:
        print(f"Error seeding demo user: {e}")
        db.rollback()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables automatically on startup
    Base.metadata.create_all(bind=engine)
    seed_demo_user()
    yield

app = FastAPI(
    title="Credit Assistant API",
    description="AI-Powered Credit Health & Financial Wellness Platform for India",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    settings.FRONTEND_URL
]
if os.getenv("APP_URL"):
    origins.append(os.getenv("APP_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for flexible preview container networking
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(financial.router)
app.include_router(credit.router)
app.include_router(dashboard.router)
app.include_router(ai.router)
app.include_router(users.router)

@app.get("/health", tags=["Health"])
def health_check():
    """Service health and connectivity validation endpoint."""
    return {
        "status": "healthy",
        "service": "Credit Assistant API",
        "version": settings.VERSION,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Credit Assistant API",
        "documentation": "/docs"
    }
