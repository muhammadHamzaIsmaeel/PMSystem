"""
Project model using Beanie ODM for MongoDB.
"""

from enum import Enum
from typing import Optional
from datetime import datetime, date
from beanie import Document, PydanticObjectId
from pydantic import Field, field_validator
from bson import ObjectId
import pymongo


class ProjectStatus(str, Enum):
    """Project status enum"""
    PLANNING = "Planning"
    IN_PROGRESS = "InProgress"
    ON_HOLD = "OnHold"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class Project(Document):
    """Project model"""

    # Core fields
    name: str
    client_name: Optional[str] = None
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNING
    
    # Dates
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
    # Budget
    budget: Optional[float] = None
    
    # Ownership
    created_by_id: PydanticObjectId  # Reference to User._id
    manager_id: Optional[str] = None  # Reference to User._id (stored as string)
    
    # HRMSX integration
    hrmsx_project_id: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator('manager_id', mode='before')
    @classmethod
    def convert_manager_id_to_string(cls, v):
        """Convert ObjectId to string for backward compatibility with old data"""
        if v is None:
            return None
        if isinstance(v, ObjectId):
            return str(v)
        return v

    class Settings:
        name = "projects"
        indexes = [
            pymongo.IndexModel(
                [("hrmsx_project_id", pymongo.ASCENDING)],
                unique=True,
                partialFilterExpression={"hrmsx_project_id": {"$type": "string"}},
            ),
            [("name", pymongo.ASCENDING)],
            [("status", pymongo.ASCENDING)],
            [("created_by_id", pymongo.ASCENDING)],
            [("status", 1), ("created_at", -1)],
            [("created_by_id", 1), ("status", 1)],
            [("manager_id", pymongo.ASCENDING)],
        ]

    def __repr__(self) -> str:
        return f"<Project {self.name} ({self.status})>"