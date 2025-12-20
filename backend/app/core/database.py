"""
MongoDB database connection and initialization.
Uses Beanie ODM with Motor async driver.
"""

from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings


class MongoDB:
    """MongoDB connection manager"""
    client: Optional[AsyncIOMotorClient] = None


mongodb = MongoDB()


async def connect_to_mongo():
    """
    Connect to MongoDB and initialize Beanie ODM.
    Called on application startup.
    """
    # Import all models here to register them with Beanie
    from app.models.user import User
    from app.models.project import Project
    from app.models.task import Task
    from app.models.financial import Expense, Income
    from app.models.time_entry import TimeEntry
    from app.models.notification import Notification

    # Create Motor client
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)

    # Get database
    database = mongodb.client[settings.MONGODB_DB_NAME]

    # Initialize Beanie with document models
    await init_beanie(
        database=database,
        document_models=[
            User,
            Project,
            Task,
            Expense,
            Income,
            TimeEntry,
            Notification,
        ],
    )

    print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")


async def close_mongo_connection():
    """
    Close MongoDB connection.
    Called on application shutdown.
    """
    if mongodb.client:
        mongodb.client.close()
        print("❌ Closed MongoDB connection")


async def get_db():
    """
    Dependency for MongoDB database.

    Note: With Beanie, we don't need to yield a session like SQLAlchemy.
    This is kept for API compatibility but returns None.
    Beanie handles connections automatically.

    Usage:
        @app.get("/items")
        async def get_items(db = Depends(get_db)):
            # db is not needed with Beanie, models handle their own connections
            items = await Item.find_all().to_list()
    """
    # With Beanie, we don't need session management
    # Models handle their own database operations
    yield None
