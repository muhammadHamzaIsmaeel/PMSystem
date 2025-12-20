"""
Task Pydantic schemas for request/response validation.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.task import TaskPriority, TaskStatus
from app.schemas.common import Timestamps, UUIDEntity


class TaskCreate(BaseModel):
    """Schema for creating a task"""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    progress: int = Field(0, ge=0, le=100)
    deadline: Optional[datetime] = None
    project_id: str
    assigned_user_id: Optional[str] = None
    parent_task_id: Optional[str] = None


class SubtaskCreate(BaseModel):
    """Schema for creating a subtask"""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    deadline: Optional[datetime] = None
    assigned_user_id: Optional[str] = None


class TaskUpdate(BaseModel):
    """Schema for updating a task"""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    deadline: Optional[datetime] = None
    assigned_user_id: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class TaskResponse(UUIDEntity, Timestamps):
    """Schema for task response"""

    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    progress: int
    deadline: Optional[datetime]
    project_id: str
    assigned_user_id: Optional[str]
    parent_task_id: Optional[str]
    created_by_id: str

    model_config = ConfigDict(from_attributes=True)
