"""
Project service with CRUD operations and role-based filtering.
"""

from typing import List, Optional
from beanie import PydanticObjectId

from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.project import Project
from app.models.user import UserRole
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse


class ProjectService:
    """Service for project operations"""

    @staticmethod
    async def create_project(
        project_data: ProjectCreate, created_by_id: PydanticObjectId, user_role: UserRole
    ) -> ProjectResponse:
        """Create a new project"""
        project_dict = project_data.model_dump()

        # Auto-set manager_id for Project Managers if not provided (convert to string)
        if user_role == UserRole.PROJECT_MANAGER and not project_dict.get("manager_id"):
            project_dict["manager_id"] = str(created_by_id)

        project = Project(
            **project_dict,
            created_by_id=created_by_id,
        )

        await project.create()

        # Convert Beanie document to dict for proper serialization
        return ProjectResponse(
            id=str(project.id),
            name=project.name,
            client_name=project.client_name,
            description=project.description,
            budget=project.budget,
            start_date=project.start_date,
            end_date=project.end_date,
            status=project.status,
            manager_id=str(project.manager_id) if project.manager_id else None,
            created_by_id=str(project.created_by_id),
            created_at=project.created_at,
            updated_at=project.updated_at,
        )

    @staticmethod
    async def get_projects(
        user_id: PydanticObjectId,
        user_role: UserRole,
        skip: int = 0,
        limit: int = 100,
    ) -> List[ProjectResponse]:
        """
        Get projects with role-based filtering.
        - Admin/Finance/Viewer: See all projects
        - PM: See projects they manage
        - Team Member: See projects with tasks assigned to them
        """
        from app.models.task import Task

        filters = {}

        # Role-based filtering
        if user_role in [UserRole.ADMIN, UserRole.FINANCE, UserRole.VIEWER]:
            # Admin, Finance, and Viewer see all projects - no additional filters needed
            pass
        elif user_role == UserRole.PROJECT_MANAGER:
            # PM sees projects they manage
            filters["manager_id"] = str(user_id)  # Convert to string for compatibility
        elif user_role == UserRole.TEAM_MEMBER:
            # Team Members see only projects with tasks assigned to them
            assigned_tasks = await Task.find(Task.assigned_user_id == str(user_id)).to_list()
            project_ids = list(set([task.project_id for task in assigned_tasks]))

            if project_ids:
                filters["_id"] = {"$in": [PydanticObjectId(pid) for pid in project_ids]}
            else:
                # No tasks assigned, return empty list
                return []

        projects = await Project.find(filters).skip(skip).limit(limit).sort(-Project.created_at).to_list()

        # Convert each project to ProjectResponse
        return [
            ProjectResponse(
                id=str(p.id),
                name=p.name,
                client_name=p.client_name,
                description=p.description,
                budget=p.budget,
                start_date=p.start_date,
                end_date=p.end_date,
                status=p.status,
                manager_id=str(p.manager_id) if p.manager_id else None,
                created_by_id=str(p.created_by_id),
                created_at=p.created_at,
                updated_at=p.updated_at,
            )
            for p in projects
        ]

    @staticmethod
    async def get_project_by_id(
        project_id: PydanticObjectId, user_id: PydanticObjectId, user_role: UserRole
    ) -> ProjectResponse:
        """Get project by ID with role-based access"""
        project = await Project.get(project_id)

        if not project:
            raise NotFoundException(detail="Project not found")

        # Role-based access check
        # PM can access if they are the manager OR if they created the project
        if user_role == UserRole.PROJECT_MANAGER:
            is_manager = project.manager_id == str(user_id)  # manager_id is string, convert user_id
            is_creator = project.created_by_id == user_id  # Both are PydanticObjectId
            if not (is_manager or is_creator):
                raise ForbiddenException(detail="Not authorized to access this project")

        return ProjectResponse(
            id=str(project.id),
            name=project.name,
            client_name=project.client_name,
            description=project.description,
            budget=project.budget,
            start_date=project.start_date,
            end_date=project.end_date,
            status=project.status,
            manager_id=str(project.manager_id) if project.manager_id else None,
            created_by_id=str(project.created_by_id),
            created_at=project.created_at,
            updated_at=project.updated_at,
        )

    @staticmethod
    async def update_project(
        project_id: PydanticObjectId,
        project_data: ProjectUpdate,
        user_id: PydanticObjectId,
        user_role: UserRole,
    ) -> ProjectResponse:
        """
        Update project.
        - Admin: Can update all projects
        - PM: Can update projects they manage
        """
        project = await Project.get(project_id)

        if not project:
            raise NotFoundException(detail="Project not found")

        # Permission check
        # PM can update if they are the manager OR if they created the project
        if user_role == UserRole.PROJECT_MANAGER:
            is_manager = project.manager_id == str(user_id)  # manager_id is string, convert user_id
            is_creator = project.created_by_id == user_id  # Both are PydanticObjectId
            if not (is_manager or is_creator):
                raise ForbiddenException(detail="Not authorized to update this project")

        # Update fields
        update_data = project_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)

        await project.save()

        return ProjectResponse(
            id=str(project.id),
            name=project.name,
            client_name=project.client_name,
            description=project.description,
            budget=project.budget,
            start_date=project.start_date,
            end_date=project.end_date,
            status=project.status,
            manager_id=str(project.manager_id) if project.manager_id else None,
            created_by_id=str(project.created_by_id),
            created_at=project.created_at,
            updated_at=project.updated_at,
        )

    @staticmethod
    async def delete_project(
        project_id: PydanticObjectId
    ) -> None:
        """Delete project (Admin only - enforced at endpoint level)"""
        project = await Project.get(project_id)

        if not project:
            raise NotFoundException(detail="Project not found")

        await project.delete()