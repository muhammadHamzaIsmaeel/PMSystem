"""
Notification Service
Handles creation and management of in-app notifications
"""

from typing import List
from beanie import PydanticObjectId

from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationResponse


class NotificationService:
    """Service for managing notifications"""

    @staticmethod
    async def create_notification(
        recipient_id: PydanticObjectId,
        notification_type: NotificationType,
        related_entity_type: str,
        related_entity_id: PydanticObjectId,
        message: str
    ) -> NotificationResponse:
        """
        Create a new notification

        Args:
            recipient_id: User ID who will receive notification
            notification_type: Type of notification
            related_entity_type: Entity type (task, expense, etc.)
            related_entity_id: Entity ID
            message: Notification message

        Returns:
            Created notification
        """
        notification = Notification(
            recipient_id=str(recipient_id),  # Convert ObjectId to string
            notification_type=notification_type,
            related_entity_type=related_entity_type,
            related_entity_id=str(related_entity_id),  # Convert ObjectId to string
            message=message,
            is_read=False
        )

        await notification.insert()

        return NotificationResponse(
            id=str(notification.id),  # Convert ObjectId to string
            recipient_id=notification.recipient_id,
            notification_type=notification.notification_type,
            related_entity_type=notification.related_entity_type,
            related_entity_id=notification.related_entity_id,
            message=notification.message,
            is_read=notification.is_read,
            created_at=notification.created_at
        )

    @staticmethod
    async def get_user_notifications(
        user_id: PydanticObjectId,
        skip: int = 0,
        limit: int = 50
    ) -> List[NotificationResponse]:
        """
        Get notifications for a user

        Args:
            user_id: User ID
            skip: Number to skip
            limit: Max number to return

        Returns:
            List of notifications
        """
        notifications = await Notification.find(Notification.recipient_id == user_id).sort(
            -Notification.created_at
        ).skip(skip).limit(limit).to_list()

        return [
            NotificationResponse(
                id=str(n.id),  # Convert ObjectId to string
                recipient_id=n.recipient_id,
                notification_type=n.notification_type,
                related_entity_type=n.related_entity_type,
                related_entity_id=n.related_entity_id,
                message=n.message,
                is_read=n.is_read,
                created_at=n.created_at
            )
            for n in notifications
        ]

    @staticmethod
    async def get_unread_count(user_id: PydanticObjectId) -> int:
        """
        Get count of unread notifications for a user

        Args:
            user_id: User ID

        Returns:
            Count of unread notifications
        """
        count = await Notification.find(
            Notification.recipient_id == user_id,
            Notification.is_read == False
        ).count()

        return count

    @staticmethod
    async def mark_as_read(
        notification_id: PydanticObjectId,
        user_id: PydanticObjectId
    ) -> bool:
        """
        Mark a specific notification as read

        Args:
            notification_id: Notification ID
            user_id: User ID (for security check)

        Returns:
            True if successful, False if not found
        """
        notification = await Notification.find_one(
            Notification.id == notification_id,
            Notification.recipient_id == user_id
        )

        if not notification:
            return False

        notification.is_read = True
        await notification.save()

        return True

    @staticmethod
    async def mark_all_as_read(user_id: PydanticObjectId) -> int:
        """
        Mark all notifications as read for a user

        Args:
            user_id: User ID

        Returns:
            Number of notifications marked as read
        """
        result = await Notification.update_many(
            {"recipient_id": user_id, "is_read": False},
            {"$set": {"is_read": True}}
        )

        return result.modified_count