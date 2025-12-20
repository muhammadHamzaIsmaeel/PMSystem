"""
Common Pydantic schemas shared across the application.
Includes enums, pagination, and base response schemas.
MongoDB version - uses ObjectId (as string) instead of UUID.
"""

from enum import Enum
from typing import Generic, List, TypeVar
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# Enums
class UserRole(str, Enum):
    """User roles in the system."""

    ADMIN = "Admin"
    PROJECT_MANAGER = "ProjectManager"
    TEAM_MEMBER = "TeamMember"
    FINANCE = "Finance"
    VIEWER = "Viewer"


class ProjectStatus(str, Enum):
    """Project lifecycle statuses."""

    PLANNING = "Planning"
    IN_PROGRESS = "InProgress"
    ON_HOLD = "OnHold"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class TaskStatus(str, Enum):
    """Task workflow statuses."""

    TODO = "ToDo"
    IN_PROGRESS = "InProgress"
    REVIEW = "Review"
    DONE = "Done"


class TaskPriority(str, Enum):
    """Task priority levels."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"
    CRITICAL = "Critical"


class ApprovalStatus(str, Enum):
    """Approval workflow statuses."""

    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class SyncStatus(str, Enum):
    """HRMSX synchronization statuses."""

    PENDING = "Pending"
    SYNCED = "Synced"
    FAILED = "Failed"


# Base schemas
class BaseSchema(BaseModel):
    """Base schema with common configuration."""

    model_config = ConfigDict(from_attributes=True)


class MongoIdSchema(BaseSchema):
    """Schema with MongoDB ObjectId as string."""

    id: str  # MongoDB ObjectId as string


class TimestampSchema(BaseSchema):
    """Schema with timestamp fields."""

    created_at: datetime
    updated_at: datetime


# Aliases for backward compatibility
UUIDEntity = MongoIdSchema  # For old code that uses UUIDEntity
Timestamps = TimestampSchema  # For old code that uses Timestamps


# Pagination
class PaginationParams(BaseModel):
    """Query parameters for pagination."""

    skip: int = Field(default=0, ge=0, description="Number of items to skip")
    limit: int = Field(default=20, ge=1, le=100, description="Number of items to return")


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response."""

    items: List[T]
    total: int
    skip: int
    limit: int
    has_more: bool

    @classmethod
    def create(cls, items: List[T], total: int, skip: int, limit: int):
        """Create paginated response from items and count."""
        return cls(
            items=items,
            total=total,
            skip=skip,
            limit=limit,
            has_more=(skip + limit) < total,
        )


# Response wrappers
class MessageResponse(BaseModel):
    """Simple message response."""

    message: str


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "healthy"
    version: str
