from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.routers.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.user import UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user details."""
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

@router.put("/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile attributes like name or avatar."""
    if user_update.name is not None:
        current_user.name = user_update.name.strip()
    if user_update.profile_picture is not None:
        current_user.profile_picture = user_update.profile_picture.strip()
    
    db.commit()
    db.refresh(current_user)
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
