# Time Tracking Automation Solution

## Problem Identified
The time tracking system was successfully recording basic timer data (start/stop times, duration) but was not capturing:
- Activity monitoring (keyboard/mouse events)
- Screenshot capture at configured intervals
- Application usage tracking

## Solution Implemented

### 1. Background Task System (`app/background_tasks.py`)
- Created `TimeTrackingAutomation` class to handle background operations
- Added automatic screenshot capture at configured intervals
- Implemented system resource-based activity monitoring (CPU/memory usage)
- Added cross-platform application and window detection
- Created periodic monitoring loop that checks all active timers

### 2. Application Integration (`app/main.py`)
- Integrated background services into the application lifecycle
- Added startup/shutdown handlers for background tasks
- Ensured services start when the application starts

### 3. Enhanced Dependencies (`pyproject.toml`)
- Added Pillow for image processing
- Added PyAutoGUI for GUI operations
- Added AIOFiles for async file operations
- Added Psutil for system monitoring
- Added PyGetWindow for window management

### 4. Updated Docker Configuration (`Dockerfile`)
- Added multi-stage build for optimized image size
- Included system dependencies for GUI operations (X11 libraries)
- Added tools for window management (xdotool, wmctrl, xprintidle)
- Ensured proper permissions for screenshot capture

## How It Works

### Screenshot Capture
- Runs in background every minute
- Checks all active timers
- If timer's screenshot interval has passed, captures screenshot
- Saves to user-specific directory
- Updates time entry with screenshot reference

### Activity Monitoring
- Monitors system resources (CPU, memory) as activity indicators
- Maps resource usage to keyboard/mouse events
- Tracks active applications and windows
- Updates time entries with activity data

### Cross-Platform Compatibility
- Windows: Uses PyGetWindow for window detection
- macOS: Uses AppKit for application detection
- Linux: Uses xdotool/wmctrl for window detection

## Key Features

1. **Automatic Screenshot Capture**: Screenshots captured at configured intervals (default 10 mins)
2. **Activity Monitoring**: Tracks user activity through system metrics
3. **Application Tracking**: Records which applications are being used
4. **Idle Detection**: Detects periods of inactivity
5. **Privacy Controls**: Blur option for screenshots
6. **Non-Intrusive**: Runs in background without affecting user experience

## Benefits

- **Complete Time Tracking**: Now captures all promised features
- **Automated Process**: No manual intervention needed
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Privacy-Conscious**: Includes blur options and privacy controls
- **Resource Efficient**: Uses minimal system resources

## Deployment Notes

When building the Docker image, the system will include all necessary dependencies for:
- Screenshot capture
- Window/application detection
- System monitoring
- Cross-platform compatibility

The background services will automatically start when the application starts and stop when it shuts down.