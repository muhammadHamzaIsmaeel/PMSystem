"""
TimeEntry Pydantic schemas for request/response validation.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.schemas.common import Timestamps, UUIDEntity


class TimeEntryCreate(BaseModel):
    """Schema for creating a time entry"""

    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    task_id: str

    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: datetime, info) -> datetime:
        """Validate end_time is after start_time"""
        start_time = info.data.get('start_time')
        if start_time and v <= start_time:
            raise ValueError('end_time must be after start_time')
        return v


class TimeEntryUpdate(BaseModel):
    """Schema for updating a time entry"""

    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    description: Optional[str] = None

    model_config = ConfigDict(extra="forbid")

    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate end_time is after start_time"""
        if v is None:
            return v
        start_time = info.data.get('start_time')
        if start_time and v <= start_time:
            raise ValueError('end_time must be after start_time')
        return v


class TimeEntryResponse(UUIDEntity, Timestamps):
    """Schema for time entry response"""

    start_time: datetime
    end_time: datetime
    duration_minutes: int
    description: Optional[str]
    task_id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)
