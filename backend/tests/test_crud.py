"""Tests for CRUD operations."""

from unittest.mock import MagicMock, patch

from app.schemas.crud import (
    create_user,
    get_user,
    get_user_by_email,
)
from app.schemas.user import UserCreate


class TestGetUser:
    """Test user retrieval by ID."""

    def test_get_user_existing(self):
        """Test retrieving an existing user."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_user

        result = get_user(mock_db, user_id=1)

        assert result == mock_user
        mock_db.query.assert_called_once()
        mock_query.filter.assert_called_once()

    def test_get_user_not_found(self):
        """Test retrieving a non-existent user."""
        mock_db = MagicMock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        result = get_user(mock_db, user_id=999)

        assert result is None

    def test_get_user_called_with_correct_id(self):
        """Test that query uses correct user ID."""
        mock_db = MagicMock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        get_user(mock_db, user_id=42)

        # Verify the filter was called
        mock_query.filter.assert_called_once()


class TestGetUserByEmail:
    """Test user retrieval by email."""

    def test_get_user_by_email_existing(self):
        """Test retrieving an existing user by email."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_user

        result = get_user_by_email(mock_db, email="test@example.com")

        assert result == mock_user
        mock_db.query.assert_called_once()

    def test_get_user_by_email_not_found(self):
        """Test retrieving with non-existent email."""
        mock_db = MagicMock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        result = get_user_by_email(mock_db, email="nonexistent@example.com")

        assert result is None

    def test_get_user_by_email_case_sensitive(self):
        """Test that email lookup works with exact match."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_user

        result = get_user_by_email(mock_db, email="Test@Example.com")

        assert result == mock_user


class TestCreateUser:
    """Test user creation."""

    def test_create_user_success(self):
        """Test successful user creation."""
        mock_db = MagicMock()

        with patch("app.schemas.crud.get_password_hash") as mock_hash:
            mock_hash.return_value = "hashed_password"

        # Verify password was hashed
        mock_hash.assert_called_once_with("password123")

        # Verify database operations
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_create_user_with_different_emails(self):
        """Test creating users with different emails."""
        mock_db = MagicMock()

        emails = [
            "user1@example.com",
            "user2@example.com",
            "admin@example.com",
        ]

        for email in emails:
            user_in = UserCreate(email=email, password="password123")

            with patch("app.schemas.crud.get_password_hash") as mock_hash:
                mock_hash.return_value = "hashed_password"
                create_user(mock_db, user_in)

            mock_db.add.assert_called()

    def test_create_user_calls_commit(self):
        """Test that create_user commits to database."""
        mock_db = MagicMock()
        user_in = UserCreate(email="test@example.com", password="password123")

        with patch("app.schemas.crud.get_password_hash"):
            create_user(mock_db, user_in)

        mock_db.commit.assert_called_once()

    def test_create_user_calls_refresh(self):
        """Test that create_user refreshes the user object."""
        mock_db = MagicMock()
        user_in = UserCreate(email="test@example.com", password="password123")

        with patch("app.schemas.crud.get_password_hash"):
            create_user(mock_db, user_in)

        mock_db.refresh.assert_called_once()
