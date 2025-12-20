"""
Task model using Beanie ODM for MongoDB.
"""

from enum import Enum
from typing import Optional
from datetime import datetime
from beanie import Document
from pydantic import Field
from bson import ObjectId
import pymongo


class TaskStatus(str, Enum):
    """Task status enum"""
    TODO = "ToDo"
    IN_PROGRESS = "InProgress"
    REVIEW = "Review"
    DONE = "Done"


class TaskPriority(str, Enum):
    """Task priority enum"""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"
    CRITICAL = "Critical"


class Task(Document):
    """Task model with subtask support"""

    # Core fields
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    
    # Assignment
    assigned_user_id: Optional[str] = None
    
    # Progress
    progress: int = Field(default=0, ge=0, le=100)
    
    # Dates
    deadline: Optional[datetime] = None
    
    # Relationships
    project_id: str
    parent_task_id: Optional[str] = None
    
    # Ownership
    created_by_id: str
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tasks"
        indexes = [
            [("project_id", pymongo.ASCENDING), ("status", pymongo.ASCENDING)],
            [("assigned_user_id", pymongo.ASCENDING), ("status", pymongo.ASCENDING)],
            [("deadline", pymongo.ASCENDING), ("status", pymongo.ASCENDING)],
            [("parent_task_id", pymongo.ASCENDING)],
            [("status", pymongo.ASCENDING)],
            [("priority", pymongo.ASCENDING)],
        ]

    def __repr__(self) -> str:
        return f"<Task {self.title} ({self.status})>"