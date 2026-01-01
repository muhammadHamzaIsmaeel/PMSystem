"""
User endpoints: profile retrieval, HRMSX sync, user management.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_db, get_current_user_from_token, require_role
from app.services.auth_service import AuthService
from app.schemas.user import UserResponse, UserUpdate
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


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user_from_token),
    db = Depends(get_db),
):
    """
    Update user profile.

    Users can update their own profile. Admins can update any user profile.
    """
    # Check if the user exists
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check permissions - users can only update their own profile unless they're admin
    if str(user.id) != str(current_user.id):
        if current_user.role != "Admin":
            raise HTTPException(status_code=403, detail="Not authorized to update this user")

    # Check if email is being updated and if it already exists for another user
    if user_update.email is not None:
        existing_user = await User.find_one(User.email == user_update.email)
        if existing_user and str(existing_user.id) != user_id:
            raise HTTPException(status_code=409, detail="Email already registered by another user")
        user.email = user_update.email

    # Update other fields if provided
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.hrmsx_user_id is not None:
        user.hrmsx_user_id = user_update.hrmsx_user_id
    if user_update.role is not None and current_user.role == "Admin":
        user.role = user_update.role
    if user_update.is_active is not None and current_user.role == "Admin":
        user.is_active = user_update.is_active

    # Update timestamp
    from datetime import datetime
    user.updated_at = datetime.utcnow()

    # Save changes
    await user.save()

    # Return updated user
    user_data_for_response = user.model_dump()
    user_data_for_response["id"] = str(user.id)
    return UserResponse.model_validate(user_data_for_response)


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
