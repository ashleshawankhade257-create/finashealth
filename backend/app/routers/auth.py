import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.schemas.auth import RegisterRequest, LoginRequest, GoogleAuthRequest, TokenResponse
from backend.app.schemas.user import UserResponse
from backend.app.models.user import User
from backend.app.services.auth_service import AuthService
from backend.app.core.security import create_access_token
from backend.app.core.config import settings
from backend.app.routers.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user using email and password."""
    if request.confirm_password and request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )
    
    user = AuthService.register_user(
        db=db,
        name=request.name,
        email=request.email,
        password=request.password
    )
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "auth_provider": user.auth_provider,
            "profile_picture": user.profile_picture,
            "has_profile": False
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password."""
    user = AuthService.authenticate_user(
        db=db,
        email=request.email,
        password=request.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )
    
    access_token = create_access_token(subject=user.id)
    has_profile = user.financial_profile is not None
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "auth_provider": user.auth_provider,
            "profile_picture": user.profile_picture,
            "has_profile": has_profile
        }
    }

@router.post("/logout")
def logout():
    """Client-side token disposal endpoint."""
    return {"message": "Successfully logged out."}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    has_profile = current_user.financial_profile is not None
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "google_id": current_user.google_id,
        "profile_picture": current_user.profile_picture,
        "auth_provider": current_user.auth_provider,
        "has_profile": has_profile,
        "created_at": current_user.created_at
    }

@router.get("/google/login")
def google_oauth_login(frontend_redirect: str = Query(default=None)):
    """
    Initiate official Google OAuth 2.0 authorization redirect.
    Redirects to accounts.google.com/o/oauth2/v2/auth with minimum requested scopes (openid, email, profile).
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GOOGLE_CLIENT_ID is not configured in backend environment variables."
        )
    
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account"
    }
    
    if frontend_redirect:
        params["state"] = frontend_redirect

    google_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return {"url": google_url}

@router.get("/google/callback")
async def google_oauth_callback(
    code: str = Query(...),
    state: str = Query(default=None),
    db: Session = Depends(get_db)
):
    """
    Handle official Google OAuth 2.0 callback:
    Exchanges code for tokens, retrieves profile, creates/finds user, and redirects to frontend.
    """
    try:
        user_info = await AuthService.exchange_google_code(code)
        user = AuthService.find_or_create_google_user(db, user_info)
        access_token = create_access_token(subject=user.id)
        
        target_frontend = state or settings.FRONTEND_URL
        redirect_url = f"{target_frontend}/auth/callback?token={access_token}&user_id={user.id}"
        return RedirectResponse(url=redirect_url)
    except Exception as e:
        target_frontend = state or settings.FRONTEND_URL
        error_encoded = urllib.parse.quote(str(e))
        return RedirectResponse(url=f"{target_frontend}/login?error={error_encoded}")

@router.post("/google/verify", response_model=TokenResponse)
async def verify_google_token(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Verify Google Sign-In credential / ID Token from Google Identity Services button on frontend.
    """
    if not payload.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google credential token is missing."
        )
    
    user_info = await AuthService.verify_google_credential(payload.credential)
    user = AuthService.find_or_create_google_user(db, user_info)
    access_token = create_access_token(subject=user.id)
    has_profile = user.financial_profile is not None

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "auth_provider": user.auth_provider,
            "profile_picture": user.profile_picture,
            "has_profile": has_profile
        }
    }
