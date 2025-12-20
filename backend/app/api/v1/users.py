"""
User endpoints: profile retrieval, HRMSX sync, user management.
"""

from typing import List
from fastapi import APIRouter, Depends

from app.core.deps import get_db, get_current_user_from_token, require_role
from app.services.auth_service import AuthService
from app.schemas.user import UserResponse
from app.schemas.common import MessageResponse
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(require_role("Admin", "ProjectManager", "Finance")),
    db = Depends(get_db),
):
    """
    Get all users.

    Accessible by Admin, Project Manager, and Finance for team management and task assignment.
    Returns list of all users in the system.
    """
    users = await User.find_all().to_list()
    return [
        UserResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            hrmsx_user_id=u.hrmsx_user_id,
            is_active=u.is_active,
            created_at=u.created_at,
            updated_at=u.updated_at,
        )
        for u in users
    ]


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user_from_token),
    db = Depends(get_db),
):
    """
    Get current authenticated user profile.

    Requires authentication.
    """
    user_id = current_user.id
    return await AuthService.get_user_by_id(user_id)


@router.post("/sync-hrmsx", response_model=MessageResponse)
async def sync_hrmsx_users(
    current_user: User = Depends(require_role("Admin")),
    db = Depends(get_db),
):
    """
    Mock endpoint for syncing users from HRMSX system.

    Admin only. In production, this would call the HRMSX API.
    """
    # Mock implementation - in production, would call HRMSX API
    # and create/update users in the database

    return MessageResponse(
        message="HRMSX sync completed. This is a mock endpoint - implement actual sync logic in production."
    )
