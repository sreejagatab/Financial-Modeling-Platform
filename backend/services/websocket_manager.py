"""WebSocket connection manager for real-time collaboration."""

import json
from datetime import datetime, timezone
from typing import Dict, Set, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

from fastapi import WebSocket


class MessageType(str, Enum):
    """Types of WebSocket messages."""

    # Presence
    JOIN = "join"
    LEAVE = "leave"
    PRESENCE = "presence"
    CURSOR = "cursor"

    # Cell operations
    CELL_UPDATE = "cell_update"
    CELL_LOCK = "cell_lock"
    CELL_UNLOCK = "cell_unlock"

    # Comments
    COMMENT_ADD = "comment_add"
    COMMENT_UPDATE = "comment_update"
    COMMENT_DELETE = "comment_delete"

    # Model operations
    CALCULATION_START = "calculation_start"
    CALCULATION_COMPLETE = "calculation_complete"
    MODEL_SAVED = "model_saved"

    # System
    ERROR = "error"
    PING = "ping"
    PONG = "pong"


@dataclass
class UserPresence:
    """User presence information."""

    user_id: str
    user_name: str
    user_email: str
    role: str
    status: str = "online"
    current_cell: Optional[str] = None
    cursor_position: Optional[dict] = None
    connected_at: str = ""
    last_activity: str = ""

    def __post_init__(self):
        now = datetime.now(timezone.utc).isoformat()
        if not self.connected_at:
            self.connected_at = now
        if not self.last_activity:
            self.last_activity = now


@dataclass
class WebSocketMessage:
    """Standard WebSocket message format."""

    type: MessageType
    payload: dict
    user_id: str
    model_id: str
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_json(self) -> str:
        """Convert to JSON string."""
        return json.dumps({
            "type": self.type.value if isinstance(self.type, MessageType) else self.type,
            "payload": self.payload,
            "user_id": self.user_id,
            "model_id": self.model_id,
            "timestamp": self.timestamp,
        })


class ConnectionManager:
    """Manages WebSocket connections for real-time collaboration."""

    def __init__(self):
        # model_id -> {user_id -> WebSocket}
        self.connections: Dict[str, Dict[str, WebSocket]] = {}
        # model_id -> {user_id -> UserPresence}
        self.presence: Dict[str, Dict[str, UserPresence]] = {}
        # model_id -> {cell_address -> user_id} (cell locks)
        self.cell_locks: Dict[str, Dict[str, str]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        model_id: str,
        user_id: str,
        user_name: str,
        user_email: str,
        role: str,
    ) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()

        # Initialize model room if needed
        if model_id not in self.connections:
            self.connections[model_id] = {}
            self.presence[model_id] = {}
            self.cell_locks[model_id] = {}

        # Store connection
        self.connections[model_id][user_id] = websocket

        # Create presence info
        presence = UserPresence(
            user_id=user_id,
            user_name=user_name,
            user_email=user_email,
            role=role,
        )
        self.presence[model_id][user_id] = presence

        # Broadcast join to others
        await self.broadcast_to_model(
            model_id=model_id,
            message=WebSocketMessage(
                type=MessageType.JOIN,
                payload=asdict(presence),
                user_id=user_id,
                model_id=model_id,
            ),
            exclude_user=user_id,
        )

        # Send current presence list to new user
        await self.send_presence_list(websocket, model_id)

    async def disconnect(self, model_id: str, user_id: str) -> None:
        """Handle WebSocket disconnection."""
        if model_id in self.connections:
            # Remove connection
            self.connections[model_id].pop(user_id, None)

            # Remove presence
            presence = self.presence[model_id].pop(user_id, None)

            # Release any cell locks held by this user
            if model_id in self.cell_locks:
                cells_to_unlock = [
                    cell for cell, uid in self.cell_locks[model_id].items()
                    if uid == user_id
                ]
                for cell in cells_to_unlock:
                    del self.cell_locks[model_id][cell]
                    await self.broadcast_to_model(
                        model_id=model_id,
                        message=WebSocketMessage(
                            type=MessageType.CELL_UNLOCK,
                            payload={"cell": cell},
                            user_id=user_id,
                            model_id=model_id,
                        ),
                    )

            # Broadcast leave to others
            if presence:
                await self.broadcast_to_model(
                    model_id=model_id,
                    message=WebSocketMessage(
                        type=MessageType.LEAVE,
                        payload={"user_id": user_id, "user_name": presence.user_name},
                        user_id=user_id,
                        model_id=model_id,
                    ),
                )

            # Clean up empty rooms
            if not self.connections[model_id]:
                del self.connections[model_id]
                del self.presence[model_id]
                if model_id in self.cell_locks:
                    del self.cell_locks[model_id]

    async def send_personal(self, websocket: WebSocket, message: WebSocketMessage) -> None:
        """Send a message to a specific WebSocket."""
        try:
            await websocket.send_text(message.to_json())
        except Exception:
            pass  # Connection may be closed

    async def send_to_user(
        self,
        model_id: str,
        user_id: str,
        message: WebSocketMessage,
    ) -> None:
        """Send a message to a specific user in a model room."""
        if model_id in self.connections and user_id in self.connections[model_id]:
            await self.send_personal(self.connections[model_id][user_id], message)

    async def broadcast_to_model(
        self,
        model_id: str,
        message: WebSocketMessage,
        exclude_user: Optional[str] = None,
    ) -> None:
        """Broadcast a message to all users in a model room."""
        if model_id not in self.connections:
            return

        for user_id, websocket in self.connections[model_id].items():
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_personal(websocket, message)

    async def send_presence_list(self, websocket: WebSocket, model_id: str) -> None:
        """Send the current presence list to a user."""
        if model_id not in self.presence:
            return

        presence_list = [asdict(p) for p in self.presence[model_id].values()]
        message = WebSocketMessage(
            type=MessageType.PRESENCE,
            payload={"users": presence_list},
            user_id="system",
            model_id=model_id,
        )
        await self.send_personal(websocket, message)

    def update_presence(
        self,
        model_id: str,
        user_id: str,
        current_cell: Optional[str] = None,
        cursor_position: Optional[dict] = None,
    ) -> Optional[UserPresence]:
        """Update user presence information."""
        if model_id not in self.presence or user_id not in self.presence[model_id]:
            return None

        presence = self.presence[model_id][user_id]
        presence.last_activity = datetime.now(timezone.utc).isoformat()

        if current_cell is not None:
            presence.current_cell = current_cell
        if cursor_position is not None:
            presence.cursor_position = cursor_position

        return presence

    def try_lock_cell(self, model_id: str, cell: str, user_id: str) -> bool:
        """Try to acquire a lock on a cell. Returns True if successful."""
        if model_id not in self.cell_locks:
            self.cell_locks[model_id] = {}

        # Check if cell is already locked by another user
        if cell in self.cell_locks[model_id]:
            if self.cell_locks[model_id][cell] != user_id:
                return False

        self.cell_locks[model_id][cell] = user_id
        return True

    def unlock_cell(self, model_id: str, cell: str, user_id: str) -> bool:
        """Release a lock on a cell. Returns True if successful."""
        if model_id not in self.cell_locks:
            return False

        if cell in self.cell_locks[model_id]:
            if self.cell_locks[model_id][cell] == user_id:
                del self.cell_locks[model_id][cell]
                return True

        return False

    def get_cell_locks(self, model_id: str) -> Dict[str, str]:
        """Get all cell locks for a model."""
        return self.cell_locks.get(model_id, {})

    def get_active_users(self, model_id: str) -> list:
        """Get list of active users in a model room."""
        if model_id not in self.presence:
            return []
        return [asdict(p) for p in self.presence[model_id].values()]

    def get_user_count(self, model_id: str) -> int:
        """Get the number of users connected to a model."""
        if model_id not in self.connections:
            return 0
        return len(self.connections[model_id])


# Global connection manager instance
manager = ConnectionManager()
