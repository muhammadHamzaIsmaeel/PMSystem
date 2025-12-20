"""
Dependency injection functions for FastAPI routes.
Provides database sessions, current user, and role-based access control.
MongoDB/Beanie version.
"""

from typing import Optional
from fastapi import Depends, Header
from beanie import PydanticObjectId

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.models.user import User


async def get_db():
    """
    Database dependency for MongoDB/Beanie.

    Note: With Beanie, we don't actually need a session like SQLAlchemy.
    This function is kept for API compatibility but returns None.
    Beanie Document models handle their own database operations.
    """
    yield None


async def get_current_user_from_token(
    authorization: str = Header(...),
) -> User:
    """
    Get current user from JWT token in Authorization header.

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User object

    Raises:
        UnauthorizedException: If token is invalid or user not found
    """
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException(detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)

    if payload is None:
        raise UnauthorizedException(detail="Invalid or expired token")

    if payload.get("type") != "access":
        raise UnauthorizedException(detail="Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException(detail="Invalid token payload")

    # Fetch user from MongoDB using Beanie
    try:
        user = await User.get(PydanticObjectId(user_id))
    except Exception:
        user = None

    if not user or not user.is_active:
        raise UnauthorizedException(detail="User not found or inactive")

    return user


def require_role(*allowed_roles: str):
    """
    Dependency factory that creates a role checker.

    Usage:
        @app.get("/admin")
        async def admin_route(
            user: User = Depends(require_role("Admin"))
        ):
            ...

    Args:
        *allowed_roles: Variable number of role names that are allowed

    Returns:
        Dependency function that checks user role
    """

    async def role_checker(
        current_user: User = Depends(get_current_user_from_token),
    ) -> User:
        """Check if current user has required role."""
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role

        if user_role not in allowed_roles:
            raise ForbiddenException(
                detail=f"Access forbidden. Required roles: {', '.join(allowed_roles)}"
            )

        return current_user

    return role_checker


# Convenience dependencies for common role checks
require_admin = require_role("Admin")
require_pm = require_role("Admin", "ProjectManager")
require_team_member = require_role("Admin", "ProjectManager", "TeamMember")
require_finance = require_role("Admin", "Finance")
