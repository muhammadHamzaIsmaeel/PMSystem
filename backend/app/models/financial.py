"""
Financial models (Expense, Income) using Beanie ODM for MongoDB.
"""

from enum import Enum
from typing import Optional
from datetime import datetime, date
from beanie import Document
from pydantic import Field
from bson import ObjectId
import pymongo


class ApprovalStatus(str, Enum):
    """Approval status for expenses"""
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class Expense(Document):
    """Expense model with approval workflow"""

    # Core fields
    category: str
    amount: float = Field(gt=0)
    description: Optional[str] = None
    expense_date: datetime  # Changed to datetime for proper serialization
    
    # Approval workflow
    approval_status: ApprovalStatus = ApprovalStatus.PENDING
    submitted_by_id: str
    approved_by_id: Optional[str] = None
    
    # Relationships
    project_id: str
    
    # Attachments (file paths)
    receipt_path: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "expenses"
        indexes = [
            [("project_id", pymongo.ASCENDING), ("approval_status", pymongo.ASCENDING)],
            [("submitted_by_id", pymongo.ASCENDING), ("approval_status", pymongo.ASCENDING)],
            [("expense_date", pymongo.DESCENDING)],
        ]

    def __repr__(self) -> str:
        return f"<Expense {self.category} ${self.amount} ({self.approval_status})>"


class Income(Document):
    """Income model for project revenue tracking"""

    # Core fields
    source: str
    amount: float = Field(gt=0)
    description: Optional[str] = None
    income_date: datetime  # Changed to datetime for proper serialization
    
    # Relationships
    project_id: str
    
    # Ownership
    created_by_id: str
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "income"
        indexes = [
            [("project_id", pymongo.ASCENDING), ("income_date", pymongo.DESCENDING)],
        ]

    def __repr__(self) -> str:
        return f"<Income {self.source} ${self.amount}>"