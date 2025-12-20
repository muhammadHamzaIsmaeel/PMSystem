"""
Financial service with profit/loss calculation logic.
"""

from typing import List
from beanie import PydanticObjectId

from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.financial import Expense, Income, ApprovalStatus
from app.models.time_entry import TimeEntry
from app.models.project import Project
from app.models.notification import NotificationType
from app.schemas.financial import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    IncomeCreate,
    IncomeUpdate,
    IncomeResponse,
    ProfitLoss,
)
from app.services.notification_service import NotificationService


class FinancialService:
    """Service for financial operations"""

    # Expense operations
    @staticmethod
    async def create_expense(
        expense_data: ExpenseCreate, submitted_by_id: PydanticObjectId
    ) -> ExpenseResponse:
        """Create a new expense"""
        # Verify project exists
        project = await Project.get(expense_data.project_id)
        if not project:
            raise NotFoundException(detail="Project not found")

        expense = Expense(
            **expense_data.model_dump(),
            submitted_by_id=str(submitted_by_id),  # Convert ObjectId to string
        )

        await expense.insert()

        return ExpenseResponse(
            id=str(expense.id),
            amount=expense.amount,
            category=expense.category,
            expense_date=expense.expense_date,
            description=expense.description,
            approval_status=expense.approval_status,
            receipt_path=expense.receipt_path,
            project_id=expense.project_id,
            task_id=None,  # Not used in current model
            submitted_by_id=expense.submitted_by_id,
            approved_by_id=expense.approved_by_id,
            created_at=expense.created_at,
            updated_at=expense.updated_at
        )

    @staticmethod
    async def approve_expense(
        expense_id: PydanticObjectId, approved_by_id: PydanticObjectId
    ) -> ExpenseResponse:
        """Approve an expense (Finance only)"""
        expense = await Expense.get(expense_id)

        if not expense:
            raise NotFoundException(detail="Expense not found")

        # Check submitter != approver
        if expense.submitted_by_id == approved_by_id:
            raise BadRequestException(
                detail="Cannot approve your own expense"
            )

        expense.approval_status = ApprovalStatus.APPROVED
        expense.approved_by_id = str(approved_by_id)  # Convert ObjectId to string

        await expense.save()

        # Notify the submitter
        await NotificationService.create_notification(
            recipient_id=expense.submitted_by_id,
            notification_type=NotificationType.EXPENSE_STATUS_CHANGED,
            related_entity_type="expense",
            related_entity_id=str(expense.id),  # Convert ObjectId to string
            message=f"Your expense '{expense.category}' (${expense.amount:.2f}) has been approved"
        )

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

    @staticmethod
    async def reject_expense(
        expense_id: PydanticObjectId, approved_by_id: PydanticObjectId
    ) -> ExpenseResponse:
        """Reject an expense (Finance only)"""
        expense = await Expense.get(expense_id)

        if not expense:
            raise NotFoundException(detail="Expense not found")

        expense.approval_status = ApprovalStatus.REJECTED
        expense.approved_by_id = str(approved_by_id)  # Convert ObjectId to string

        await expense.save()

        # Notify the submitter
        await NotificationService.create_notification(
            recipient_id=expense.submitted_by_id,
            notification_type=NotificationType.EXPENSE_STATUS_CHANGED,
            related_entity_type="expense",
            related_entity_id=str(expense.id),  # Convert ObjectId to string
            message=f"Your expense '{expense.category}' (${expense.amount:.2f}) has been rejected"
        )

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

    # Income operations
    @staticmethod
    async def create_income(
        income_data: IncomeCreate, created_by_id: PydanticObjectId
    ) -> IncomeResponse:
        """Create a new income entry"""
        # Verify project exists
        project = await Project.get(income_data.project_id)
        if not project:
            raise NotFoundException(detail="Project not found")

        income = Income(
            **income_data.model_dump(),
            created_by_id=str(created_by_id),  # Convert ObjectId to string
        )

        await income.insert()

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

    # Profit/Loss calculation
    @staticmethod
    async def calculate_profit_loss(
        project_id: PydanticObjectId
    ) -> ProfitLoss:
        """
        Calculate profit/loss for a project.
        Formula: Total Income - Approved Expenses - Labor Costs
        Labor Costs = Sum of time entries duration * hourly rate (simplified as $0 for now)
        """
        # Verify project exists
        project = await Project.get(project_id)
        if not project:
            raise NotFoundException(detail="Project not found")

        # Calculate total income
        pipeline_income = [
            {"$match": {"project_id": str(project_id)}},  # Convert ObjectId to string
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        total_income_result = await Income.aggregate(pipeline_income).to_list()
        total_income = float(total_income_result[0]["total"]) if total_income_result else 0.0

        # Calculate approved expenses
        pipeline_approved_expenses = [
            {"$match": {
                "project_id": str(project_id),  # Convert ObjectId to string
                "approval_status": ApprovalStatus.APPROVED.value
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        total_approved_expenses_result = await Expense.aggregate(pipeline_approved_expenses).to_list()
        total_approved_expenses = float(total_approved_expenses_result[0]["total"]) if total_approved_expenses_result else 0.0

        # Calculate pending expenses
        pipeline_pending_expenses = [
            {"$match": {
                "project_id": str(project_id),  # Convert ObjectId to string
                "approval_status": ApprovalStatus.PENDING.value
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        total_pending_expenses_result = await Expense.aggregate(pipeline_pending_expenses).to_list()
        total_pending_expenses = float(total_pending_expenses_result[0]["total"]) if total_pending_expenses_result else 0.0

        # Calculate labor costs (simplified - assume $0 for now)
        # In production, you would multiply duration_minutes by hourly rate
        labor_costs = 0.0

        # Calculate net profit
        net_profit = total_income - total_approved_expenses - labor_costs

        # Calculate profit margin
        profit_margin_percent = (
            (net_profit / total_income * 100) if total_income > 0 else 0.0
        )

        return ProfitLoss(
            project_id=str(project_id),
            total_income=total_income,
            total_approved_expenses=total_approved_expenses,
            total_pending_expenses=total_pending_expenses,
            labor_costs=labor_costs,
            net_profit=net_profit,
            profit_margin_percent=round(profit_margin_percent, 2),
        )