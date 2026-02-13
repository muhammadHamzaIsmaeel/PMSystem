"""
Time Tracking Service - Business logic for comprehensive time tracking.
Handles live timer, screenshots, activity monitoring, and analytics.
"""

from typing import Optional, List
from datetime import datetime, timedelta
from uuid import uuid4

from app.models.time_entry import TimeEntry, TimerStatus, Screenshot, ActivityLog
from beanie.odm.operators.find.comparison import In
from app.models.task import Task
from app.models.project import Project
from app.models.user import User
from app.schemas.time_entry import (
    TimerStartRequest,
    TimerStopRequest,
    ActivityUpdateRequest,
    TimeEntryResponse,
    ActiveTimerResponse,
    TimeSummaryResponse,
    DailySummary,
    ProjectTimeSummary,
)
from app.core.exceptions import NotFoundException, BadRequestException


class TimeTrackingService:
    """Service for managing time tracking operations"""

    @staticmethod
    def format_duration(seconds: int) -> str:
        """Format seconds to HH:MM:SS"""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"

    @staticmethod
    def format_duration_readable(seconds: int) -> str:
        """Format seconds to readable format like '2h 30m'"""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"

    @staticmethod
    async def get_active_timer(user_id: str) -> Optional[TimeEntry]:
        """Get the currently running timer for a user"""
        return await TimeEntry.find_one(
            TimeEntry.user_id == user_id,
            In(TimeEntry.status, [TimerStatus.RUNNING, TimerStatus.PAUSED])
        )

    @staticmethod
    async def start_timer(user_id: str, data: TimerStartRequest) -> TimeEntry:
        """Start a new timer for the user"""
        # Check if user already has an active timer
        active = await TimeTrackingService.get_active_timer(user_id)
        if active:
            raise BadRequestException(
                detail="You already have an active timer. Stop it first before starting a new one."
            )

        # Get project_id from task if task is provided
        project_id = data.project_id
        if data.task_id and not project_id:
            task = await Task.get(data.task_id)
            if task:
                project_id = str(task.project_id)

        # Create new timer entry
        entry = TimeEntry(
            start_time=datetime.utcnow(),
            status=TimerStatus.RUNNING,
            description=data.description,
            task_id=data.task_id,
            project_id=project_id,
            user_id=user_id,
            is_billable=data.is_billable,
            hourly_rate=data.hourly_rate,
            screenshot_interval=data.screenshot_interval,
            blur_screenshots=data.blur_screenshots,
            track_apps=data.track_apps,
            is_manual=False,
        )

        await entry.insert()
        return entry

    @staticmethod
    async def pause_timer(entry_id: str, user_id: str) -> TimeEntry:
        """Pause a running timer"""
        entry = await TimeEntry.get(entry_id)
        if not entry:
            raise NotFoundException(detail="Time entry not found")

        if entry.user_id != user_id:
            raise BadRequestException(detail="You can only pause your own timer")

        if entry.status != TimerStatus.RUNNING:
            raise BadRequestException(detail="Timer is not running")

        entry.status = TimerStatus.PAUSED
        entry.paused_at = datetime.utcnow()
        entry.updated_at = datetime.utcnow()

        # Calculate current duration
        entry.calculate_duration()

        await entry.save()
        return entry

    @staticmethod
    async def resume_timer(entry_id: str, user_id: str) -> TimeEntry:
        """Resume a paused timer"""
        entry = await TimeEntry.get(entry_id)
        if not entry:
            raise NotFoundException(detail="Time entry not found")

        if entry.user_id != user_id:
            raise BadRequestException(detail="You can only resume your own timer")

        if entry.status != TimerStatus.PAUSED:
            raise BadRequestException(detail="Timer is not paused")

        # Calculate paused duration and add to total
        if entry.paused_at:
            paused_duration = int((datetime.utcnow() - entry.paused_at).total_seconds())
            entry.total_paused_seconds += paused_duration

        entry.status = TimerStatus.RUNNING
        entry.paused_at = None
        entry.updated_at = datetime.utcnow()

        await entry.save()
        return entry

    @staticmethod
    async def stop_timer(entry_id: str, user_id: str, data: Optional[TimerStopRequest] = None) -> TimeEntry:
        """Stop a timer and complete the entry"""
        entry = await TimeEntry.get(entry_id)
        if not entry:
            raise NotFoundException(detail="Time entry not found")

        if entry.user_id != user_id:
            raise BadRequestException(detail="You can only stop your own timer")

        if entry.status == TimerStatus.COMPLETED:
            raise BadRequestException(detail="Timer is already stopped")

        # If paused, add remaining paused time
        if entry.status == TimerStatus.PAUSED and entry.paused_at:
            paused_duration = int((datetime.utcnow() - entry.paused_at).total_seconds())
            entry.total_paused_seconds += paused_duration

        # Set end time and status
        entry.end_time = datetime.utcnow()
        entry.status = TimerStatus.COMPLETED
        entry.paused_at = None
        entry.updated_at = datetime.utcnow()

        # Apply stop request data
        if data:
            if data.description:
                entry.description = data.description
            if data.notes:
                entry.notes = data.notes
            if data.task_id:
                entry.task_id = data.task_id
                # Update project_id from new task
                task = await Task.get(data.task_id)
                if task:
                    entry.project_id = str(task.project_id)

        # Calculate final duration
        entry.calculate_duration()
        entry.calculate_activity_percent()

        # Calculate active seconds
        entry.active_seconds = entry.duration_seconds - entry.idle_seconds

        await entry.save()
        return entry

    @staticmethod
    async def discard_timer(entry_id: str, user_id: str) -> bool:
        """Discard a running/paused timer without saving"""
        entry = await TimeEntry.get(entry_id)
        if not entry:
            raise NotFoundException(detail="Time entry not found")

        if entry.user_id != user_id:
            raise BadRequestException(detail="You can only discard your own timer")

        if entry.status == TimerStatus.COMPLETED:
            raise BadRequestException(detail="Cannot discard a completed entry. Use delete instead.")

        await entry.delete()
        return True

    @staticmethod
    async def update_activity(
        entry_id: str,
        user_id: str,
        data: ActivityUpdateRequest
    ) -> TimeEntry:
        """Update activity data for a running timer (called by desktop client)"""
        entry = await TimeEntry.get(entry_id)
        if not entry:
            raise NotFoundException(detail="Time entry not found")

        if entry.user_id != user_id:
            raise BadRequestException(detail="You can only update your own timer")

        if entry.status != TimerStatus.RUNNING:
            raise BadRequestException(detail="Can only update activity for running timer")

        # Calculate activity percentage for this update
        # Simple formula: based on keyboard/mouse activity
        total_events = data.keyboard_clicks + data.mouse_clicks + data.mouse_movements
        # Assume 100 events per minute is 100% activity
        activity_percent = min(100, int(total_events / 1.67))  # ~100 events = 100%

        # Create activity log entry
        log = ActivityLog(
            timestamp=datetime.utcnow(),
            keyboard_clicks=data.keyboard_clicks,
            mouse_clicks=data.mouse_clicks,
            mouse_movements=data.mouse_movements,
            active_app=data.active_app,
            active_window=data.active_window,
            activity_percent=activity_percent,
            idle_seconds=data.idle_seconds,
        )
        entry.activity_logs.append(log)

        # Update cumulative stats
        entry.keyboard_clicks += data.keyboard_clicks
        entry.mouse_clicks += data.mouse_clicks
        entry.mouse_movements += data.mouse_movements
        entry.idle_seconds += data.idle_seconds

        # Update current app
        entry.current_app = data.active_app
        entry.current_window = data.active_window

        # Update app usage
        if data.active_app:
            current_usage = entry.app_usage.get(data.active_app, 0)
            entry.app_usage[data.active_app] = current_usage + 60  # Assume 1 minute per update

        # Recalculate overall activity
        entry.calculate_activity_percent()
        entry.updated_at = datetime.utcnow()

        await entry.save()
        return entry

    @staticmethod
    async def add_screenshot(
        entry_id: str,
        user_id: str,
        file_path: str,
        thumbnail_path: Optional[str] = None,
        activity_percent: int = 0
    ) -> TimeEntry:
        """Add a screenshot to a time entry"""
        entry = await TimeEntry.get(entry_id)
        if not entry:
            raise NotFoundException(detail="Time entry not found")

        if entry.user_id != user_id:
            raise BadRequestException(detail="You can only add screenshots to your own timer")

        screenshot = Screenshot(
            id=str(uuid4()),
            captured_at=datetime.utcnow(),
            file_path=file_path,
            thumbnail_path=thumbnail_path,
            activity_percent=activity_percent,
            blur_level=100 if entry.blur_screenshots else 0,
        )
        entry.screenshots.append(screenshot)
        entry.updated_at = datetime.utcnow()

        await entry.save()
        return entry

    @staticmethod
    async def get_time_summary(
        user_id: str,
        period: str = "today",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        project_id: Optional[str] = None,
    ) -> TimeSummaryResponse:
        """Get time tracking summary for a period"""
        now = datetime.utcnow()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Determine date range
        if period == "today":
            start = today
            end = now
        elif period == "yesterday":
            start = today - timedelta(days=1)
            end = today
        elif period == "week":
            start = today - timedelta(days=today.weekday())  # Monday
            end = now
        elif period == "month":
            start = today.replace(day=1)
            end = now
        elif period == "custom" and start_date and end_date:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
        else:
            start = today
            end = now

        # Build query
        query = [
            TimeEntry.user_id == user_id,
            TimeEntry.status == TimerStatus.COMPLETED,
            TimeEntry.start_time >= start,
            TimeEntry.start_time <= end,
        ]
        if project_id:
            query.append(TimeEntry.project_id == project_id)

        entries = await TimeEntry.find(*query).to_list()

        # Aggregate data
        total_seconds = sum(e.duration_seconds for e in entries)
        total_activity = sum(e.activity_percent for e in entries)
        avg_activity = total_activity // len(entries) if entries else 0
        billable_amount = sum(e.billable_amount for e in entries)

        # Group by project
        projects_data: dict = {}
        for entry in entries:
            pid = entry.project_id or "no_project"
            if pid not in projects_data:
                projects_data[pid] = {
                    "total_seconds": 0,
                    "entries_count": 0,
                    "activity_sum": 0,
                    "billable": 0.0,
                }
            projects_data[pid]["total_seconds"] += entry.duration_seconds
            projects_data[pid]["entries_count"] += 1
            projects_data[pid]["activity_sum"] += entry.activity_percent
            projects_data[pid]["billable"] += entry.billable_amount

        by_project = [
            ProjectTimeSummary(
                project_id=pid,
                total_seconds=data["total_seconds"],
                total_hours=round(data["total_seconds"] / 3600, 2),
                entries_count=data["entries_count"],
                avg_activity_percent=data["activity_sum"] // data["entries_count"] if data["entries_count"] else 0,
                billable_amount=data["billable"],
            )
            for pid, data in projects_data.items()
        ]

        # Group by day
        days_data: dict = {}
        for entry in entries:
            day_key = entry.start_time.strftime("%Y-%m-%d")
            if day_key not in days_data:
                days_data[day_key] = {
                    "total_seconds": 0,
                    "entries_count": 0,
                    "activity_sum": 0,
                }
            days_data[day_key]["total_seconds"] += entry.duration_seconds
            days_data[day_key]["entries_count"] += 1
            days_data[day_key]["activity_sum"] += entry.activity_percent

        by_day = [
            DailySummary(
                date=day,
                total_seconds=data["total_seconds"],
                total_minutes=data["total_seconds"] // 60,
                formatted_time=TimeTrackingService.format_duration_readable(data["total_seconds"]),
                entries_count=data["entries_count"],
                avg_activity_percent=data["activity_sum"] // data["entries_count"] if data["entries_count"] else 0,
            )
            for day, data in sorted(days_data.items())
        ]

        return TimeSummaryResponse(
            period=period,
            start_date=start.strftime("%Y-%m-%d"),
            end_date=end.strftime("%Y-%m-%d"),
            total_seconds=total_seconds,
            total_hours=round(total_seconds / 3600, 2),
            formatted_time=TimeTrackingService.format_duration_readable(total_seconds),
            entries_count=len(entries),
            avg_activity_percent=avg_activity,
            billable_amount=billable_amount,
            by_project=by_project,
            by_day=by_day,
        )

    @staticmethod
    async def get_team_summary(
        manager_user_id: str,
        project_id: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[dict]:
        """Get time summary for team members (for managers)"""
        now = datetime.utcnow()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)

        start = datetime.fromisoformat(start_date) if start_date else today - timedelta(days=7)
        end = datetime.fromisoformat(end_date) if end_date else now

        # Build query
        query = [
            TimeEntry.status == TimerStatus.COMPLETED,
            TimeEntry.start_time >= start,
            TimeEntry.start_time <= end,
        ]
        if project_id:
            query.append(TimeEntry.project_id == project_id)

        entries = await TimeEntry.find(*query).to_list()

        # Group by user
        users_data: dict = {}
        for entry in entries:
            uid = entry.user_id
            if uid not in users_data:
                users_data[uid] = {
                    "total_seconds": 0,
                    "entries_count": 0,
                    "activity_sum": 0,
                    "screenshots_count": 0,
                }
            users_data[uid]["total_seconds"] += entry.duration_seconds
            users_data[uid]["entries_count"] += 1
            users_data[uid]["activity_sum"] += entry.activity_percent
            users_data[uid]["screenshots_count"] += len(entry.screenshots)

        # Get user names
        result = []
        for uid, data in users_data.items():
            user = await User.get(uid)
            result.append({
                "user_id": uid,
                "user_name": user.full_name if user else "Unknown",
                "total_seconds": data["total_seconds"],
                "total_hours": round(data["total_seconds"] / 3600, 2),
                "entries_count": data["entries_count"],
                "avg_activity_percent": data["activity_sum"] // data["entries_count"] if data["entries_count"] else 0,
                "screenshots_count": data["screenshots_count"],
            })

        return result

    @staticmethod
    def to_response(entry: TimeEntry) -> dict:
        """Convert TimeEntry to response dict"""
        # Calculate duration if running
        if entry.status in [TimerStatus.RUNNING, TimerStatus.PAUSED]:
            entry.calculate_duration()

        data = entry.model_dump(mode='json')
        data['id'] = str(entry.id)
        data['status'] = entry.status.value
        data['screenshot_count'] = len(entry.screenshots)
        data['billable_amount'] = entry.billable_amount
        return data

    @staticmethod
    def to_active_response(entry: Optional[TimeEntry]) -> ActiveTimerResponse:
        """Convert TimeEntry to ActiveTimerResponse"""
        if not entry:
            return ActiveTimerResponse(
                has_active_timer=False,
                timer=None,
                elapsed_seconds=0,
                elapsed_formatted="00:00:00"
            )

        entry.calculate_duration()
        elapsed = entry.duration_seconds

        return ActiveTimerResponse(
            has_active_timer=True,
            timer=TimeEntryResponse.model_validate(TimeTrackingService.to_response(entry)),
            elapsed_seconds=elapsed,
            elapsed_formatted=TimeTrackingService.format_duration(elapsed)
        )
