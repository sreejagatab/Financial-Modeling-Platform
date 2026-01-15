"""Authentication API endpoints."""

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.dependencies import CurrentUser, DbSession
from db.models.base import get_db
from db.models.user import UserRole
from services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


# Request/Response models
class UserRegister(BaseModel):
    """User registration request."""
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    """User login request."""
    email: EmailStr
    password: str


class TokenRefresh(BaseModel):
    """Token refresh request."""
    refresh_token: str


class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """User response."""
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: DbSession
) -> UserResponse:
    """Register a new user."""
    # Check if email already exists
    existing_user = await AuthService.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate password
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )

    # Create user
    user = await AuthService.create_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        name=user_data.name,
        role=UserRole.ANALYST,
    )

    await db.commit()

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role.value if isinstance(user.role, UserRole) else user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: DbSession
) -> TokenResponse:
    """Login and get access tokens."""
    user = await AuthService.authenticate_user(
        db=db,
        email=credentials.email,
        password=credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    access_token = AuthService.create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    refresh_token, expires_at = AuthService.create_refresh_token(user.id)

    # Store refresh token
    await AuthService.store_refresh_token(
        db=db,
        user_id=user.id,
        token=refresh_token,
        expires_at=expires_at
    )

    # Update last login
    await AuthService.update_last_login(db, user)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token_data: TokenRefresh,
    db: DbSession
) -> TokenResponse:
    """Refresh access token using refresh token."""
    user = await AuthService.validate_refresh_token(db, token_data.refresh_token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Revoke old refresh token
    await AuthService.revoke_refresh_token(db, token_data.refresh_token)

    # Create new tokens
    access_token = AuthService.create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role}
    )
    new_refresh_token, expires_at = AuthService.create_refresh_token(user.id)

    # Store new refresh token
    await AuthService.store_refresh_token(
        db=db,
        user_id=user.id,
        token=new_refresh_token,
        expires_at=expires_at
    )

    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=settings.access_token_expire_minutes * 60
    )


@router.post("/logout", response_model=MessageResponse)
async def logout(
    token_data: TokenRefresh,
    db: DbSession
) -> MessageResponse:
    """Logout and revoke refresh token."""
    revoked = await AuthService.revoke_refresh_token(db, token_data.refresh_token)
    await db.commit()

    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token"
        )

    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: CurrentUser
) -> UserResponse:
    """Get current user's profile."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role.value if isinstance(current_user.role, UserRole) else current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
    )


@router.put("/me", response_model=UserResponse)
async def update_profile(
    current_user: CurrentUser,
    db: DbSession,
    name: str | None = None,
    avatar_url: str | None = None
) -> UserResponse:
    """Update current user's profile."""
    if name:
        current_user.name = name
    if avatar_url:
        current_user.avatar_url = avatar_url

    await db.commit()
    await db.refresh(current_user)

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role.value if isinstance(current_user.role, UserRole) else current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
    )


class PasswordChange(BaseModel):
    """Password change request."""
    current_password: str
    new_password: str


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    password_data: PasswordChange,
    current_user: CurrentUser,
    db: DbSession
) -> MessageResponse:
    """Change current user's password."""
    # Verify current password
    if not AuthService.verify_password(
        password_data.current_password,
        current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters"
        )

    # Update password
    current_user.hashed_password = AuthService.hash_password(password_data.new_password)
    await db.commit()

    return MessageResponse(message="Password changed successfully")
