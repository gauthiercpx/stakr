"""Tests for API dependencies."""

import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from app.api.deps import get_current_user


class TestGetCurrentUser:
    """Test current user dependency."""

    def test_get_current_user_valid_token(self):
        """Test getting current user with valid JWT token."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.email = "user@example.com"

        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_user

        with patch("app.api.deps.jwt.decode") as mock_decode:
            mock_decode.return_value = {"sub": "user@example.com"}

            result = get_current_user(
                db=mock_db,
                token="valid.jwt.token"
            )

        assert result == mock_user
        mock_decode.assert_called_once()

    def test_get_current_user_invalid_token_missing_sub(self):
        """Test with valid JWT but missing 'sub' claim."""
        mock_db = MagicMock()

        with patch("app.api.deps.jwt.decode") as mock_decode:
            mock_decode.return_value = {"exp": 12345}  # Missing 'sub'

            with pytest.raises(HTTPException) as exc_info:
                get_current_user(
                    db=mock_db,
                    token="valid.jwt.token"
                )

        assert exc_info.value.status_code == 401

    def test_get_current_user_invalid_token_format(self):
        """Test with invalid JWT format."""
        mock_db = MagicMock()

        with patch("app.api.deps.jwt.decode") as mock_decode:
            from jose import JWTError
            mock_decode.side_effect = JWTError()

            with pytest.raises(HTTPException) as exc_info:
                get_current_user(
                    db=mock_db,
                    token="invalid.token"
                )

        assert exc_info.value.status_code == 401

    def test_get_current_user_user_not_found(self):
        """Test when user with token email doesn't exist in DB."""
        mock_db = MagicMock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        with patch("app.api.deps.jwt.decode") as mock_decode:
            mock_decode.return_value = {"sub": "nonexistent@example.com"}

            with pytest.raises(HTTPException) as exc_info:
                get_current_user(
                    db=mock_db,
                    token="valid.jwt.token"
                )

        assert exc_info.value.status_code == 401

    def test_get_current_user_exception_headers(self):
        """Test that credentials exception includes WWW-Authenticate header."""
        mock_db = MagicMock()

        with patch("app.api.deps.jwt.decode") as mock_decode:
            from jose import JWTError
            mock_decode.side_effect = JWTError()

            with pytest.raises(HTTPException) as exc_info:
                get_current_user(
                    db=mock_db,
                    token="invalid"
                )

        assert "WWW-Authenticate" in exc_info.value.headers

    def test_get_current_user_valid_but_none_email(self):
        """Test with token where sub claim exists but user not found."""
        mock_db = MagicMock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        with patch("app.api.deps.jwt.decode") as mock_decode:
            mock_decode.return_value = {"sub": "nonexistent@example.com"}

            with pytest.raises(HTTPException) as exc_info:
                get_current_user(
                    db=mock_db,
                    token="valid.jwt.token"
                )

        assert exc_info.value.status_code == 401
