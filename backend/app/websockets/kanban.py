"""
WebSocket ConnectionManager for Kanban real-time updates
Handles connections, room management, and task update broadcasting
"""

from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect, HTTPException, status
from jose import jwt, JWTError
import json
import logging

from app.core.config import settings
from app.services.auth_service import AuthService # Not directly used but might be needed elsewhere for context
from app.models.user import User # Needed for get_user_id_from_websocket_token
from app.core.security import decode_token # Needed for get_user_id_from_websocket_token


# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
# Basic console handler for debugging
handler = logging.StreamHandler()
formatter = logging.Formatter('%(levelname)s: %(asctime)s - %(message)s')
handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(handler)


class ConnectionManager:
    """
    Manages WebSocket connections for Kanban board real-time updates
    Organizes connections into project rooms for targeted broadcasting
    """

    def __init__(self):
        # Map of project_id -> set of WebSocket connections
        self.project_rooms: Dict[str, Set[WebSocket]] = {}
        # Map of WebSocket -> (user_id, project_id) for tracking
        self.connection_metadata: Dict[WebSocket, tuple[str, str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str, project_id: str):
        """
        Accept WebSocket connection and add to project room

        Args:
            websocket: WebSocket connection instance
            user_id: Authenticated user ID
            project_id: Project room to join
        """
        await websocket.accept()
        logger.info(f"Accepted WebSocket connection for user {user_id} in project {project_id}.")

        # Create project room if it doesn't exist
        if project_id not in self.project_rooms:
            self.project_rooms[project_id] = set()

        # Add connection to project room
        self.project_rooms[project_id].add(websocket)

        # Store metadata for this connection
        self.connection_metadata[websocket] = (user_id, project_id)

        # Send welcome message
        await websocket.send_json({
            "type": "connection_established",
            "project_id": project_id,
            "message": f"Connected to project {project_id} Kanban board"
        })
        logger.info(f"Sent 'connection_established' to user {user_id} for project {project_id}.")


    def disconnect(self, websocket: WebSocket):
        """
        Remove WebSocket connection from all rooms

        Args:
            websocket: WebSocket connection to remove
        """
        if websocket not in self.connection_metadata:
            logger.warning("Attempted to disconnect a WebSocket not in metadata.")
            return

        user_id, project_id = self.connection_metadata[websocket]
        logger.info(f"Disconnecting WebSocket for user {user_id} from project {project_id}.")

        # Remove from project room
        if project_id in self.project_rooms:
            self.project_rooms[project_id].discard(websocket)

            # Clean up empty rooms
            if not self.project_rooms[project_id]:
                logger.info(f"Project room {project_id} is now empty. Deleting room.")
                del self.project_rooms[project_id]

        # Remove metadata
        del self.connection_metadata[websocket]
        logger.info(f"Disconnected and cleaned up WebSocket for user {user_id} from project {project_id}.")


    async def broadcast_task_update(
        self,
        project_id: str,
        task_id: str,
        new_status: str,
        updated_by: str,
        exclude_connection: WebSocket = None
    ):
        """
        Broadcast task status update to all connections in project room

        Args:
            project_id: Project room to broadcast to
            task_id: Updated task ID
            new_status: New task status
            updated_by: User ID who made the update
            exclude_connection: Optional connection to exclude (e.g., the sender)
        """
        if project_id not in self.project_rooms:
            logger.warning(f"Attempted to broadcast to non-existent room {project_id}.")
            return

        message = {
            "type": "task_update",
            "project_id": project_id,
            "task_id": task_id,
            "new_status": new_status,
            "updated_by": updated_by,
            "timestamp": None  # Will be set by receiver's local time
        }
        logger.info(f"Broadcasting task update for project {project_id}: Task {task_id} to {new_status} by {updated_by}.")

        # Broadcast to all connections in project room
        disconnected = []
        for connection in list(self.project_rooms[project_id]): # Use list to avoid issues during set modification
            # Skip the connection that made the change (optional)
            if exclude_connection and connection == exclude_connection:
                continue

            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send broadcast to a WebSocket connection for user {self.connection_metadata.get(connection, ('unknown',))[0]} in project {project_id}: {e}")
                disconnected.append(connection)

        # Clean up dead connections
        for connection in disconnected:
            self.disconnect(connection)


    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """
        Send message to specific WebSocket connection

        Args:
            websocket: Target connection
            message: Message dict to send
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Failed to send personal message to a WebSocket connection: {e}")
            self.disconnect(websocket)


# Global connection manager instance
manager = ConnectionManager()


# Local function to extract and validate user ID from raw JWT token for WebSocket
async def get_user_id_from_websocket_token(token: str) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)

        if payload is None:
            logger.warning("Token decoding returned None payload.")
            raise credentials_exception

        if payload.get("type") != "access":
            logger.warning(f"Invalid token type: {payload.get('type')}")
            raise credentials_exception

        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token payload 'sub' (user_id) is missing.")
            raise credentials_exception
        return user_id
    except JWTError as e:
        logger.error(f"JWT validation failed: {e}")
        raise credentials_exception
    except Exception as e:
        logger.exception(f"Unexpected error during token validation: {e}")
        raise credentials_exception


async def websocket_endpoint(websocket: WebSocket, project_id: str, token: str):
    """
    WebSocket endpoint handler for Kanban real-time updates
    """
    logger.info(f"Attempting WebSocket connection for project {project_id} with token starting: {token[:10]}...")
    user_id = None # Initialize user_id to None
    try:
        user_id = await get_user_id_from_websocket_token(token)
        logger.info(f"User {user_id} authenticated for WebSocket project {project_id}.")

        await manager.connect(websocket, user_id, project_id)
        logger.info(f"WebSocket connected: User {user_id} joined project {project_id} room.")

        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            logger.info(f"Received WebSocket message from user {user_id} in project {project_id}: {data}")

            try:
                message = json.loads(data)
                message_type = message.get("type")

                if message_type == "ping":
                    await websocket.send_json({"type": "pong"})
                    logger.debug(f"Sent pong to user {user_id} in project {project_id}.")
                elif message_type == "task_update":
                    task_id = message.get("task_id")
                    new_status = message.get("new_status")
                    if task_id and new_status:
                        # Call TaskService to update the DB
                        from app.services.task_service import TaskService
                        from app.models.task import Task, TaskStatus
                        from app.schemas.task import TaskUpdate
                        from app.models.user import User, UserRole
                        logger.info(f"Updating task {task_id} status to {new_status} in DB.")

                        # Create a TaskUpdate object with the new status
                        task_update = TaskUpdate(status=TaskStatus(new_status))

                        # Get the user's role for permission checking
                        user = await User.get(user_id)
                        if not user:
                            logger.error(f"User {user_id} not found for task update")
                            continue

                        # Update the task
                        await TaskService.update_task(
                            task_id=task_id,
                            task_data=task_update,
                            user_id=user_id,
                            user_role=user.role
                        )
                        # Broadcast the update to other clients in the project room
                        await manager.broadcast_task_update(
                            project_id=project_id,
                            task_id=task_id,
                            new_status=new_status,
                            updated_by=user_id,
                            exclude_connection=websocket # Exclude sender from broadcast
                        )
                        logger.info(f"Task {task_id} status updated to {new_status} and broadcasted.")
                    else:
                        logger.warning(f"Invalid task_update message received: {message}")
                else:
                    logger.warning(f"Unhandled WebSocket message type: {message_type}")

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON message received from user {user_id} in project {project_id}: {data}")
                await manager.send_personal_message(websocket, {
                    "type": "error",
                    "message": "Invalid JSON message"
                })
            except Exception as e:
                logger.exception(f"Error processing WebSocket message from user {user_id} in project {project_id}: {e}")

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected from user {user_id if user_id else 'unauthenticated'} in project {project_id}.")
        manager.disconnect(websocket)
    except HTTPException as e:
        logger.error(f"WebSocket authentication failed for project {project_id}. Detail: {e.detail}, Status: {e.status_code}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    except JWTError as e:
        logger.error(f"JWT validation failed for WebSocket project {project_id}. Error: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    except Exception as e:
        logger.exception(f"Unhandled exception during WebSocket connection for project {project_id}: {e}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)