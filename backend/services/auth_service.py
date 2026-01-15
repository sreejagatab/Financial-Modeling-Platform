"""Authentication service with JWT token management."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from db.models.user import User, UserRole, RefreshToken

settings = get_settings()


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.access_token_expire_minutes
            )
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(
            to_encode,
            settings.secret_key,
            algorithm=settings.algorithm
        )
        return encoded_jwt

    @staticmethod
    def create_refresh_token(user_id: str) -> tuple[str, datetime]:
        """Create a refresh token."""
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        token_data = {
            "sub": user_id,
            "exp": expires_at,
            "type": "refresh",
            "jti": str(uuid4()),
        }
        token = jwt.encode(
            token_data,
            settings.secret_key,
            algorithm=settings.algorithm
        )
        return token, expires_at

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """Decode and validate a JWT token."""
        try:
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm]
            )
            return payload
        except JWTError:
            return None

    @classmethod
    async def authenticate_user(
        cls,
        db: AsyncSession,
        email: str,
        password: str
    ) -> Optional[User]:
        """Authenticate a user by email and password."""
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()

        if user is None:
            return None

        if not cls.verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            return None

        return user

    @classmethod
    async def get_user_by_email(
        cls,
        db: AsyncSession,
        email: str
    ) -> Optional[User]:
        """Get user by email."""
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    @classmethod
    async def get_user_by_id(
        cls,
        db: AsyncSession,
        user_id: str
    ) -> Optional[User]:
        """Get user by ID."""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    @classmethod
    async def create_user(
        cls,
        db: AsyncSession,
        email: str,
        password: str,
        name: str,
        role: UserRole = UserRole.ANALYST
    ) -> User:
        """Create a new user."""
        user = User(
            email=email,
            hashed_password=cls.hash_password(password),
            name=name,
            role=role,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @classmethod
    async def store_refresh_token(
        cls,
        db: AsyncSession,
        user_id: str,
        token: str,
        expires_at: datetime
    ) -> RefreshToken:
        """Store a refresh token in the database."""
        refresh_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
        )
        db.add(refresh_token)
        await db.flush()
        return refresh_token

    @classmethod
    async def revoke_refresh_token(
        cls,
        db: AsyncSession,
        token: str
    ) -> bool:
        """Revoke a refresh token."""
        result = await db.execute(
            select(RefreshToken).where(RefreshToken.token == token)
        )
        refresh_token = result.scalar_one_or_none()

        if refresh_token is None:
            return False

        refresh_token.revoked = True
        await db.flush()
        return True

    @classmethod
    async def validate_refresh_token(
        cls,
        db: AsyncSession,
        token: str
    ) -> Optional[User]:
        """Validate a refresh token and return the associated user."""
        # Decode the token
        payload = cls.decode_token(token)
        if payload is None or payload.get("type") != "refresh":
            return None

        user_id = payload.get("sub")
        if not user_id:
            return None

        # Check if token exists and is not revoked
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token == token,
                RefreshToken.revoked == False,
                RefreshToken.expires_at > datetime.now(timezone.utc)
            )
        )
        refresh_token = result.scalar_one_or_none()

        if refresh_token is None:
            return None

        # Get the user
        return await cls.get_user_by_id(db, user_id)

    @classmethod
    async def update_last_login(cls, db: AsyncSession, user: User) -> None:
        """Update the user's last login timestamp."""
        user.last_login_at = datetime.now(timezone.utc)
        await db.flush()
