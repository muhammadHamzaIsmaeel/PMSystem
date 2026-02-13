"""
Time entry endpoints for comprehensive time tracking.
Includes live timer, screenshots, activity monitoring, and analytics.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File
from beanie import PydanticObjectId
from typing import Optional
from datetime import datetime
import os
import uuid

from app.core.deps import get_current_user_from_token
from app.core.config import settings
from app.models.time_entry import TimeEntry, TimerStatus
from app.models.task import Task
from app.models.user import User
from app.schemas.time_entry import (
    TimeEntryCreate,
    TimeEntryUpdate,
    TimeEntryResponse,
    TimeEntryDetailResponse,
    TimerStartRequest,
    TimerStopRequest,
    TimerUpdateRequest,
    ActivityUpdateRequest,
    ActiveTimerResponse,
    TimeSummaryResponse,
    ScreenshotResponse,
)
from app.schemas.common import PaginatedResponse, MessageResponse
from app.core.exceptions import NotFoundException
from app.services.time_tracking_service import TimeTrackingService

router = APIRouter(prefix="/time-entries", tags=["Time Tracking"])


# ============ Active Timer Endpoints ============

@router.get("/active", response_model=ActiveTimerResponse)
async def get_active_timer(
    current_user: User = Depends(get_current_user_from_token),
):
    """Get the currently active timer for the logged-in user."""
    entry = await TimeTrackingService.get_active_timer(str(current_user.id))
    return TimeTrackingService.to_active_response(entry)


@router.post("/start", response_model=TimeEntryResponse, status_code=201)
async def start_timer(
    data: TimerStartRequest,
    current_user: User = Depends(get_current_user_from_token),
):
    """Start a new timer. Only one timer can be active at a time."""
    entry = await TimeTrackingService.start_timer(str(current_user.id), data)
    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


@router.post("/{entry_id}/pause", response_model=TimeEntryResponse)
async def pause_timer(
    entry_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Pause a running timer."""
    entry = await TimeTrackingService.pause_timer(str(entry_id), str(current_user.id))
    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


@router.post("/{entry_id}/resume", response_model=TimeEntryResponse)
async def resume_timer(
    entry_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Resume a paused timer."""
    entry = await TimeTrackingService.resume_timer(str(entry_id), str(current_user.id))
    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


@router.post("/{entry_id}/stop", response_model=TimeEntryResponse)
async def stop_timer(
    entry_id: PydanticObjectId,
    data: Optional[TimerStopRequest] = None,
    current_user: User = Depends(get_current_user_from_token),
):
    """Stop a timer and save the entry."""
    entry = await TimeTrackingService.stop_timer(str(entry_id), str(current_user.id), data)
    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


@router.delete("/{entry_id}/discard", response_model=MessageResponse)
async def discard_timer(
    entry_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Discard a running/paused timer without saving."""
    await TimeTrackingService.discard_timer(str(entry_id), str(current_user.id))
    return MessageResponse(message="Timer discarded successfully")


@router.patch("/{entry_id}/update-timer", response_model=TimeEntryResponse)
async def update_running_timer(
    entry_id: PydanticObjectId,
    data: TimerUpdateRequest,
    current_user: User = Depends(get_current_user_from_token),
):
    """Update description/task/project of a running timer."""
    entry = await TimeEntry.get(entry_id)
    if not entry:
        raise NotFoundException(detail="Time entry not found")

    if entry.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    if entry.status == TimerStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Cannot update a completed timer")

    if data.description is not None:
        entry.description = data.description
    if data.task_id is not None:
        entry.task_id = data.task_id
        # Update project from task
        task = await Task.get(data.task_id)
        if task:
            entry.project_id = str(task.project_id)
    if data.project_id is not None:
        entry.project_id = data.project_id

    entry.updated_at = datetime.utcnow()
    await entry.save()

    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


# ============ Activity & Screenshot Endpoints ============

@router.post("/{entry_id}/activity", response_model=TimeEntryResponse)
async def update_activity(
    entry_id: PydanticObjectId,
    data: ActivityUpdateRequest,
    current_user: User = Depends(get_current_user_from_token),
):
    """Update activity data for a running timer (from desktop client)."""
    entry = await TimeTrackingService.update_activity(
        str(entry_id), str(current_user.id), data
    )
    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


@router.post("/{entry_id}/screenshot", response_model=TimeEntryResponse)
async def upload_screenshot(
    entry_id: PydanticObjectId,
    file: UploadFile = File(...),
    activity_percent: int = Query(default=0, ge=0, le=100),
    current_user: User = Depends(get_current_user_from_token),
):
    """Upload a screenshot for a time entry."""
    entry = await TimeEntry.get(entry_id)
    if not entry:
        raise NotFoundException(detail="Time entry not found")

    if entry.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create screenshots directory
    screenshots_dir = os.path.join(settings.UPLOAD_DIR, "screenshots", str(current_user.id))
    os.makedirs(screenshots_dir, exist_ok=True)

    # Save file
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".png"
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(screenshots_dir, file_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Add screenshot to entry
    entry = await TimeTrackingService.add_screenshot(
        str(entry_id),
        str(current_user.id),
        file_path,
        activity_percent=activity_percent
    )

    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


@router.get("/{entry_id}/screenshots", response_model=list[ScreenshotResponse])
async def get_screenshots(
    entry_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Get all screenshots for a time entry."""
    entry = await TimeEntry.get(entry_id)
    if not entry:
        raise NotFoundException(detail="Time entry not found")

    # Authorization
    if current_user.role == "TeamMember" and entry.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    return [ScreenshotResponse.model_validate(s.model_dump()) for s in entry.screenshots]


# ============ Summary & Analytics Endpoints ============

@router.get("/summary", response_model=TimeSummaryResponse)
async def get_time_summary(
    period: str = Query(default="today", regex="^(today|yesterday|week|month|custom)$"),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    project_id: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user_from_token),
):
    """Get time tracking summary for a period."""
    return await TimeTrackingService.get_time_summary(
        str(current_user.id),
        period=period,
        start_date=start_date,
        end_date=end_date,
        project_id=project_id,
    )


@router.get("/team-summary")
async def get_team_summary(
    project_id: Optional[str] = Query(default=None),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user_from_token),
):
    """Get time summary for team members (managers/admins only)."""
    if current_user.role not in ["Admin", "ProjectManager"]:
        raise HTTPException(status_code=403, detail="Only managers can view team summary")

    return await TimeTrackingService.get_team_summary(
        str(current_user.id),
        project_id=project_id,
        start_date=start_date,
        end_date=end_date,
    )


# ============ CRUD Endpoints (Manual Entries) ============

@router.get("", response_model=PaginatedResponse[TimeEntryResponse])
async def get_time_entries(
    task_id: Optional[PydanticObjectId] = Query(None),
    project_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user_from_token),
):
    """Get time entries with filters and role-based access."""
    query = []

    # Role-based filtering
    if current_user.role == "TeamMember":
        query.append(TimeEntry.user_id == str(current_user.id))

    # Filters
    if task_id:
        query.append(TimeEntry.task_id == str(task_id))
    if project_id:
        query.append(TimeEntry.project_id == project_id)
    if status:
        try:
            status_enum = TimerStatus(status.lower())
            query.append(TimeEntry.status == status_enum)
        except ValueError:
            # Invalid status value, ignore the filter
            pass
    if start_date:
        query.append(TimeEntry.start_time >= datetime.fromisoformat(start_date))
    if end_date:
        query.append(TimeEntry.start_time <= datetime.fromisoformat(end_date))

    # Execute query
    entries = await TimeEntry.find(*query).sort(-TimeEntry.start_time).skip(skip).limit(limit).to_list()
    total = await TimeEntry.find(*query).count()

    return PaginatedResponse(
        items=[TimeEntryResponse.model_validate(TimeTrackingService.to_response(e)) for e in entries],
        total=total,
        skip=skip,
        limit=limit,
        has_more=total > skip + len(entries),
    )


@router.get("/{entry_id}", response_model=TimeEntryDetailResponse)
async def get_time_entry(
    entry_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Get a single time entry with full details including screenshots."""
    entry = await TimeEntry.get(entry_id)
    if not entry:
        raise NotFoundException(detail="Time entry not found")

    # Authorization
    if current_user.role == "TeamMember" and entry.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    response_data = TimeTrackingService.to_response(entry)
    response_data['screenshots'] = [s.model_dump() for s in entry.screenshots]
    response_data['activity_logs'] = [l.model_dump(mode='json') for l in entry.activity_logs]
    response_data['app_usage'] = entry.app_usage

    return TimeEntryDetailResponse.model_validate(response_data)


@router.post("", response_model=TimeEntryResponse, status_code=201)
async def create_time_entry(
    entry_data: TimeEntryCreate,
    current_user: User = Depends(get_current_user_from_token),
):
    """Create a manual time entry (not using live timer)."""
    # Get project_id from task if provided
    project_id = None
    if entry_data.task_id:
        task = await Task.get(entry_data.task_id)
        if not task:
            raise NotFoundException(detail="Task not found")
        project_id = str(task.project_id)

    # Calculate duration
    duration_seconds = int((entry_data.end_time - entry_data.start_time).total_seconds())

    # Create time entry
    entry = TimeEntry(
        start_time=entry_data.start_time,
        end_time=entry_data.end_time,
        duration_seconds=duration_seconds,
        duration_minutes=duration_seconds // 60,
        description=entry_data.description,
        notes=entry_data.notes,
        task_id=entry_data.task_id,
        project_id=project_id,
        user_id=str(current_user.id),
        status=TimerStatus.COMPLETED,
        is_manual=True,
        is_billable=entry_data.is_billable,
        hourly_rate=entry_data.hourly_rate,
    )

    await entry.insert()
    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


@router.put("/{entry_id}", response_model=TimeEntryResponse)
async def update_time_entry(
    entry_id: PydanticObjectId,
    entry_data: TimeEntryUpdate,
    current_user: User = Depends(get_current_user_from_token),
):
    """Update a time entry."""
    entry = await TimeEntry.get(entry_id)
    if not entry:
        raise NotFoundException(detail="Time entry not found")

    # Authorization
    if current_user.role == "TeamMember" and entry.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this entry")

    # Update fields
    update_data = entry_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)

    # Recalculate duration if times changed
    if 'start_time' in update_data or 'end_time' in update_data:
        if entry.start_time and entry.end_time:
            entry.duration_seconds = int((entry.end_time - entry.start_time).total_seconds())
            entry.duration_minutes = entry.duration_seconds // 60

    entry.updated_at = datetime.utcnow()
    await entry.save()

    return TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry))


@router.delete("/{entry_id}", response_model=MessageResponse)
async def delete_time_entry(
    entry_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Delete a time entry."""
    entry = await TimeEntry.get(entry_id)
    if not entry:
        raise NotFoundException(detail="Time entry not found")

    # Authorization
    if current_user.role == "TeamMember" and entry.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this entry")

    # Delete associated screenshot files
    for screenshot in entry.screenshots:
        if os.path.exists(screenshot.file_path):
            try:
                os.remove(screenshot.file_path)
            except Exception:
                pass  # Ignore file deletion errors

    await entry.delete()
    return MessageResponse(message="Time entry deleted successfully")
