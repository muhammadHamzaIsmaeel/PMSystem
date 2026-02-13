"""
TimeEntry Pydantic schemas for request/response validation.
Comprehensive schemas for live timer, screenshots, and activity tracking.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.schemas.common import Timestamps, UUIDEntity


# ============ Enums ============
class TimerStatusEnum(str):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"


# ============ Screenshot Schemas ============
class ScreenshotBase(BaseModel):
    """Base screenshot schema"""
    activity_percent: int = 0
    blur_level: int = 0


class ScreenshotCreate(ScreenshotBase):
    """Schema for creating a screenshot"""
    pass


class ScreenshotResponse(ScreenshotBase):
    """Schema for screenshot response"""
    id: str
    captured_at: datetime
    file_path: str
    thumbnail_path: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ============ Activity Log Schemas ============
class ActivityLogCreate(BaseModel):
    """Schema for creating an activity log entry"""
    keyboard_clicks: int = 0
    mouse_clicks: int = 0
    mouse_movements: int = 0
    active_app: Optional[str] = None
    active_window: Optional[str] = None
    activity_percent: int = 0
    idle_seconds: int = 0


class ActivityLogResponse(ActivityLogCreate):
    """Schema for activity log response"""
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ============ Time Entry Create/Update Schemas ============
class TimeEntryCreate(BaseModel):
    """Schema for creating a time entry (manual entry)"""
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    task_id: Optional[str] = None
    notes: Optional[str] = None
    is_billable: bool = True
    hourly_rate: Optional[float] = None

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
    notes: Optional[str] = None
    task_id: Optional[str] = None
    project_id: Optional[str] = None
    is_billable: Optional[bool] = None
    hourly_rate: Optional[float] = None

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


# ============ Timer Control Schemas ============
class TimerStartRequest(BaseModel):
    """Schema for starting a timer"""
    task_id: Optional[str] = None
    project_id: Optional[str] = None
    description: Optional[str] = None
    is_billable: bool = True
    hourly_rate: Optional[float] = None
    screenshot_interval: int = Field(default=10, ge=1, le=60)  # 1-60 minutes
    blur_screenshots: bool = False
    track_apps: bool = True


class TimerStopRequest(BaseModel):
    """Schema for stopping a timer"""
    description: Optional[str] = None
    notes: Optional[str] = None
    task_id: Optional[str] = None  # Allow setting/changing task on stop


class TimerUpdateRequest(BaseModel):
    """Schema for updating running timer"""
    description: Optional[str] = None
    task_id: Optional[str] = None
    project_id: Optional[str] = None


# ============ Activity Update Schema ============
class ActivityUpdateRequest(BaseModel):
    """Schema for updating activity data (sent from desktop client)"""
    keyboard_clicks: int = 0
    mouse_clicks: int = 0
    mouse_movements: int = 0
    active_app: Optional[str] = None
    active_window: Optional[str] = None
    idle_seconds: int = 0


# ============ Response Schemas ============
class TimeEntryResponse(UUIDEntity, Timestamps):
    """Schema for time entry response"""
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int
    duration_seconds: int = 0
    description: Optional[str] = None
    notes: Optional[str] = None

    # Timer state
    status: str
    paused_at: Optional[datetime] = None
    total_paused_seconds: int = 0

    # Activity data
    activity_percent: int = 0
    keyboard_clicks: int = 0
    mouse_clicks: int = 0
    idle_seconds: int = 0
    active_seconds: int = 0

    # Current tracking
    current_app: Optional[str] = None
    current_window: Optional[str] = None

    # Relationships
    task_id: Optional[str] = None
    project_id: Optional[str] = None
    user_id: str

    # Billable
    is_billable: bool = True
    hourly_rate: Optional[float] = None
    billable_amount: float = 0.0

    # Meta
    is_manual: bool = False
    screenshot_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class TimeEntryDetailResponse(TimeEntryResponse):
    """Detailed response with screenshots and activity logs"""
    screenshots: List[ScreenshotResponse] = []
    activity_logs: List[ActivityLogResponse] = []
    app_usage: dict = {}

    model_config = ConfigDict(from_attributes=True)


class ActiveTimerResponse(BaseModel):
    """Response for active timer status"""
    has_active_timer: bool = False
    timer: Optional[TimeEntryResponse] = None
    elapsed_seconds: int = 0
    elapsed_formatted: str = "00:00:00"


# ============ Summary/Analytics Schemas ============
class DailySummary(BaseModel):
    """Daily time summary"""
    date: str  # YYYY-MM-DD
    total_seconds: int = 0
    total_minutes: int = 0
    formatted_time: str = "0h 0m"
    entries_count: int = 0
    avg_activity_percent: int = 0
    projects: dict = {}  # project_id: seconds
    tasks: dict = {}  # task_id: seconds


class WeeklySummary(BaseModel):
    """Weekly time summary"""
    week_start: str  # YYYY-MM-DD
    week_end: str
    total_seconds: int = 0
    total_hours: float = 0.0
    formatted_time: str = "0h 0m"
    daily_breakdown: List[DailySummary] = []
    avg_activity_percent: int = 0
    billable_amount: float = 0.0


class ProjectTimeSummary(BaseModel):
    """Time summary per project"""
    project_id: str
    project_name: Optional[str] = None
    total_seconds: int = 0
    total_hours: float = 0.0
    entries_count: int = 0
    avg_activity_percent: int = 0
    billable_amount: float = 0.0


class UserTimeSummary(BaseModel):
    """Time summary per user"""
    user_id: str
    user_name: Optional[str] = None
    total_seconds: int = 0
    total_hours: float = 0.0
    entries_count: int = 0
    avg_activity_percent: int = 0
    projects: List[ProjectTimeSummary] = []


class TimeSummaryResponse(BaseModel):
    """Overall time summary response"""
    period: str  # "today", "week", "month", "custom"
    start_date: str
    end_date: str
    total_seconds: int = 0
    total_hours: float = 0.0
    formatted_time: str = "0h 0m"
    entries_count: int = 0
    avg_activity_percent: int = 0
    billable_amount: float = 0.0
    by_project: List[ProjectTimeSummary] = []
    by_day: List[DailySummary] = []
