"""
User model with RBAC support using Beanie ODM for MongoDB.
Includes UserRole enum and User Document model.
"""

from enum import Enum
from typing import Optional
from datetime import datetime
from beanie import Document
from pydantic import Field, EmailStr
import pymongo


class UserRole(str, Enum):
    """User roles for RBAC"""

    ADMIN = "Admin"
    PROJECT_MANAGER = "ProjectManager"
    TEAM_MEMBER = "TeamMember"
    FINANCE = "Finance"
    VIEWER = "Viewer"


class User(Document):
    """User model with authentication and RBAC"""

    # Core fields
    email: EmailStr
    password_hash: str
    full_name: str
    role: UserRole

    # HRMSX integration
    hrmsx_user_id: Optional[str] = None

    # Status
    is_active: bool = True

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"  # Collection name in MongoDB
        indexes = [
            pymongo.IndexModel([("email", pymongo.ASCENDING)], unique=True),
            pymongo.IndexModel(
                [("hrmsx_user_id", pymongo.ASCENDING)],
                unique=True,
                partialFilterExpression={"hrmsx_user_id": {"$type": "string"}},
            ),
            [("role", pymongo.ASCENDING), ("is_active", pymongo.ASCENDING)],
        ]

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"

    def __str__(self) -> str:
        return self.email