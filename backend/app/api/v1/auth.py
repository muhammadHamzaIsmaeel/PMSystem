"""
Authentication endpoints: register, login, refresh, logout.
"""

from fastapi import APIRouter, Depends, Body, HTTPException

from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.schemas.common import MessageResponse
from app.models.user import User
from app.core.deps import get_current_user_from_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(user_data: UserCreate):
    """
    Register a new user.

    Returns access and refresh tokens upon successful registration.
    """
    return await AuthService.register(user_data)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email and password.

    Returns access and refresh tokens upon successful authentication.
    """
    return await AuthService.login(credentials)


@router.post("/refresh", response_model=dict)
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    """
    Refresh access token using a valid refresh token.

    Returns new access and refresh tokens.
    """
    new_access_token, new_refresh_token = await AuthService.refresh_token(refresh_token)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user_from_token),
):
    """
    Change user password.

    Requires authentication and current password verification.
    """
    await AuthService.change_password(str(current_user.id), current_password, new_password)
    return MessageResponse(message="Password changed successfully")


@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Logout endpoint (client-side token removal).

    The server doesn't maintain token state, so this is primarily
    for client-side cleanup. Client should remove tokens from storage.
    """
    return MessageResponse(message="Successfully logged out")