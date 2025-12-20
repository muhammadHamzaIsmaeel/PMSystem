"""
API v1 router aggregator.
Combines all v1 API routes into a single router.
"""

from fastapi import APIRouter
from app.api.v1 import auth, users, projects, tasks, time_entries, expenses, income, kanban, dashboard, notifications

# Create API v1 router
api_router = APIRouter()

# Include routers
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(projects.router)
api_router.include_router(tasks.router)
api_router.include_router(time_entries.router)
api_router.include_router(expenses.router)
api_router.include_router(income.router)
api_router.include_router(kanban.router)
api_router.include_router(dashboard.router)
api_router.include_router(notifications.router)

# Placeholder health endpoint for v1
@api_router.get("/ping")
async def ping() -> dict:
    """Ping endpoint for API v1."""
    return {"message": "pong", "version": "v1"}

