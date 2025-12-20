"""
Notifications API endpoints
Provides notification management for in-app notification system
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query

from typing import List
from pydantic import BaseModel
from beanie import PydanticObjectId


from app.models.user import User
from app.services.notification_service import NotificationService
from app.schemas.notification import (
    NotificationResponse,
    NotificationList,
    UnreadCount
)
from app.core.deps import get_current_user_from_token


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationList)
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get user's notifications sorted by created_at desc

    Returns paginated list of notifications
    """
    notifications = await NotificationService.get_user_notifications(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )

    unread_count = await NotificationService.get_unread_count(
        user_id=current_user.id
    )

    return NotificationList(
        notifications=notifications,
        total=len(notifications),
        unread_count=unread_count
    )


@router.get("/unread-count", response_model=UnreadCount)
async def get_unread_count(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get count of unread notifications for current user

    Returns unread notification count
    """
    count = await NotificationService.get_unread_count(
        user_id=current_user.id
    )

    return UnreadCount(count=count)


@router.patch("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Mark a specific notification as read

    Only the notification recipient can mark it as read
    """
    success = await NotificationService.mark_as_read(
        notification_id=notification_id,
        user_id=current_user.id
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification {notification_id} not found"
        )

    return {"message": "Notification marked as read", "notification_id": str(notification_id)}


@router.patch("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Mark all notifications as read for current user

    Returns count of notifications marked as read
    """
    count = await NotificationService.mark_all_as_read(
        user_id=current_user.id
    )

    return {
        "message": f"{count} notifications marked as read",
        "count": count
    }