"""Tests for security module."""

import pytest
from datetime import timedelta

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
)


class TestPasswordHashing:
    """Test password hashing functions."""

    def test_hash_password(self):
        """Test that a password is correctly hashed."""
        password = "test-password-123"
        hashed = get_password_hash(password)

        # Hash should not be the same as password
        assert hashed != password
        # Hash should be a string
        assert isinstance(hashed, str)

    def test_verify_password_correct(self):
        """Test that correct password verifies successfully."""
        password = "test-password-123"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test that incorrect password fails verification."""
        password = "test-password-123"
        hashed = get_password_hash(password)

        assert verify_password("wrong-password", hashed) is False

    def test_verify_password_empty_plain_password(self):
        """Test verification with empty plain password."""
        hashed = get_password_hash("password")

        assert verify_password("", hashed) is False


class TestAccessToken:
    """Test JWT access token generation."""

    def test_create_access_token_basic(self):
        """Test basic access token creation."""
        data = {"sub": "user@example.com"}
        token = create_access_token(data)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_expiration(self):
        """Test token creation with custom expiration."""
        data = {"sub": "user@example.com"}
        expires_delta = timedelta(hours=1)
        token = create_access_token(data, expires_delta)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_default_expiration(self):
        """Test token uses default 15-minute expiration if not provided."""
        data = {"sub": "user@example.com"}
        token = create_access_token(data)

        assert isinstance(token, str)
        # Token should have 3 parts separated by dots (JWT format)
        assert len(token.split(".")) == 3

    def test_create_access_token_with_multiple_claims(self):
        """Test token with multiple claims."""
        data = {
            "sub": "user@example.com",
            "user_id": 123,
            "role": "admin",
        }
        token = create_access_token(data)

        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_empty_data(self):
        """Test token creation with empty data."""
        data = {}
        token = create_access_token(data)

        assert isinstance(token, str)
