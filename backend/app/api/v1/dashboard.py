"""
Dashboard API endpoints
Provides summary statistics, charts, and financial reporting
"""

from fastapi import APIRouter, Depends, HTTPException, status

from typing import List, Dict
from pydantic import BaseModel
from beanie import PydanticObjectId
from datetime import datetime, timedelta
from beanie.operators import In


from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus
from app.models.task import Task, TaskStatus
from app.models.financial import Expense, Income, ApprovalStatus
from app.models.time_entry import TimeEntry
from app.core.deps import get_current_user_from_token


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class SummaryCards(BaseModel):
    """Dashboard summary cards"""
    total_projects: int
    active_tasks: int
    budget_utilization: float  # Percentage
    overall_profit_loss: float


class ProjectTimelineItem(BaseModel):
    """Project timeline data"""
    project_id: str
    project_name: str
    start_date: str | None
    end_date: str | None
    status: str


class ExpenseBreakdownItem(BaseModel):
    """Expense breakdown by category"""
    category: str
    amount: float
    count: int


class TaskCompletionItem(BaseModel):
    """Task completion by status"""
    status: str
    count: int


class ProfitLossDetail(BaseModel):
    """Detailed profit/loss calculation for a project"""
    project_id: str
    project_name: str
    total_income: float
    total_approved_expenses: float
    labor_costs: float
    net_profit: float
    profit_margin_percent: float


class IncomeBreakdownItem(BaseModel):
    """Income breakdown by project"""
    project_id: str
    project_name: str
    amount: float
    count: int


class PendingApprovalsCount(BaseModel):
    """Count of pending expense approvals"""
    pending_count: int


class ProjectProfitLossSummary(BaseModel):
    """Summary of profit/loss across all projects"""
    project_id: str
    project_name: str
    net_profit: float
    total_income: float
    total_expenses: float


@router.get("/summary", response_model=SummaryCards)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get dashboard summary cards with role-based filtering

    Returns:
        - Total Projects (role-filtered)
        - Active Tasks (assigned to user for Team Members)
        - Budget Utilization (percentage of budgets used)
        - Overall Profit/Loss (sum across all projects)
    """
    # Total Projects
    if current_user.role in [UserRole.ADMIN, UserRole.FINANCE, UserRole.VIEWER]:
        # Admin, Finance, and Viewer see all projects
        total_projects = await Project.count()
    elif current_user.role == UserRole.PROJECT_MANAGER:
        total_projects = await Project.find(Project.manager_id == str(current_user.id)).count()  # Convert ObjectId to string
    else:  # Team Members only
        # Get distinct project IDs from tasks assigned to the user
        pipeline = [
            {"$match": {"assigned_user_id": str(current_user.id)}},
            {"$group": {"_id": "$project_id"}},
            {"$count": "total"}
        ]
        result = await Task.aggregate(pipeline).to_list()
        total_projects = result[0]["total"] if result else 0

    # Active Tasks
    active_task_statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW]
    if current_user.role == UserRole.TEAM_MEMBER:
        # Team members see only their assigned tasks
        active_tasks = await Task.find(
            Task.assigned_user_id == str(current_user.id),
            In(Task.status, [status.value for status in active_task_statuses])
        ).count()
    else:
        # Admin, Project Manager, Finance, Viewer - see all active tasks
        active_tasks = await Task.find(
            In(Task.status, [status.value for status in active_task_statuses])
        ).count()

    # Budget Utilization
    # Calculate total budgets
    pipeline_budget = [
        {"$match": {"budget": {"$ne": None}}},
        {"$group": {"_id": None, "total": {"$sum": "$budget"}}}
    ]
    total_budget_result = await Project.aggregate(pipeline_budget).to_list()
    total_budget = total_budget_result[0]["total"] if total_budget_result else 0

    # Calculate total approved expenses
    pipeline_expenses = [
        {"$match": {"approval_status": ApprovalStatus.APPROVED.value}}, # Access enum value
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_expenses_result = await Expense.aggregate(pipeline_expenses).to_list()
    total_expenses = total_expenses_result[0]["total"] if total_expenses_result else 0

    budget_utilization = (total_expenses / total_budget * 100) if total_budget > 0 else 0

    # Overall Profit/Loss
    # Income - Approved Expenses - Labor Costs
    pipeline_income = [
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_income_result = await Income.aggregate(pipeline_income).to_list()
    total_income = total_income_result[0]["total"] if total_income_result else 0

    # Labor costs from time entries (assuming $50/hour default)
    pipeline_labor = [
        {"$group": {"_id": None, "total": {"$sum": "$duration_minutes"}}}
    ]
    total_minutes_result = await TimeEntry.aggregate(pipeline_labor).to_list()
    total_minutes = total_minutes_result[0]["total"] if total_minutes_result else 0
    labor_costs = (total_minutes / 60) * 50  # $50/hour

    overall_profit_loss = total_income - total_expenses - labor_costs

    return SummaryCards(
        total_projects=total_projects,
        active_tasks=active_tasks,
        budget_utilization=round(budget_utilization, 2),
        overall_profit_loss=round(overall_profit_loss, 2)
    )


@router.get("/charts/project-timeline", response_model=List[ProjectTimelineItem])
async def get_project_timeline(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get project timeline data for Gantt-style chart

    Returns list of projects with start/end dates
    """
    filters = {
        "start_date": {"$ne": None},
        "status": {"$ne": ProjectStatus.CANCELLED.value}
    }

    # Role-based filtering
    if current_user.role == UserRole.PROJECT_MANAGER:
        # PM sees only projects they manage
        filters["manager_id"] = str(current_user.id)  # Convert ObjectId to string
    elif current_user.role == UserRole.TEAM_MEMBER:
        # Team members see projects with tasks assigned to them
        assigned_tasks = await Task.find(
            Task.assigned_user_id == str(current_user.id)
        ).to_list()
        project_ids = [task.project_id for task in assigned_tasks]
        filters["_id"] = {"$in": [PydanticObjectId(pid) for pid in project_ids]}
    # Admin, Finance, Viewer - see all projects (no additional filtering)

    projects = await Project.find(filters).to_list()

    return [
        ProjectTimelineItem(
            project_id=str(project.id),
            project_name=project.name,
            start_date=project.start_date.isoformat() if project.start_date else None,
            end_date=project.end_date.isoformat() if project.end_date else None,
            status=project.status.value if hasattr(project.status, 'value') else project.status
        )
        for project in projects
    ]


@router.get("/charts/expense-breakdown", response_model=List[ExpenseBreakdownItem])
async def get_expense_breakdown(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get expense breakdown grouped by category

    Returns expenses grouped by category with totals
    """
    pipeline = [
        {"$match": {"approval_status": ApprovalStatus.APPROVED.value}},
        {"$group": {
            "_id": "$category",
            "total_amount": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"total_amount": -1}}
    ]

    breakdown = await Expense.aggregate(pipeline).to_list()

    return [
        ExpenseBreakdownItem(
            category=row["_id"],
            amount=float(row["total_amount"]),
            count=row["count"]
        )
        for row in breakdown
    ]


@router.get("/charts/task-completion", response_model=List[TaskCompletionItem])
async def get_task_completion(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get task completion counts by status

    Returns task counts grouped by status
    """
    pipeline = []

    # Role-based filtering
    if current_user.role == UserRole.TEAM_MEMBER:
        # Team members see only their assigned tasks
        pipeline.append({"$match": {"assigned_user_id": str(current_user.id)}})
    # Admin, Project Manager, Finance, Viewer - see all tasks (no filtering)

    pipeline.extend([
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }},
        {"$project": {
            "status": "$_id",
            "count": 1,
            "_id": 0
        }}
    ])

    completion = await Task.aggregate(pipeline).to_list()

    return [
        TaskCompletionItem(
            status=row["status"],  # Already a string from MongoDB
            count=row["count"]
        )
        for row in completion
    ]


@router.get("/projects/{project_id}/profit-loss", response_model=ProfitLossDetail)
async def get_project_profit_loss(
    project_id: PydanticObjectId,
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Calculate profit/loss for a specific project

    Formula: Total Income - Approved Expenses - Labor Costs
    """
    # Get project
    project = await Project.get(project_id)

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found"
        )

    # Calculate total income
    pipeline_income = [
        {"$match": {"project_id": str(project_id)}},  # Convert ObjectId to string
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_income_result = await Income.aggregate(pipeline_income).to_list()
    total_income = total_income_result[0]["total"] if total_income_result else 0

    # Calculate approved expenses
    pipeline_expenses = [
        {"$match": {
            "project_id": str(project_id),  # Convert ObjectId to string
            "approval_status": ApprovalStatus.APPROVED.value
        }},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    total_approved_expenses_result = await Expense.aggregate(pipeline_expenses).to_list()
    total_approved_expenses = total_approved_expenses_result[0]["total"] if total_approved_expenses_result else 0

    # Calculate labor costs from time entries
    # Find tasks belonging to this project
    tasks_in_project = await Task.find(Task.project_id == str(project_id)).to_list()  # Convert ObjectId to string
    task_ids_in_project = [task.id for task in tasks_in_project]

    pipeline_labor = [
        {"$match": {"task_id": {"$in": task_ids_in_project}}},
        {"$group": {"_id": None, "total": {"$sum": "$duration_minutes"}}}
    ]
    total_minutes_result = await TimeEntry.aggregate(pipeline_labor).to_list()
    total_minutes = total_minutes_result[0]["total"] if total_minutes_result else 0
    labor_costs = (total_minutes / 60) * 50  # $50/hour

    # Calculate net profit
    net_profit = total_income - total_approved_expenses - labor_costs

    # Calculate profit margin
    profit_margin_percent = (net_profit / total_income * 100) if total_income > 0 else 0

    return ProfitLossDetail(
        project_id=str(project_id),
        project_name=project.name,
        total_income=round(total_income, 2),
        total_approved_expenses=round(total_approved_expenses, 2),
        labor_costs=round(labor_costs, 2),
        net_profit=round(net_profit, 2),
        profit_margin_percent=round(profit_margin_percent, 2)
    )


@router.get("/charts/income-breakdown", response_model=List[IncomeBreakdownItem])
async def get_income_breakdown(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get income breakdown grouped by project

    Returns income grouped by project with totals
    """
    pipeline = [
        {"$group": {
            "_id": "$project_id",
            "total_amount": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"total_amount": -1}}
    ]

    breakdown = await Income.aggregate(pipeline).to_list()

    result = []
    for row in breakdown:
        project_id = row["_id"]
        project = await Project.get(PydanticObjectId(project_id))
        if project:
            result.append(IncomeBreakdownItem(
                project_id=project_id,
                project_name=project.name,
                amount=float(row["total_amount"]),
                count=row["count"]
            ))

    return result


@router.get("/pending-approvals", response_model=PendingApprovalsCount)
async def get_pending_approvals(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get count of pending expense approvals

    Returns count of expenses awaiting approval
    """
    pending_count = await Expense.find(
        Expense.approval_status == ApprovalStatus.PENDING
    ).count()

    return PendingApprovalsCount(pending_count=pending_count)


@router.get("/projects-profit-loss", response_model=List[ProjectProfitLossSummary])
async def get_projects_profit_loss(
    current_user: User = Depends(get_current_user_from_token)
):
    """
    Get profit/loss summary for all projects

    Returns list of projects with their profit/loss calculations
    """
    # Get all projects based on role
    if current_user.role == UserRole.PROJECT_MANAGER:
        projects = await Project.find(Project.manager_id == str(current_user.id)).to_list()
    else:
        # Admin, Finance, Viewer - see all projects
        projects = await Project.find().to_list()

    result = []
    for project in projects:
        # Calculate total income for this project
        pipeline_income = [
            {"$match": {"project_id": str(project.id)}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        total_income_result = await Income.aggregate(pipeline_income).to_list()
        total_income = total_income_result[0]["total"] if total_income_result else 0

        # Calculate approved expenses for this project
        pipeline_expenses = [
            {"$match": {
                "project_id": str(project.id),
                "approval_status": ApprovalStatus.APPROVED.value
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]
        total_expenses_result = await Expense.aggregate(pipeline_expenses).to_list()
        total_expenses = total_expenses_result[0]["total"] if total_expenses_result else 0

        # Calculate labor costs
        tasks_in_project = await Task.find(Task.project_id == str(project.id)).to_list()
        task_ids_in_project = [task.id for task in tasks_in_project]

        pipeline_labor = [
            {"$match": {"task_id": {"$in": task_ids_in_project}}},
            {"$group": {"_id": None, "total": {"$sum": "$duration_minutes"}}}
        ]
        total_minutes_result = await TimeEntry.aggregate(pipeline_labor).to_list()
        total_minutes = total_minutes_result[0]["total"] if total_minutes_result else 0
        labor_costs = (total_minutes / 60) * 50  # $50/hour

        net_profit = total_income - total_expenses - labor_costs

        result.append(ProjectProfitLossSummary(
            project_id=str(project.id),
            project_name=project.name,
            net_profit=round(net_profit, 2),
            total_income=round(total_income, 2),
            total_expenses=round(total_expenses + labor_costs, 2)
        ))

    # Sort by net_profit descending
    result.sort(key=lambda x: x.net_profit, reverse=True)

    return result
