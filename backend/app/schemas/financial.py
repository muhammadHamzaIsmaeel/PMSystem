"""
Financial Pydantic schemas for Expense and Income.
"""

from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict
from app.models.financial import ApprovalStatus
from app.schemas.common import Timestamps, UUIDEntity


class ExpenseCreate(BaseModel):
    """Schema for creating an expense"""

    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1, max_length=100)
    expense_date: datetime  # Use datetime for proper serialization
    description: Optional[str] = None
    project_id: str
    task_id: Optional[str] = None
    receipt_path: Optional[str] = None


class ExpenseUpdate(BaseModel):
    """Schema for updating an expense"""

    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    expense_date: Optional[datetime] = None  # Use datetime for proper serialization
    description: Optional[str] = None
    task_id: Optional[str] = None
    receipt_path: Optional[str] = None

    model_config = ConfigDict(extra="forbid")


class ExpenseApproval(BaseModel):
    """Schema for expense approval/rejection"""

    approval_status: ApprovalStatus
    notes: Optional[str] = None


class ExpenseResponse(UUIDEntity, Timestamps):
    """Schema for expense response"""

    amount: float
    category: str
    expense_date: datetime  # Use datetime for proper serialization
    description: Optional[str]
    approval_status: ApprovalStatus
    receipt_path: Optional[str]
    project_id: str
    task_id: Optional[str]
    submitted_by_id: str
    approved_by_id: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class IncomeCreate(BaseModel):
    """Schema for creating income"""

    amount: float = Field(..., gt=0)
    income_date: datetime  # Use datetime for proper serialization
    description: Optional[str] = None
    source: str = Field(..., min_length=1, max_length=100)
    project_id: str


class IncomeUpdate(BaseModel):
    """Schema for updating income"""

    amount: Optional[float] = Field(None, gt=0)
    income_date: Optional[datetime] = None  # Use datetime for proper serialization
    description: Optional[str] = None
    source: Optional[str] = Field(None, min_length=1, max_length=100)

    model_config = ConfigDict(extra="forbid")


class IncomeResponse(UUIDEntity, Timestamps):
    """Schema for income response"""

    amount: float
    income_date: datetime  # Use datetime for proper serialization
    description: Optional[str]
    source: str
    project_id: str
    created_by_id: str

    model_config = ConfigDict(from_attributes=True)


class ProfitLoss(BaseModel):
    """Schema for profit/loss calculation"""

    project_id: str
    total_income: float
    total_approved_expenses: float
    total_pending_expenses: float
    labor_costs: float
    net_profit: float
    profit_margin_percent: float