"""
Income endpoints for project revenue tracking.
"""

from fastapi import APIRouter, Depends, Query
from beanie import PydanticObjectId

from app.core.deps import get_current_user_from_token, require_role
from app.models.financial import Income
from app.services.financial_service import FinancialService
from app.schemas.financial import IncomeCreate, IncomeUpdate, IncomeResponse, ProfitLoss
from app.schemas.common import PaginatedResponse, MessageResponse
from app.core.exceptions import NotFoundException
from app.models.user import User

router = APIRouter(prefix="/income", tags=["Income"])


@router.get("", response_model=PaginatedResponse[IncomeResponse])
async def get_income(
    project_id: PydanticObjectId = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user_from_token),
):
    """Get income entries."""
    filters = {}
    if project_id:
        filters["project_id"] = str(project_id)  # Convert ObjectId to string for filtering

    income_list = await Income.find(filters).sort(-Income.income_date).skip(skip).limit(limit).to_list()
    total_income_count = await Income.find(filters).count()

    return PaginatedResponse(
        items=[
            IncomeResponse(
                id=str(i.id),
                amount=i.amount,
                income_date=i.income_date,
                description=i.description,
                source=i.source,
                project_id=i.project_id,
                created_by_id=i.created_by_id,
                created_at=i.created_at,
                updated_at=i.updated_at
            )
            for i in income_list
        ],
        total=total_income_count,
        skip=skip,
        limit=limit,
        has_more=len(income_list) == limit,
    )


@router.post("", response_model=IncomeResponse, status_code=201)
async def create_income(
    income_data: IncomeCreate,
    current_user: User = Depends(require_role("Admin", "Finance")),
):
    """Create income entry. Admin and Finance only."""
    return await FinancialService.create_income(income_data, current_user.id)


@router.get("/{income_id}", response_model=IncomeResponse)
async def get_income_by_id(
    income_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Get income by ID."""
    income = await Income.get(income_id)

    if not income:
        raise NotFoundException(detail="Income not found")

    return IncomeResponse(
        id=str(income.id),
        amount=income.amount,
        income_date=income.income_date,
        description=income.description,
        source=income.source,
        project_id=income.project_id,
        created_by_id=income.created_by_id,
        created_at=income.created_at,
        updated_at=income.updated_at
    )


@router.put("/{income_id}", response_model=IncomeResponse)
async def update_income(
    income_id: PydanticObjectId,
    income_data: IncomeUpdate,
    current_user: User = Depends(require_role("Admin", "Finance")),
):
    """Update income. Admin and Finance only."""
    income = await Income.get(income_id)

    if not income:
        raise NotFoundException(detail="Income not found")

    update_data = income_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(income, field, value)

    await income.save()

    return IncomeResponse(
        id=str(income.id),
        amount=income.amount,
        income_date=income.income_date,
        description=income.description,
        source=income.source,
        project_id=income.project_id,
        created_by_id=income.created_by_id,
        created_at=income.created_at,
        updated_at=income.updated_at
    )


@router.delete("/{income_id}", response_model=MessageResponse)
async def delete_income(
    income_id: PydanticObjectId,
    current_user: User = Depends(require_role("Admin", "ProjectManager")),
):
    """Delete income. Admin and PM only."""
    income = await Income.get(income_id)

    if not income:
        raise NotFoundException(detail="Income not found")

    await income.delete()

    return MessageResponse(message="Income deleted successfully")


@router.get("/projects/{project_id}/profit-loss", response_model=ProfitLoss)
async def get_profit_loss(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Get profit/loss calculation for a project."""
    return await FinancialService.calculate_profit_loss(project_id)