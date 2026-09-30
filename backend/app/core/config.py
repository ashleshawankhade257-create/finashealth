import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "Credit Assistant"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "credit_assistant_super_secure_secret_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./credit_assistant.db")

    # Google OAuth 2.0
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")

    # Google Gemini AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Application URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")

    # Credit Score Bands (CIBIL Range: 300 - 900)
    SCORE_MIN: int = 300
    SCORE_MAX: int = 900
    SCORE_POOR_MAX: int = int(os.getenv("SCORE_POOR_MAX", "579"))
    SCORE_FAIR_MAX: int = int(os.getenv("SCORE_FAIR_MAX", "669"))
    SCORE_GOOD_MAX: int = int(os.getenv("SCORE_GOOD_MAX", "739"))
    SCORE_VERY_GOOD_MAX: int = int(os.getenv("SCORE_VERY_GOOD_MAX", "799"))
    SCORE_EXCELLENT_MAX: int = int(os.getenv("SCORE_EXCELLENT_MAX", "900"))

settings = Settings()
