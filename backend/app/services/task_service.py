"""
Task service with CRUD operations, subtask creation, and role-based filtering.
"""

from typing import List, Optional
from beanie import PydanticObjectId

from app.core.config import settings
from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.task import Task
from app.models.project import Project
from app.models.user import UserRole, User
from app.models.notification import NotificationType
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, SubtaskCreate
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService


class TaskService:
    """Service for task operations"""

    @staticmethod
    async def create_task(
        task_data: TaskCreate, created_by_id: PydanticObjectId
    ) -> TaskResponse:
        """Create a new task"""
        # Verify project exists
        project = await Project.get(task_data.project_id)
        if not project:
            raise NotFoundException(detail="Project not found")

        task = Task(
            **task_data.model_dump(),
            created_by_id=str(created_by_id),  # Convert ObjectId to string
        )

        await task.insert()

        # Create notification and send email if task is assigned
        if task.assigned_user_id:
            await NotificationService.create_notification(
                recipient_id=task.assigned_user_id,
                notification_type=NotificationType.TASK_ASSIGNED,
                related_entity_type="task",
                related_entity_id=str(task.id),  # Convert ObjectId to string
                message=f"You have been assigned to task: {task.title}"
            )

            # Send email notification
            try:
                assigned_user = await User.get(task.assigned_user_id)
                if assigned_user and assigned_user.email:
                    email_service = EmailService()
                    email_service.send_email(
                        to_email=assigned_user.email,
                        subject=f"New Task Assignment: {task.title}",
                        template_name="task_assigned.html",
                        assignee_name=assigned_user.full_name if assigned_user.full_name else assigned_user.email,
                        task_title=task.title,
                        task_description=task.description or "No description provided",
                        project_name=project.name if project and project.name else "Unknown Project",
                        priority=task.priority.value if hasattr(task.priority, 'value') else str(task.priority),
                        assigned_by_name="Project Gemini Team",  # In a real scenario, you'd get the creator's name
                        task_url=f"{settings.FRONTEND_URL}/tasks/{task.id}" if hasattr(settings, 'FRONTEND_URL') else f"https://projectgemini.com/tasks/{task.id}"
                    )
            except Exception as e:
                print(f"Failed to send task assignment email: {e}")

        return TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            progress=task.progress,
            deadline=task.deadline,
            project_id=task.project_id,
            assigned_user_id=task.assigned_user_id,
            parent_task_id=task.parent_task_id,
            created_by_id=task.created_by_id,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

    @staticmethod
    async def create_subtask(
        parent_task_id: PydanticObjectId,
        subtask_data: SubtaskCreate,
        created_by_id: PydanticObjectId,
    ) -> TaskResponse:
        """Create a subtask under a parent task"""
        # Verify parent task exists
        parent_task = await Task.get(parent_task_id)

        if not parent_task:
            raise NotFoundException(detail="Parent task not found")

        subtask = Task(
            title=subtask_data.title,
            description=subtask_data.description,
            priority=subtask_data.priority,
            deadline=subtask_data.deadline,
            assigned_user_id=subtask_data.assigned_user_id,
            project_id=parent_task.project_id,
            parent_task_id=str(parent_task_id),  # Convert ObjectId to string
            created_by_id=str(created_by_id),  # Convert ObjectId to string
        )

        await subtask.insert()

        # Create notification and send email if subtask is assigned
        if subtask.assigned_user_id:
            await NotificationService.create_notification(
                recipient_id=subtask.assigned_user_id,
                notification_type=NotificationType.TASK_ASSIGNED,
                related_entity_type="task",
                related_entity_id=str(subtask.id),  # Convert ObjectId to string
                message=f"You have been assigned to subtask: {subtask.title}"
            )

            # Send email notification
            try:
                assigned_user = await User.get(subtask.assigned_user_id)
                if assigned_user and assigned_user.email:
                    email_service = EmailService()
                    email_service.send_email(
                        to_email=assigned_user.email,
                        subject=f"New Subtask Assignment: {subtask.title}",
                        template_name="task_assigned.html",
                        assignee_name=assigned_user.full_name if assigned_user.full_name else assigned_user.email,
                        task_title=subtask.title,
                        task_description=subtask.description or "No description provided",
                        project_name=parent_task.project_id,  # Since we don't have the project name directly, we use the project_id
                        priority=subtask.priority.value if hasattr(subtask.priority, 'value') else str(subtask.priority),
                        assigned_by_name="Project Gemini Team",  # In a real scenario, you'd get the creator's name
                        task_url=f"{settings.FRONTEND_URL}/tasks/{subtask.id}" if hasattr(settings, 'FRONTEND_URL') else f"https://projectgemini.com/tasks/{subtask.id}"
                    )
            except Exception as e:
                print(f"Failed to send subtask assignment email: {e}")

        return TaskResponse(
            id=str(subtask.id),
            title=subtask.title,
            description=subtask.description,
            status=subtask.status,
            priority=subtask.priority,
            progress=subtask.progress,
            deadline=subtask.deadline,
            project_id=subtask.project_id,
            assigned_user_id=subtask.assigned_user_id,
            parent_task_id=subtask.parent_task_id,
            created_by_id=subtask.created_by_id,
            created_at=subtask.created_at,
            updated_at=subtask.updated_at
        )

    @staticmethod
    async def get_tasks(
        user_id: PydanticObjectId,
        user_role: UserRole,
        project_id: Optional[PydanticObjectId] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[TaskResponse]:
        """
        Get tasks with role-based filtering.
        - Admin/PM: See all tasks (optionally filtered by project)
        - Team Member: See assigned tasks
        - Finance/Viewer: See all tasks in projects they can access
        """
        filters = {}

        # Filter by project if specified
        if project_id:
            filters["project_id"] = project_id

        # Role-based filtering
        if user_role == UserRole.TEAM_MEMBER:
            # Team members see only assigned tasks
            filters["assigned_user_id"] = str(user_id)  # Convert ObjectId to string
        # For other roles, no additional filtering is applied here; they see all tasks
        # in the specified project or all tasks if no project_id

        tasks = await Task.find(filters).skip(skip).limit(limit).sort(-Task.created_at).to_list()

        return [
            TaskResponse(
                id=str(t.id),
                title=t.title,
                description=t.description,
                status=t.status,
                priority=t.priority,
                progress=t.progress,
                deadline=t.deadline,
                project_id=t.project_id,
                assigned_user_id=t.assigned_user_id,
                parent_task_id=t.parent_task_id,
                created_by_id=t.created_by_id,
                created_at=t.created_at,
                updated_at=t.updated_at
            )
            for t in tasks
        ]

    @staticmethod
    async def get_task_by_id(
        task_id: PydanticObjectId
    ) -> TaskResponse:
        """Get task by ID"""
        task = await Task.get(task_id)

        if not task:
            raise NotFoundException(detail="Task not found")

        return TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            progress=task.progress,
            deadline=task.deadline,
            project_id=task.project_id,
            assigned_user_id=task.assigned_user_id,
            parent_task_id=task.parent_task_id,
            created_by_id=task.created_by_id,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

    @staticmethod
    async def update_task(
        task_id: PydanticObjectId,
        task_data: TaskUpdate,
        user_id: PydanticObjectId,
        user_role: UserRole,
    ) -> TaskResponse:
        """
        Update task.
        - Admin/PM: Can update all fields
        - Assigned team member: Can update status and progress
        """
        task = await Task.get(task_id)

        if not task:
            raise NotFoundException(detail="Task not found")

        # Track original assignee to detect reassignment
        original_assignee = task.assigned_user_id

        # Permission check for team members
        if user_role == UserRole.TEAM_MEMBER:
            if task.assigned_user_id != str(user_id):  # Convert ObjectId to string for comparison
                raise ForbiddenException(detail="Not authorized to update this task")
            # Team members can only update status and progress
            allowed_fields = {'status', 'progress'}
            update_data = {
                k: v for k, v in task_data.model_dump(exclude_unset=True).items()
                if k in allowed_fields
            }
        else:
            update_data = task_data.model_dump(exclude_unset=True)

        # Update fields
        for field, value in update_data.items():
            setattr(task, field, value)

        await task.save()

        # Create notification and send email if task was reassigned
        if 'assigned_user_id' in update_data:
            new_assignee = update_data['assigned_user_id']
            if new_assignee and new_assignee != original_assignee:
                await NotificationService.create_notification(
                    recipient_id=new_assignee,
                    notification_type=NotificationType.TASK_ASSIGNED,
                    related_entity_type="task",
                    related_entity_id=str(task.id),  # Convert ObjectId to string
                    message=f"You have been assigned to task: {task.title}"
                )

                # Send email notification to new assignee
                try:
                    new_user = await User.get(new_assignee)
                    if new_user and new_user.email:
                        # Get project name for the email
                        project = await Project.get(task.project_id) if task.project_id else None

                        email_service = EmailService()
                        email_service.send_email(
                            to_email=new_user.email,
                            subject=f"Task Reassigned to You: {task.title}",
                            template_name="task_assigned.html",
                            assignee_name=new_user.full_name if new_user.full_name else new_user.email,
                            task_title=task.title,
                            task_description=task.description or "No description provided",
                            project_name=project.name if project and project.name else "Unknown Project",
                            priority=task.priority.value if hasattr(task.priority, 'value') else str(task.priority),
                            assigned_by_name="Project Gemini Team",  # In a real scenario, you'd get the assigner's name
                            task_url=f"{settings.FRONTEND_URL}/tasks/{task.id}" if hasattr(settings, 'FRONTEND_URL') else f"https://projectgemini.com/tasks/{task.id}"
                        )
                except Exception as e:
                    print(f"Failed to send task reassignment email: {e}")

        return TaskResponse(
            id=str(task.id),
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            progress=task.progress,
            deadline=task.deadline,
            project_id=task.project_id,
            assigned_user_id=task.assigned_user_id,
            parent_task_id=task.parent_task_id,
            created_by_id=task.created_by_id,
            created_at=task.created_at,
            updated_at=task.updated_at
        )

    @staticmethod
    async def delete_task(
        task_id: PydanticObjectId
    ) -> None:
        """Delete task (Admin/PM only - enforced at endpoint level)"""
        task = await Task.get(task_id)

        if not task:
            raise NotFoundException(detail="Task not found")

        await task.delete()