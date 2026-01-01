"""
Kanban Board API endpoints
Provides REST API for Kanban view and status updates with WebSocket broadcasting
"""

from fastapi import APIRouter, Depends, HTTPException, status # Corrected import

from typing import List, Dict
from pydantic import BaseModel
from beanie import PydanticObjectId

from app.models.task import Task, TaskStatus
from app.models.user import User, UserRole
from app.core.deps import get_current_user_from_token
from app.websockets.kanban import manager


router = APIRouter(prefix="/kanban", tags=["kanban"])


class TaskStatusUpdate(BaseModel):
    """Schema for task status update"""
    new_status: TaskStatus


class KanbanTask(BaseModel):
    """Simplified task schema for Kanban board"""
    id: str
    title: str
    description: str | None
    priority: str
    status: str
    assigned_to_id: str
    due_date: str | None
    estimated_hours: float | None
    actual_hours: float | None
    parent_task_id: str | None
    subtask_count: int = 0

    class Config:
        from_attributes = True


class KanbanBoard(BaseModel):
    """Kanban board with tasks grouped by status"""
    project_id: str
    columns: Dict[str, List[KanbanTask]]


@router.get("/projects/{project_id}", response_model=KanbanBoard)
async def get_kanban_board(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get Kanban board for a project with tasks grouped by status

    Returns tasks organized into columns by TaskStatus
    """
    # Query all tasks for the project
    tasks = await Task.find(Task.project_id == project_id).sort(-Task.created_at).to_list()

    # Group tasks by status
    columns = {
        TaskStatus.TODO.value: [],
        TaskStatus.IN_PROGRESS.value: [],
        TaskStatus.REVIEW.value: [],
        TaskStatus.DONE.value: []
    }

    for task in tasks:
        # Count subtasks
        subtask_count = await Task.find(Task.parent_task_id == task.id).count()

        kanban_task = KanbanTask(
            id=str(task.id),
            title=task.title,
            description=task.description,
            priority=task.priority.value,
            status=task.status.value,
            assigned_to_id=str(task.assigned_to_id),
            due_date=task.due_date.isoformat() if task.due_date else None,
            estimated_hours=task.estimated_hours,
            actual_hours=task.actual_hours,
            parent_task_id=str(task.parent_task_id) if task.parent_task_id else None,
            subtask_count=subtask_count
        )

        if task.status.value in columns:
            columns[task.status.value].append(kanban_task)

    return KanbanBoard(
        project_id=str(project_id),
        columns=columns
    )


@router.patch("/tasks/{task_id}/status")
async def update_task_status(
    task_id: PydanticObjectId,
    status_update: TaskStatusUpdate,
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Update task status and broadcast change via WebSocket

    This endpoint is called when user drags task to different column
    Updates database and notifies all connected clients in project room
    """
    # Get task
    task = await Task.get(task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )

    # Check permissions (Admin, PM, or assigned user can update)

    if current_user.role not in [UserRole.ADMIN, UserRole.PROJECT_MANAGER]:
        # If task is assigned to someone, only that user can update it
        # If task is not assigned to anyone, only Admin/PM can update it
        if task.assigned_user_id and str(task.assigned_user_id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this task"
            )

    # Update status
    old_status = task.status
    task.status = status_update.new_status
    await task.save()

    # Broadcast update to all connections in project room
    await manager.broadcast_task_update(
        project_id=str(task.project_id),
        task_id=str(task.id),
        new_status=status_update.new_status.value,
        updated_by=str(current_user.id)
    )

    return {
        "message": "Task status updated successfully",
        "task_id": str(task.id),
        "old_status": old_status.value,
        "new_status": status_update.new_status.value,
        "updated_by": str(current_user.id)
    }