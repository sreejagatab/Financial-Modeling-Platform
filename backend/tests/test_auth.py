"""Tests for authentication service."""

import pytest
from services.auth_service import AuthService


class TestPasswordHashing:
    """Test password hashing utilities."""

    def test_hash_password(self):
        """Test that password hashing works."""
        password = "securePassword123"
        hashed = AuthService.hash_password(password)

        assert hashed != password
        assert len(hashed) > 0

    def test_verify_password_correct(self):
        """Test that correct password verification works."""
        password = "securePassword123"
        hashed = AuthService.hash_password(password)

        assert AuthService.verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test that incorrect password verification fails."""
        password = "securePassword123"
        wrong_password = "wrongPassword456"
        hashed = AuthService.hash_password(password)

        assert AuthService.verify_password(wrong_password, hashed) is False

    def test_different_hashes_for_same_password(self):
        """Test that same password produces different hashes (due to salt)."""
        password = "securePassword123"
        hash1 = AuthService.hash_password(password)
        hash2 = AuthService.hash_password(password)

        assert hash1 != hash2  # Different salts
        assert AuthService.verify_password(password, hash1) is True
        assert AuthService.verify_password(password, hash2) is True


class TestJWTTokens:
    """Test JWT token creation and validation."""

    def test_create_access_token(self):
        """Test access token creation."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = AuthService.create_access_token(data)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_valid_token(self):
        """Test decoding a valid token."""
        data = {"sub": "user123", "email": "test@example.com"}
        token = AuthService.create_access_token(data)

        decoded = AuthService.decode_token(token)

        assert decoded is not None
        assert decoded["sub"] == "user123"
        assert decoded["email"] == "test@example.com"
        assert decoded["type"] == "access"

    def test_decode_invalid_token(self):
        """Test that invalid token returns None."""
        invalid_token = "invalid.token.here"
        decoded = AuthService.decode_token(invalid_token)

        assert decoded is None

    def test_create_refresh_token(self):
        """Test refresh token creation."""
        user_id = "user123"
        token, expires_at = AuthService.create_refresh_token(user_id)

        assert isinstance(token, str)
        assert len(token) > 0
        assert expires_at is not None

        # Verify the token
        decoded = AuthService.decode_token(token)
        assert decoded is not None
        assert decoded["sub"] == user_id
        assert decoded["type"] == "refresh"
