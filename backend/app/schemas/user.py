import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserResponse(UserBase):
    id: int
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None
    auth_provider: str
    has_profile: bool = False
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_picture: Optional[str] = None
