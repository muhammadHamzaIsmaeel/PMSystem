"""
Project endpoints with role-based access control.
"""

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_db, get_current_user_from_token, require_role
from app.services.project_service import ProjectService
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=PaginatedResponse[ProjectResponse])
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user_from_token),
    db = Depends(get_db),
):
    """
    Get projects list with role-based filtering.
    - Admin/Finance: See all projects
    - PM: See projects they manage
    - Team Member/Viewer: See projects with assigned tasks
    """
    projects = await ProjectService.get_projects(
        current_user.id, current_user.role, skip, limit
    )

    # Get total count (simplified - return current count)
    total = len(projects)
    has_more = len(projects) == limit

    return PaginatedResponse(
        items=projects,
        total=total,
        skip=skip,
        limit=limit,
        has_more=has_more,
    )


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(require_role("Admin", "ProjectManager")),
    db = Depends(get_db),
):
    """
    Create a new project.
    Admin and PM only.
    """
    return await ProjectService.create_project(project_data, current_user.id, current_user.role)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user_from_token),
    db = Depends(get_db),
):
    """
    Get project by ID with role-based access.
    """
    return await ProjectService.get_project_by_id(
        project_id, current_user.id, current_user.role
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: User = Depends(require_role("Admin", "ProjectManager")),
    db = Depends(get_db),
):
    """
    Update a project.
    - Admin: Can update all projects
    - PM: Can update projects they manage
    """
    return await ProjectService.update_project(
        project_id, project_data, current_user.id, current_user.role
    )


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(
    project_id: str,
    current_user: User = Depends(require_role("Admin")),
    db = Depends(get_db),
):
    """
    Delete a project.
    Admin only.
    """
    await ProjectService.delete_project(project_id)
    return MessageResponse(message="Project deleted successfully")
