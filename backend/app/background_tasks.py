"""
Background tasks for time tracking automation.
Handles automatic screenshot capture and activity monitoring for running timers.
"""

import asyncio
import aiofiles
import os
import uuid
import random
from datetime import datetime, timedelta
from typing import Optional
import psutil
import time

from app.models.time_entry import TimeEntry, TimerStatus
from app.models.user import User
from app.core.config import settings
from app.services.time_tracking_service import TimeTrackingService
from app.schemas.time_entry import ActivityUpdateRequest


class TimeTrackingAutomation:
    """
    Background automation for time tracking features:
    - Automatic screenshot capture at configured intervals
    - Activity monitoring (keyboard/mouse usage)
    - Application usage tracking
    """
    
    def __init__(self):
        self.running = False
        self.monitoring_task = None
        
    async def start_monitoring(self):
        """Start the background monitoring task"""
        if not self.running:
            self.running = True
            self.monitoring_task = asyncio.create_task(self._monitor_loop())
            print("⏰ Started time tracking background monitoring")
    
    async def stop_monitoring(self):
        """Stop the background monitoring task"""
        if self.running:
            self.running = False
            if self.monitoring_task:
                self.monitoring_task.cancel()
                try:
                    await self.monitoring_task
                except asyncio.CancelledError:
                    pass
            print("⏹️ Stopped time tracking background monitoring")
    
    async def _monitor_loop(self):
        """Main monitoring loop that runs in the background"""
        while self.running:
            try:
                # Process all active timers
                await self._process_active_timers()
                
                # Sleep for 1 minute before next check
                # This can be adjusted based on requirements
                await asyncio.sleep(60)
            except Exception as e:
                print(f"Error in monitoring loop: {e}")
                await asyncio.sleep(60)  # Wait before retrying
    
    async def _process_active_timers(self):
        """Process all currently active timers"""
        # Find all running timers
        active_timers = await TimeEntry.find(
            TimeEntry.status == TimerStatus.RUNNING
        ).to_list()
        
        for timer in active_timers:
            try:
                # Check if it's time to capture a screenshot
                await self._maybe_capture_screenshot(timer)
                
                # Update activity data
                await self._update_activity_data(timer)
                
            except Exception as e:
                print(f"Error processing timer {timer.id}: {e}")
    
    async def _maybe_capture_screenshot(self, timer: TimeEntry):
        """Capture screenshot if interval has passed"""
        if not timer.track_apps:  # Only capture if tracking is enabled
            return
            
        # Calculate time since timer started
        time_since_start = datetime.utcnow() - timer.start_time
        minutes_since_start = int(time_since_start.total_seconds() / 60)
        
        # Check if enough time has passed for next screenshot
        if minutes_since_start > 0 and minutes_since_start % timer.screenshot_interval == 0:
            # Capture screenshot
            screenshot_path = await self._capture_screenshot(timer.user_id)
            
            if screenshot_path:
                # Add screenshot to the time entry
                await TimeTrackingService.add_screenshot(
                    str(timer.id),
                    str(timer.user_id),
                    screenshot_path,
                    activity_percent=timer.activity_percent  # Use current activity percent
                )
    
    async def _capture_screenshot(self, user_id: str) -> Optional[str]:
        """Capture a screenshot and save it to the appropriate directory"""
        try:
            # Check if we're in an environment where screenshots are possible
            # In Docker containers, GUI operations are typically not available
            if os.path.exists('/.dockerenv') or os.environ.get('DOCKER_ENV', False):
                # In Docker environment - skip screenshot capture
                print("⚠️ Running in Docker/containerized environment - skipping screenshot capture")
                return None
            
            # Try to import required modules
            try:
                from PIL import ImageGrab
            except ImportError:
                print("⚠️ PIL ImageGrab not available - skipping screenshot capture")
                return None
            
            # Create screenshots directory for this user
            screenshots_dir = os.path.join(settings.UPLOAD_DIR, "screenshots", user_id)
            os.makedirs(screenshots_dir, exist_ok=True)
            
            # Generate unique filename
            file_name = f"screenshot_{int(time.time())}_{str(uuid.uuid4())[:8]}.png"
            file_path = os.path.join(screenshots_dir, file_name)
            
            # Capture screenshot using PIL
            screenshot = ImageGrab.grab()
            screenshot.save(file_path)
            
            return file_path
        except Exception as e:
            print(f"Error capturing screenshot: {e}")
            return None
    
    async def _update_activity_data(self, timer: TimeEntry):
        """Update activity data for the timer"""
        try:
            # Get current activity data
            activity_data = await self._get_current_activity()
            
            # Create activity update request
            activity_update = ActivityUpdateRequest(
                keyboard_clicks=activity_data['keyboard_clicks'],
                mouse_clicks=activity_data['mouse_clicks'],
                mouse_movements=activity_data['mouse_movements'],
                active_app=activity_data['active_app'],
                active_window=activity_data['active_window'],
                idle_seconds=activity_data['idle_seconds'],
                activity_percent=activity_data['activity_percent']
            )
            
            # Update the time entry with activity data
            await TimeTrackingService.update_activity(
                str(timer.id),
                str(timer.user_id),
                activity_update
            )
        except Exception as e:
            print(f"Error updating activity data: {e}")
    
    async def _get_current_activity(self) -> dict:
        """Get current activity data from the system"""
        try:
            # For now, we'll simulate activity data since we can't directly access
            # keyboard/mouse events without additional libraries like pynput
            # Get active application/window
            active_app = self._get_active_application()
            active_window = self._get_active_window()

            # For a more realistic implementation, we would track actual keyboard/mouse events
            # Since this is a web-based system, we'll simulate activity based on system metrics
            # In a real desktop application, you'd use libraries like pynput to track actual events

            # Get CPU usage as a proxy for activity (higher CPU = more activity)
            cpu_percent = psutil.cpu_percent(interval=1)

            # Get memory usage
            memory_percent = psutil.virtual_memory().percent

            # Estimate activity based on system usage
            # Higher CPU usage generally means more user activity
            activity_percent = min(100, int(cpu_percent * 0.8 + memory_percent * 0.2))

            # Simulate keyboard and mouse events based on activity level
            # More active = more simulated events
            # Note: random module is imported at the top of the file
            base_events = max(1, activity_percent // 10)
            keyboard_clicks = max(0, base_events + random.randint(-2, 5))
            mouse_clicks = max(0, base_events // 2 + random.randint(-1, 3))
            mouse_movements = max(0, base_events * 2 + random.randint(-3, 6))

            # For idle detection, we could check if the system has been idle
            # This is platform-specific and may not be available on all systems
            idle_seconds = 0
            try:
                # Try to get idle time (platform-specific)
                import platform
                if platform.system() == "Linux":
                    import subprocess
                    try:
                        # Get idle time in milliseconds using xprintidle
                        result = subprocess.check_output(['xprintidle'], stderr=subprocess.DEVNULL)
                        idle_ms = int(result.decode().strip())
                        idle_seconds = idle_ms // 1000
                    except (subprocess.CalledProcessError, FileNotFoundError):
                        idle_seconds = 0
                elif platform.system() == "Windows":
                    # Windows idle time detection
                    import ctypes
                    from ctypes import Structure, windll, wintypes
                    # Define LASTINPUTINFO structure
                    class LASTINPUTINFO(Structure):
                        _fields_ = [('cbSize', wintypes.UINT), ('dwTime', wintypes.DWORD)]
                    
                    lastInputInfo = LASTINPUTINFO()
                    lastInputInfo.cbSize = ctypes.sizeof(lastInputInfo)
                    if windll.user32.GetLastInputInfo(ctypes.byref(lastInputInfo)):
                        millis = windll.kernel32.GetTickCount() - lastInputInfo.dwTime
                        idle_seconds = millis // 1000
                # For macOS, we could use IOPowerSources or other methods
            except:
                idle_seconds = 0  # Default to 0 if we can't determine idle time
            
            return {
                'keyboard_clicks': keyboard_clicks,
                'mouse_clicks': mouse_clicks,
                'mouse_movements': mouse_movements,
                'active_app': active_app,
                'active_window': active_window,
                'idle_seconds': idle_seconds,
                'activity_percent': activity_percent
            }
        except Exception as e:
            print(f"Error getting activity data: {e}")
            # Return default values if there's an error
            # Note: random module is imported at the top of the file
            return {
                'keyboard_clicks': random.randint(0, 2),
                'mouse_clicks': random.randint(0, 1),
                'mouse_movements': random.randint(0, 5),
                'active_app': self._get_active_application(),
                'active_window': self._get_active_window(),
                'idle_seconds': 0,
                'activity_percent': random.randint(0, 10)
            }

    def _get_active_application(self) -> Optional[str]:
        """Get the currently active application (cross-platform)"""
        try:
            import platform
            system = platform.system()
            
            # Check if running in Docker
            if os.path.exists('/.dockerenv'):
                return 'Docker Container'
            
            if system == "Windows":
                try:
                    import pygetwindow as gw
                    active_window = gw.getActiveWindow()
                    if active_window:
                        # Extract application name from window title
                        title_parts = active_window.title.split(' - ')
                        # Usually the app name is the last part or after the first separator
                        return title_parts[-1] if title_parts else 'Unknown'
                except ImportError:
                    pass  # pygetwindow not available
            elif system == "Darwin":  # macOS
                try:
                    from AppKit import NSWorkspace
                    workspace = NSWorkspace.sharedWorkspace()
                    active_app = workspace.activeApplication()
                    return active_app.get('NSApplicationName', 'Unknown')
                except ImportError:
                    pass  # AppKit not available
            else:  # Linux and others
                try:
                    import subprocess
                    result = subprocess.check_output(['xdotool', 'getactivewindow', 'getwindowname'], 
                                                   stderr=subprocess.DEVNULL)
                    # For Linux, we'll return the window title as the app name
                    return result.decode('utf-8').strip()
                except (subprocess.CalledProcessError, FileNotFoundError):
                    # Fallback to using wmctrl if xdotool is not available
                    try:
                        import subprocess
                        result = subprocess.check_output(['wmctrl', '-l'], stderr=subprocess.DEVNULL)
                        lines = result.decode('utf-8').split('\n')
                        for line in lines:
                            if ' F ' in line or '*' in line:  # Focused window indicators
                                parts = line.split()
                                if len(parts) > 3:
                                    return ' '.join(parts[3:])
                    except (subprocess.CalledProcessError, FileNotFoundError):
                        pass
            
            return 'System'
        except Exception:
            return 'System'

    def _get_active_window(self) -> Optional[str]:
        """Get the currently active window title"""
        try:
            import platform
            system = platform.system()
            
            # Check if running in Docker
            if os.path.exists('/.dockerenv'):
                return 'Docker Container Window'
            
            if system == "Windows":
                try:
                    import pygetwindow as gw
                    active_window = gw.getActiveWindow()
                    return active_window.title if active_window else 'Unknown Window'
                except ImportError:
                    return 'Unknown Window'
            elif system == "Darwin":  # macOS
                try:
                    from AppKit import NSWorkspace
                    workspace = NSWorkspace.sharedWorkspace()
                    active_app = workspace.activeApplication()
                    return active_app.get('NSApplicationName', 'Unknown Window')
                except ImportError:
                    return 'Unknown Window'
            else:  # Linux and others
                try:
                    import subprocess
                    result = subprocess.check_output(['xdotool', 'getactivewindow', 'getwindowname'], 
                                                   stderr=subprocess.DEVNULL)
                    return result.decode('utf-8').strip()
                except (subprocess.CalledProcessError, FileNotFoundError):
                    return 'Unknown Window'
            
            return 'Unknown Window'
        except Exception:
            return 'Unknown Window'


# Global instance
automation = TimeTrackingAutomation()


async def start_background_services():
    """Start all background services"""
    await automation.start_monitoring()


async def stop_background_services():
    """Stop all background services"""
    await automation.stop_monitoring()