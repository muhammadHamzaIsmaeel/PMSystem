"""
Database seed script with default users (one per role).
Run with: python -m app.seed
"""

import asyncio

from app.core.security import hash_password
from app.models.user import User, UserRole


async def seed_users():
    """Create 5 default users (one per role) if they don't exist"""

    # Check if users already exist
    existing_users_count = await User.count_documents()

    if existing_users_count > 0:
        print(f"Database already has {existing_users_count} users. Skipping seed.")
        return

    # Default users - one per role
    default_users = [
        {
            "email": "admin@example.com",
            "password": "admin123456",
            "full_name": "System Administrator",
            "role": UserRole.ADMIN,
            "hrmsx_user_id": "HRMSX_ADMIN_001",
        },
        {
            "email": "pm@example.com",
            "password": "pm123456",
            "full_name": "Project Manager",
            "role": UserRole.PROJECT_MANAGER,
            "hrmsx_user_id": "HRMSX_PM_001",
        },
        {
            "email": "member@example.com",
            "password": "member123456",
            "full_name": "Team Member",
            "role": UserRole.TEAM_MEMBER,
            "hrmsx_user_id": "HRMSX_MEMBER_001",
        },
        {
            "email": "finance@example.com",
            "password": "finance123456",
            "full_name": "Finance Manager",
            "role": UserRole.FINANCE,
            "hrmsx_user_id": "HRMSX_FINANCE_001",
        },
        {
            "email": "viewer@example.com",
            "password": "viewer123456",
            "full_name": "View Only User",
            "role": UserRole.VIEWER,
            "hrmsx_user_id": "HRMSX_VIEWER_001",
        },
    ]

    # Create users
    for user_data in default_users:
        user = User(
            email=user_data["email"],
            password_hash=hash_password(user_data["password"]),
            full_name=user_data["full_name"],
            role=user_data["role"],
            hrmsx_user_id=user_data["hrmsx_user_id"],
            is_active=True,
        )
        await user.insert()
        print(f"Created user: {user.email} ({user.role})")

    print("\nSeed completed successfully!")
    print("\nDefault credentials:")
    for user_data in default_users:
        print(f"  {user_data['role']:20} - {user_data['email']:25} / {user_data['password']}")


async def main():
    """Main seed function"""
    print("Starting database seed...\n")

    from app.core.database import connect_to_mongo, init_beanie
    await connect_to_mongo()
    await init_beanie()

    try:
        await seed_users()
    except Exception as e:
        print(f"Error during seed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())
