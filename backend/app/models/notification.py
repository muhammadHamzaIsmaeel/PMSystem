"""
Notification model using Beanie ODM for MongoDB.
"""

from enum import Enum
from datetime import datetime
from beanie import Document
from pydantic import Field
from bson import ObjectId
import pymongo


class NotificationType(str, Enum):
    """Notification type enum"""
    TASK_ASSIGNED = "TaskAssigned"
    DEADLINE_APPROACHING = "DeadlineApproaching"
    EXPENSE_STATUS_CHANGED = "ExpenseStatusChanged"


class Notification(Document):
    """Notification model for in-app notifications"""

    # Core fields
    recipient_id: str
    notification_type: NotificationType
    
    # Related entity (polymorphic)
    related_entity_type: str
    related_entity_id: str
    
    # Message
    message: str
    
    # Read status
    is_read: bool = False
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"
        indexes = [
            [("recipient_id", pymongo.ASCENDING), ("is_read", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)],
            [("recipient_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)],
        ]

    def __repr__(self) -> str:
        return f"<Notification {self.notification_type} for user {self.recipient_id}>"