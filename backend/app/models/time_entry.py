"""
TimeEntry model using Beanie ODM for MongoDB.
"""

from typing import Optional
from datetime import datetime
from beanie import Document
from pydantic import Field
from bson import ObjectId
import pymongo


class TimeEntry(Document):
    """Time entry model for task time tracking"""

    # Core fields
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int = 0
    
    # Description
    description: Optional[str] = None
    
    # Relationships
    task_id: str
    project_id: str
    user_id: str
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "time_entries"
        indexes = [
            [("task_id", pymongo.ASCENDING), ("user_id", pymongo.ASCENDING)],
            [("project_id", pymongo.ASCENDING), ("user_id", pymongo.ASCENDING)],
            [("user_id", pymongo.ASCENDING), ("start_time", pymongo.DESCENDING)],
        ]

    def __repr__(self) -> str:
        return f"<TimeEntry {self.duration_minutes}min by user {self.user_id}>"