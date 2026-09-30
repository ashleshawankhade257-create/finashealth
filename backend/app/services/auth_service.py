from typing import Optional, Tuple
from sqlalchemy.orm import Session
import httpx
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.core.config import settings

class AuthService:
    @staticmethod
    def register_user(db: Session, name: str, email: str, password: str) -> User:
        """Register a new user with hashed password."""
        email_clean = email.strip().lower()
        existing_user = db.query(User).filter(User.email == email_clean).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )
        
        user = User(
            name=name.strip(),
            email=email_clean,
            password_hash=hash_password(password),
            auth_provider="local"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        email_clean = email.strip().lower()
        user = db.query(User).filter(User.email == email_clean).first()
        if not user or not user.password_hash:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    async def exchange_google_code(code: str, redirect_uri: Optional[str] = None) -> dict:
        """Exchange Google authorization code for tokens and userinfo."""
        target_redirect = redirect_uri or settings.GOOGLE_REDIRECT_URI
        async with httpx.AsyncClient(timeout=15.0) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": target_redirect,
                    "grant_type": "authorization_code"
                }
            )
            
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Google OAuth token exchange failed: {token_response.text}"
                )
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            # Fetch userinfo
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            
            if userinfo_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to retrieve Google user profile."
                )
            
            return userinfo_response.json()

    @staticmethod
    async def verify_google_credential(credential: str) -> dict:
        """Verify Google ID token via Google TokenInfo endpoint."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": credential}
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Google OAuth credential."
                )
            return response.json()

    @staticmethod
    def find_or_create_google_user(db: Session, google_info: dict) -> User:
        """Find existing user by google_id or email, or create new account."""
        google_id = google_info.get("sub")
        email = google_info.get("email", "").strip().lower()
        name = google_info.get("name") or email.split("@")[0]
        picture = google_info.get("picture")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google account must have an email associated."
            )

        # Look up by google_id first
        user = db.query(User).filter(User.google_id == google_id).first()
        if not user:
            # Look up by email
            user = db.query(User).filter(User.email == email).first()
            if user:
                user.google_id = google_id
                if picture and not user.profile_picture:
                    user.profile_picture = picture
                db.commit()
                db.refresh(user)
            else:
                user = User(
                    name=name,
                    email=email,
                    google_id=google_id,
                    profile_picture=picture,
                    auth_provider="google"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            if picture and user.profile_picture != picture:
                user.profile_picture = picture
                db.commit()
                db.refresh(user)

        return user
