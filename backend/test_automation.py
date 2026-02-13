"""
Test script to verify time tracking automation functionality
"""

import asyncio
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.background_tasks import TimeTrackingAutomation
from app.models.time_entry import TimeEntry, TimerStatus
from datetime import datetime


async def test_automation():
    """Test the time tracking automation functionality"""
    print("🧪 Testing Time Tracking Automation...")
    
    # Create automation instance
    automation = TimeTrackingAutomation()
    
    # Test starting monitoring
    print("✅ Starting background monitoring...")
    await automation.start_monitoring()
    
    # Wait a bit to let it run
    await asyncio.sleep(5)
    
    # Test screenshot capture function
    print("✅ Testing screenshot capture simulation...")
    user_id = "test_user_123"
    screenshot_path = await automation._capture_screenshot(user_id)
    print(f"📸 Screenshot captured at: {screenshot_path}")
    
    # Test activity monitoring
    print("✅ Testing activity monitoring...")
    activity_data = await automation._get_current_activity()
    print(f"📊 Activity data: {activity_data}")
    
    # Test application detection
    print("✅ Testing application detection...")
    app_name = automation._get_active_application()
    window_title = automation._get_active_window()
    print(f"🖥️ Active application: {app_name}")
    print(f"🏷️ Active window: {window_title}")
    
    # Stop monitoring
    print("✅ Stopping background monitoring...")
    await automation.stop_monitoring()
    
    print("🎉 All tests completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_automation())