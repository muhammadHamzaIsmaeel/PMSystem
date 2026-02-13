"""
TimeEntry model using Beanie ODM for MongoDB.
Comprehensive time tracking with live timer, screenshots, and activity monitoring.
"""

from typing import Optional, List
from datetime import datetime
from enum import Enum
from beanie import Document
from pydantic import Field, BaseModel
import pymongo


class TimerStatus(str, Enum):
    """Timer status enum"""
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"


class Screenshot(BaseModel):
    """Embedded document for screenshot data"""
    id: str
    captured_at: datetime
    file_path: str
    thumbnail_path: Optional[str] = None
    activity_percent: int = 0  # Activity level when screenshot was taken
    blur_level: int = 0  # 0 = clear, 100 = fully blurred (privacy)


class ActivityLog(BaseModel):
    """Embedded document for activity data per interval"""
    timestamp: datetime
    keyboard_clicks: int = 0
    mouse_clicks: int = 0
    mouse_movements: int = 0
    active_app: Optional[str] = None
    active_window: Optional[str] = None
    activity_percent: int = 0  # Calculated activity for this interval
    idle_seconds: int = 0


class TimeEntry(Document):
    """Time entry model for comprehensive task time tracking"""

    # Core timer fields
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int = 0
    duration_seconds: int = 0  # More precise duration

    # Timer state
    status: TimerStatus = TimerStatus.IDLE
    paused_at: Optional[datetime] = None
    total_paused_seconds: int = 0

    # Description & notes
    description: Optional[str] = None
    notes: Optional[str] = None

    # Activity tracking
    activity_percent: int = 0  # Overall activity percentage (0-100)
    keyboard_clicks: int = 0
    mouse_clicks: int = 0
    mouse_movements: int = 0
    idle_seconds: int = 0
    active_seconds: int = 0

    # Current app tracking
    current_app: Optional[str] = None
    current_window: Optional[str] = None

    # Screenshots & activity logs (embedded documents)
    screenshots: List[Screenshot] = Field(default_factory=list)
    activity_logs: List[ActivityLog] = Field(default_factory=list)

    # App usage summary (aggregated)
    app_usage: dict = Field(default_factory=dict)  # {"app_name": seconds}

    # Settings for this entry
    screenshot_interval: int = 10  # Minutes between screenshots
    blur_screenshots: bool = False
    track_apps: bool = True

    # Billable tracking
    is_billable: bool = True
    hourly_rate: Optional[float] = None

    # Relationships
    task_id: Optional[str] = None  # Now optional for quick timer
    project_id: Optional[str] = None
    user_id: str

    # Manual vs auto entry
    is_manual: bool = False  # True if manually entered (not tracked with timer)

    # Sync status for external systems
    sync_status: str = "pending"  # pending, synced, failed

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "time_entries"
        indexes = [
            [("task_id", pymongo.ASCENDING), ("user_id", pymongo.ASCENDING)],
            [("project_id", pymongo.ASCENDING), ("user_id", pymongo.ASCENDING)],
            [("user_id", pymongo.ASCENDING), ("start_time", pymongo.DESCENDING)],
            [("user_id", pymongo.ASCENDING), ("status", pymongo.ASCENDING)],  # For active timer lookup
            [("status", pymongo.ASCENDING)],
            [("created_at", pymongo.DESCENDING)],
        ]

    def __repr__(self) -> str:
        return f"<TimeEntry {self.status.value} {self.duration_minutes}min by user {self.user_id}>"

    def calculate_duration(self) -> None:
        """Calculate duration from start_time to end_time or now"""
        if self.start_time:
            end = self.end_time or datetime.utcnow()
            total_seconds = int((end - self.start_time).total_seconds())
            # Subtract paused time
            total_seconds -= self.total_paused_seconds
            self.duration_seconds = max(0, total_seconds)
            self.duration_minutes = self.duration_seconds // 60

    def calculate_activity_percent(self) -> None:
        """Calculate overall activity percentage from logs"""
        if not self.activity_logs:
            return
        total_activity = sum(log.activity_percent for log in self.activity_logs)
        self.activity_percent = total_activity // len(self.activity_logs)

    @property
    def billable_amount(self) -> float:
        """Calculate billable amount based on duration and hourly rate"""
        if not self.is_billable or not self.hourly_rate:
            return 0.0
        hours = self.duration_minutes / 60
        return round(hours * self.hourly_rate, 2)