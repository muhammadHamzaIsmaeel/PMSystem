"""
Pydantic schemas for notifications
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import List


class NotificationResponse(BaseModel):
    """Notification response schema"""
    id: str
    recipient_id: str
    notification_type: str
    related_entity_type: str
    related_entity_id: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationList(BaseModel):
    """List of notifications"""
    notifications: List[NotificationResponse]
    total: int
    unread_count: int


class UnreadCount(BaseModel):
    """Unread notification count"""
    count: int


class MarkAsRead(BaseModel):
    """Mark notification as read"""
    is_read: bool = True
