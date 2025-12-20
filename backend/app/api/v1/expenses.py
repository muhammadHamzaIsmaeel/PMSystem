"""
Expense endpoints with approval workflow.
"""

from fastapi import APIRouter, Depends, Query
from beanie import PydanticObjectId

from app.core.deps import get_current_user_from_token, require_role
from app.models.financial import Expense, ApprovalStatus
from app.services.financial_service import FinancialService
from app.schemas.financial import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.schemas.common import PaginatedResponse, MessageResponse
from app.core.exceptions import NotFoundException
from app.models.user import User

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=PaginatedResponse[ExpenseResponse])
async def get_expenses(
    project_id: PydanticObjectId = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user_from_token),
):
    """
    Get expenses with role-based filtering.
    - Team Member: See only their own submitted expenses
    - Finance/Admin/PM/Viewer: See all expenses
    """
    from app.models.user import UserRole

    filters = {}
    if project_id:
        filters["project_id"] = str(project_id)  # Convert ObjectId to string for filtering

    # Role-based filtering
    if current_user.role == UserRole.TEAM_MEMBER:
        # Team members see only their own submitted expenses
        filters["submitted_by_id"] = str(current_user.id)

    expenses_list = await Expense.find(filters).sort(-Expense.expense_date).skip(skip).limit(limit).to_list()
    total_expenses = await Expense.find(filters).count()

    return PaginatedResponse(
        items=[
            ExpenseResponse(
                id=str(e.id),
                amount=e.amount,
                category=e.category,
                expense_date=e.expense_date,
                description=e.description,
                approval_status=e.approval_status,
                receipt_path=e.receipt_path,
                project_id=e.project_id,
                task_id=None,
                submitted_by_id=e.submitted_by_id,
                approved_by_id=e.approved_by_id,
                created_at=e.created_at,
                updated_at=e.updated_at
            )
            for e in expenses_list
        ],
        total=total_expenses,
        skip=skip,
        limit=limit,
        has_more=len(expenses_list) == limit,
    )


@router.post("", response_model=ExpenseResponse, status_code=201)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user_from_token),
):
    """Create a new expense."""
    return await FinancialService.create_expense(expense_data, current_user.id)


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token),
):
    """Get expense by ID."""
    expense = await Expense.get(expense_id)

    if not expense:
        raise NotFoundException(detail="Expense not found")

    return ExpenseResponse(
        id=str(expense.id),
        amount=expense.amount,
        category=expense.category,
        expense_date=expense.expense_date,
        description=expense.description,
        approval_status=expense.approval_status,
        receipt_path=expense.receipt_path,
        project_id=expense.project_id,
        task_id=None,
        submitted_by_id=expense.submitted_by_id,
        approved_by_id=expense.approved_by_id,
        created_at=expense.created_at,
        updated_at=expense.updated_at
    )


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: PydanticObjectId,
    expense_data: ExpenseUpdate,
    current_user: User = Depends(get_current_user_from_token),
):
    """Update expense."""
    expense = await Expense.get(expense_id)

    if not expense:
        raise NotFoundException(detail="Expense not found")

    update_data = expense_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expense, field, value)

    await expense.save()

    return ExpenseResponse.model_validate(expense)


@router.patch("/{expense_id}/approve", response_model=ExpenseResponse)
async def approve_expense(
    expense_id: PydanticObjectId,
    current_user: User = Depends(require_role("Finance", "Admin")),
):
    """Approve expense. Finance and Admin only."""
    return await FinancialService.approve_expense(expense_id, current_user.id)


@router.patch("/{expense_id}/reject", response_model=ExpenseResponse)
async def reject_expense(
    expense_id: PydanticObjectId,
    current_user: User = Depends(require_role("Finance", "Admin")),
):
    """Reject expense. Finance and Admin only."""
    return await FinancialService.reject_expense(expense_id, current_user.id)