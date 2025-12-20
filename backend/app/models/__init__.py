"""
Beanie ODM models package for MongoDB.
All models inherit from Beanie's Document class.
"""

# Import all models for easy access
from app.models.user import User, UserRole
from app.models.project import Project, ProjectStatus
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.financial import Expense, Income, ApprovalStatus
from app.models.time_entry import TimeEntry
from app.models.notification import Notification, NotificationType

__all__ = [
    "User",
    "UserRole",
    "Project",
    "ProjectStatus",
    "Task",
    "TaskStatus",
    "TaskPriority",
    "Expense",
    "Income",
    "ApprovalStatus",
    "TimeEntry",
    "Notification",
    "NotificationType",
]
