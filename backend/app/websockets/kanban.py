"""
WebSocket ConnectionManager for Kanban real-time updates
Handles connections, room management, and task update broadcasting
"""

from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from jose import jwt, JWTError
import json

from app.core.config import settings
from app.services.auth_service import AuthService


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

    def disconnect(self, websocket: WebSocket):
        """
        Remove WebSocket connection from all rooms

        Args:
            websocket: WebSocket connection to remove
        """
        if websocket not in self.connection_metadata:
            return

        user_id, project_id = self.connection_metadata[websocket]

        # Remove from project room
        if project_id in self.project_rooms:
            self.project_rooms[project_id].discard(websocket)

            # Clean up empty rooms
            if not self.project_rooms[project_id]:
                del self.project_rooms[project_id]

        # Remove metadata
        del self.connection_metadata[websocket]

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
            return

        message = {
            "type": "task_update",
            "project_id": project_id,
            "task_id": task_id,
            "new_status": new_status,
            "updated_by": updated_by,
            "timestamp": None  # Will be set by receiver's local time
        }

        # Broadcast to all connections in project room
        disconnected = []
        for connection in self.project_rooms[project_id]:
            # Skip the connection that made the change (optional)
            if exclude_connection and connection == exclude_connection:
                continue

            try:
                await connection.send_json(message)
            except Exception:
                # Connection is dead, mark for removal
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
        except Exception:
            self.disconnect(websocket)


# Global connection manager instance
manager = ConnectionManager()


async def get_current_user_from_token(token: str) -> str:
    """
    Extract and validate user from JWT token for WebSocket authentication

    Args:
        token: JWT token string

    Returns:
        user_id: Authenticated user ID

    Raises:
        HTTPException: If token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception


async def websocket_endpoint(websocket: WebSocket, project_id: str, token: str):
    """
    WebSocket endpoint handler for Kanban real-time updates

    Args:
        websocket: WebSocket connection
        project_id: Project ID to join
        token: JWT authentication token
    """
    try:
        # Authenticate user from token
        user_id = await get_current_user_from_token(token)

        # Connect to project room
        await manager.connect(websocket, user_id, project_id)

        # Keep connection alive and handle incoming messages
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()

                # Parse message
                try:
                    message = json.loads(data)
                    message_type = message.get("type")

                    # Handle ping/pong for keep-alive
                    if message_type == "ping":
                        await websocket.send_json({"type": "pong"})

                    # Other message types can be handled here

                except json.JSONDecodeError:
                    await manager.send_personal_message(websocket, {
                        "type": "error",
                        "message": "Invalid JSON message"
                    })

        except WebSocketDisconnect:
            manager.disconnect(websocket)

    except HTTPException:
        # Authentication failed
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
