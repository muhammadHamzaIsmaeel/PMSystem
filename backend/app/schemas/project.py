"""
Project Pydantic schemas for request/response validation.
"""

from typing import Optional
from datetime import date, datetime
from beanie import PydanticObjectId
from pydantic import BaseModel, Field, ConfigDict
from app.models.project import ProjectStatus
from app.schemas.common import Timestamps, UUIDEntity


class ProjectCreate(BaseModel):
    """Schema for creating a project"""

    name: str = Field(..., min_length=1, max_length=255)
    client_name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    budget: Optional[float] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: ProjectStatus = ProjectStatus.PLANNING
    manager_id: Optional[str] = None  # Optional - will be auto-set for PMs (stored as string)


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    client_name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    budget: Optional[float] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[ProjectStatus] = None
    manager_id: Optional[str] = None  # Stored as string

    model_config = ConfigDict(extra="forbid")


class ProjectResponse(BaseModel):
    """Schema for project response"""

    id: str
    name: str
    client_name: str
    description: Optional[str]
    budget: Optional[float]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    status: ProjectStatus
    manager_id: Optional[str]
    created_by_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )


class ProjectList(BaseModel):
    """Schema for project list item (lighter version)"""

    id: str
    name: str
    client_name: str
    status: ProjectStatus
    budget: Optional[float]
    manager_id: Optional[str]
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )
