"""
Task endpoints with role-based access control.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.core.deps import get_db, get_current_user_from_token, require_role
from app.services.task_service import TaskService
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, SubtaskCreate
from app.schemas.common import PaginatedResponse, MessageResponse
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=PaginatedResponse[TaskResponse])
async def get_tasks(
    project_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user_from_token),
    db = Depends(get_db),
):
    """
    Get tasks with role-based filtering.
    - Admin/PM: See all tasks
    - Team Member: See assigned tasks
    """
    tasks = await TaskService.get_tasks(
        current_user.id, current_user.role, project_id, skip, limit
    )

    total = len(tasks)
    has_more = len(tasks) == limit

    return PaginatedResponse(
        items=tasks,
        total=total,
        skip=skip,
        limit=limit,
        has_more=has_more,
    )


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(require_role("Admin", "ProjectManager")),
    db = Depends(get_db),
):
    """
    Create a new task.
    Admin and PM only.
    """
    return await TaskService.create_task(task_data, current_user.id)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user_from_token),
    db = Depends(get_db),
):
    """Get task by ID."""
    return await TaskService.get_task_by_id(task_id)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user_from_token),
    db = Depends(get_db),
):
    """
    Update a task.
    - Admin/PM: Can update all fields
    - Assigned team member: Can update status and progress
    """
    return await TaskService.update_task(
        task_id, task_data, current_user.id, current_user.role
    )


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(
    task_id: str,
    current_user: User = Depends(require_role("Admin", "ProjectManager")),
    db = Depends(get_db),
):
    """
    Delete a task.
    Admin and PM only.
    """
    await TaskService.delete_task(task_id)
    return MessageResponse(message="Task deleted successfully")


@router.post("/{task_id}/subtasks", response_model=TaskResponse, status_code=201)
async def create_subtask(
    task_id: str,
    subtask_data: SubtaskCreate,
    current_user: User = Depends(require_role("Admin", "ProjectManager")),
    db = Depends(get_db),
):
    """
    Create a subtask under a parent task.
    Admin and PM only.
    """
    return await TaskService.create_subtask(task_id, subtask_data, current_user.id)
