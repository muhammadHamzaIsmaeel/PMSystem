"""
Time entry endpoints for time tracking.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from beanie import PydanticObjectId
from typing import List

from app.core.deps import get_current_user_from_token
from app.models.time_entry import TimeEntry
from app.models.task import Task
from app.models.user import User
from app.schemas.time_entry import TimeEntryCreate, TimeEntryUpdate, TimeEntryResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/time-entries", tags=["Time Tracking"])


@router.get("", response_model=PaginatedResponse[TimeEntryResponse])
async def get_time_entries(
    task_id: PydanticObjectId = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user_from_token),
):
    """Get time entries with role-based filtering."""
    query = []
    if current_user.role == "TeamMember":
        query.append(TimeEntry.user_id == str(current_user.id))
    if task_id:
        query.append(TimeEntry.task_id == str(task_id))
    
    entries = await TimeEntry.find(*query).skip(skip).limit(limit).to_list()
    total = await TimeEntry.find(*query).count()

    return PaginatedResponse(
        items=[TimeEntryResponse.model_validate(e.model_dump(mode='json')) for e in entries],
        total=total,
        skip=skip,
        limit=limit,
        has_more=total > skip + len(entries),
    )


@router.post("", response_model=TimeEntryResponse, status_code=201)
async def create_time_entry(
    entry_data: TimeEntryCreate,
    current_user: User = Depends(get_current_user_from_token),
):
    """Create time entry with auto-duration calculation."""
    
    # Fetch task to get project_id
    task = await Task.get(entry_data.task_id)
    if not task:
        raise NotFoundException(detail="Task not found")
    
    # Calculate duration
    duration = int((entry_data.end_time - entry_data.start_time).total_seconds() / 60)

    # Create time entry
    entry = TimeEntry(
        start_time=entry_data.start_time,
        end_time=entry_data.end_time,
        description=entry_data.description,
        task_id=str(entry_data.task_id),
        project_id=str(task.project_id),  # Get from task
        user_id=str(current_user.id),  # Convert ObjectId to string
        duration_minutes=duration,
    )

    await entry.insert()
    return TimeEntryResponse.model_validate(entry.model_dump(mode='json'))


@router.put("/{entry_id}", response_model=TimeEntryResponse)
async def update_time_entry(
    entry_id: PydanticObjectId,
    entry_data: TimeEntryUpdate,
    current_user: User = Depends(get_current_user_from_token),
):
    """Update time entry."""
    entry = await TimeEntry.get(entry_id)

    if not entry:
        raise NotFoundException(detail="Time entry not found")

    # Authorization: Ensure team members can only update their own entries
    if current_user.role == "TeamMember" and entry.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this time entry")

    update_data = entry_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)

    # Recalculate duration if times changed
    if 'start_time' in update_data or 'end_time' in update_data:
        if entry.start_time and entry.end_time:
            entry.duration_minutes = int((entry.end_time - entry.start_time).total_seconds() / 60)

    await entry.save()
    return TimeEntryResponse.model_validate(entry.model_dump(mode='json'))


@router.delete("/{entry_id}", response_model=MessageResponse)
async def delete_time_entry(
    entry_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Delete time entry."""
    entry = await TimeEntry.get(entry_id)

    if not entry:
        raise NotFoundException(detail="Time entry not found")
        
    # Authorization: Ensure team members can only delete their own entries
    if current_user.role == "TeamMember" and entry.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this time entry")

    await entry.delete()
    return MessageResponse(message="Time entry deleted successfully")