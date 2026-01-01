"""
Authentication service with register, login, and token refresh.
"""

from datetime import timedelta
from typing import Tuple

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import UnauthorizedException, ConflictException, NotFoundException
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.email_service import EmailService


class AuthService:
    """Service for authentication operations"""

    @staticmethod
    async def register(user_data: UserCreate) -> TokenResponse:
        """
        Register a new user and return tokens.
        Raises ConflictException if email already exists.
        """
        # Check if email already exists
        existing_user = await User.find_one(User.email == user_data.email)
        if existing_user:
            raise ConflictException(detail="Email already registered")

        # Check if hrmsx_user_id already exists (if provided)
        if user_data.hrmsx_user_id:
            existing_hrmsx = await User.find_one(User.hrmsx_user_id == user_data.hrmsx_user_id)
            if existing_hrmsx:
                raise ConflictException(detail="HRMSX user ID already registered")

        # Create new user
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            full_name=user_data.full_name,
            role=user_data.role,
            hrmsx_user_id=user_data.hrmsx_user_id,
            is_active=True,
        )
        await user.create()

        # Generate tokens
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "email": user.email}
        )

        user_data_for_response = user.model_dump()
        user_data_for_response["id"] = str(user.id)
        user_response = UserResponse.model_validate(user_data_for_response)

        # Send welcome email
        try:
            email_service = EmailService()
            email_service.send_email(
                to_email=user_data.email,
                subject="Welcome to Project Gemini!",
                template_name="welcome.html",
                user_name=user_data.full_name,
                dashboard_url=f"{settings.FRONTEND_URL}/dashboard" if hasattr(settings, 'FRONTEND_URL') else "https://projectgemini.com/dashboard"
            )
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
            # Don't fail the registration if email sending fails

        return TokenResponse(
            access_token=access_token, refresh_token=refresh_token, user=user_response
        )

    @staticmethod
    async def login(credentials: UserLogin) -> TokenResponse:
        """
        Authenticate user and return tokens.
        Raises UnauthorizedException if credentials are invalid.
        """
        # Find user by email
        user = await User.find_one(User.email == credentials.email)
        if not user:
            raise UnauthorizedException(detail="Invalid email or password")

        # Check if user is active
        if not user.is_active:
            raise UnauthorizedException(detail="Account is inactive")

        # Verify password
        if not verify_password(credentials.password, user.password_hash):
            raise UnauthorizedException(detail="Invalid email or password")

        # Generate tokens
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role}
        )
        refresh_token = create_refresh_token(
            data={"sub": str(user.id), "email": user.email}
        )

        user_data_for_response = user.model_dump()
        user_data_for_response["id"] = str(user.id)
        user_response = UserResponse.model_validate(user_data_for_response)

        return TokenResponse(
            access_token=access_token, refresh_token=refresh_token, user=user_response
        )

    @staticmethod
    async def refresh_token(refresh_token: str) -> Tuple[str, str]:
        """
        Generate new access and refresh tokens from a valid refresh token.
        Raises UnauthorizedException if token is invalid or user not found.
        """
        # Decode refresh token
        payload = decode_token(refresh_token)

        # Validate token type
        if payload.get("type") != "refresh":
            raise UnauthorizedException(detail="Invalid token type")

        # Get user ID from payload
        user_id = payload.get("sub")
        if not user_id:
            raise UnauthorizedException(detail="Invalid token payload")

        # Find user
        user = await User.get(user_id)
        if not user:
            raise NotFoundException(detail="User not found")

        if not user.is_active:
            raise UnauthorizedException(detail="Account is inactive")

        # Generate new tokens
        new_access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role}
        )
        new_refresh_token = create_refresh_token(
            data={"sub": str(user.id), "email": user.email}
        )

        return new_access_token, new_refresh_token

    @staticmethod
    async def get_user_by_id(user_id: str) -> UserResponse:
        """
        Get user by ID.
        Raises NotFoundException if user not found.
        """
        user = await User.get(user_id)
        if not user:
            raise NotFoundException(detail="User not found")

        # Explicitly convert user.id to str for UserResponse
        user_data_for_response = user.model_dump()
        user_data_for_response["id"] = str(user.id)
        return UserResponse.model_validate(user_data_for_response)

    @staticmethod
    async def change_password(user_id: str, current_password: str, new_password: str):
        """
        Change user password.
        Raises NotFoundException if user not found.
        Raises UnauthorizedException if current password is incorrect.
        """
        user = await User.get(user_id)
        if not user:
            raise NotFoundException(detail="User not found")

        # Verify current password
        if not verify_password(current_password, user.password_hash):
            raise UnauthorizedException(detail="Current password is incorrect")

        # Validate new password
        if len(new_password) < 8:
            raise ValueError("New password must be at least 8 characters")

        # Update password
        user.password_hash = hash_password(new_password)

        # Update timestamp
        from datetime import datetime
        user.updated_at = datetime.utcnow()

        # Save changes
        await user.save()