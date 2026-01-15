"""Tests for WebSocket manager and collaboration."""

import pytest
from services.websocket_manager import ConnectionManager, MessageType, WebSocketMessage, UserPresence


class TestWebSocketMessage:
    """Test WebSocket message creation."""

    def test_message_creation(self):
        """Test creating a WebSocket message."""
        msg = WebSocketMessage(
            type=MessageType.CELL_UPDATE,
            payload={"cell": "A1", "value": "100"},
            user_id="user123",
            model_id="model456",
        )

        assert msg.type == MessageType.CELL_UPDATE
        assert msg.payload["cell"] == "A1"
        assert msg.user_id == "user123"
        assert msg.model_id == "model456"
        assert msg.timestamp  # Should be auto-generated

    def test_message_to_json(self):
        """Test converting message to JSON."""
        msg = WebSocketMessage(
            type=MessageType.PING,
            payload={},
            user_id="user123",
            model_id="model456",
        )

        json_str = msg.to_json()

        assert '"type": "ping"' in json_str
        assert '"user_id": "user123"' in json_str
        assert '"model_id": "model456"' in json_str


class TestUserPresence:
    """Test user presence tracking."""

    def test_presence_creation(self):
        """Test creating user presence."""
        presence = UserPresence(
            user_id="user123",
            user_name="John Doe",
            user_email="john@example.com",
            role="analyst",
        )

        assert presence.user_id == "user123"
        assert presence.user_name == "John Doe"
        assert presence.status == "online"
        assert presence.current_cell is None
        assert presence.connected_at  # Should be auto-generated

    def test_presence_with_cell(self):
        """Test presence with current cell."""
        presence = UserPresence(
            user_id="user123",
            user_name="John Doe",
            user_email="john@example.com",
            role="analyst",
            current_cell="B5",
        )

        assert presence.current_cell == "B5"


class TestConnectionManager:
    """Test connection manager functionality."""

    def test_manager_initialization(self):
        """Test manager initializes correctly."""
        manager = ConnectionManager()

        assert manager.connections == {}
        assert manager.presence == {}
        assert manager.cell_locks == {}

    def test_cell_lock_acquire(self):
        """Test acquiring a cell lock."""
        manager = ConnectionManager()

        # First user can acquire lock
        result = manager.try_lock_cell("model1", "A1", "user1")
        assert result is True

        # Same user can re-acquire (idempotent)
        result = manager.try_lock_cell("model1", "A1", "user1")
        assert result is True

        # Different user cannot acquire same cell
        result = manager.try_lock_cell("model1", "A1", "user2")
        assert result is False

        # Different cell can be acquired
        result = manager.try_lock_cell("model1", "B2", "user2")
        assert result is True

    def test_cell_lock_release(self):
        """Test releasing a cell lock."""
        manager = ConnectionManager()

        # Acquire lock
        manager.try_lock_cell("model1", "A1", "user1")

        # Owner can release
        result = manager.unlock_cell("model1", "A1", "user1")
        assert result is True

        # Now another user can acquire
        result = manager.try_lock_cell("model1", "A1", "user2")
        assert result is True

    def test_cell_lock_wrong_user_release(self):
        """Test that wrong user cannot release lock."""
        manager = ConnectionManager()

        manager.try_lock_cell("model1", "A1", "user1")

        # Wrong user cannot release
        result = manager.unlock_cell("model1", "A1", "user2")
        assert result is False

        # Lock still held
        result = manager.try_lock_cell("model1", "A1", "user2")
        assert result is False

    def test_get_cell_locks(self):
        """Test getting all cell locks."""
        manager = ConnectionManager()

        manager.try_lock_cell("model1", "A1", "user1")
        manager.try_lock_cell("model1", "B2", "user2")
        manager.try_lock_cell("model1", "C3", "user1")

        locks = manager.get_cell_locks("model1")

        assert len(locks) == 3
        assert locks["A1"] == "user1"
        assert locks["B2"] == "user2"
        assert locks["C3"] == "user1"

    def test_get_cell_locks_empty_model(self):
        """Test getting locks for model with no locks."""
        manager = ConnectionManager()

        locks = manager.get_cell_locks("nonexistent")
        assert locks == {}

    def test_get_user_count(self):
        """Test getting user count for a model."""
        manager = ConnectionManager()

        # No users initially
        assert manager.get_user_count("model1") == 0

        # After initializing (would happen on connect)
        manager.connections["model1"] = {"user1": None, "user2": None}
        assert manager.get_user_count("model1") == 2


class TestMessageTypes:
    """Test message type enumeration."""

    def test_message_types_exist(self):
        """Test all expected message types exist."""
        assert MessageType.JOIN.value == "join"
        assert MessageType.LEAVE.value == "leave"
        assert MessageType.PRESENCE.value == "presence"
        assert MessageType.CURSOR.value == "cursor"
        assert MessageType.CELL_UPDATE.value == "cell_update"
        assert MessageType.CELL_LOCK.value == "cell_lock"
        assert MessageType.CELL_UNLOCK.value == "cell_unlock"
        assert MessageType.COMMENT_ADD.value == "comment_add"
        assert MessageType.ERROR.value == "error"
        assert MessageType.PING.value == "ping"
        assert MessageType.PONG.value == "pong"
