"""Tests for authentication routes."""

from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app import app
from app.core.database import get_db

client = TestClient(app)


def override_get_db():
    """Override get_db dependency for tests."""
    db = MagicMock()
    try:
        yield db
    finally:
        pass


class TestRegister:
    """Test user registration endpoint."""

    def test_register_email_already_in_use(self):
        """Test registration with email already in use."""
        app.dependency_overrides[get_db] = override_get_db

        with patch("app.routers.auth.crud_user.get_user_by_email") as mock_get:
            mock_get.return_value = MagicMock()  # Email already exists

            response = client.post(
                "/auth/register",
                json={
                    "email": "existing@example.com",
                    "password": "password123",
                    "first_name": "Existing",
                    "last_name": "User",
                },
            )

        app.dependency_overrides.clear()
        assert response.status_code == 400
        assert "Email already in use" in response.json()["detail"]

    def test_register_with_invalid_email(self):
        """Test registration with invalid email format."""
        app.dependency_overrides[get_db] = override_get_db

        response = client.post(
            "/auth/register",
            json={
                "email": "not-an-email",
                "password": "password123",
                "first_name": "Test",
                "last_name": "User",
            },
        )

        app.dependency_overrides.clear()
        # Pydantic validation should reject this
        assert response.status_code == 422


class TestLogin:
    """Test login/token endpoint."""

    def test_login_success(self):
        """Test successful login."""
        app.dependency_overrides[get_db] = override_get_db

        with patch("app.routers.auth.crud_user.get_user_by_email") as mock_get:
            with patch("app.core.security.verify_password") as mock_verify:
                with patch("app.core.security.create_access_token") as mock_token:
                    mock_user = MagicMock()
                    mock_user.id = 1
                    mock_user.email = "user@example.com"
                    mock_user.is_active = True
                    mock_user.hashed_password = "hashed"

                    mock_get.return_value = mock_user
                    mock_verify.return_value = True
                    mock_token.return_value = "test.jwt.token"

                    response = client.post(
                        "/auth/token",
                        data={
                            "username": "user@example.com",
                            "password": "password123",
                        },
                    )

        app.dependency_overrides.clear()
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_login_user_not_found(self):
        """Test login with non-existent user."""
        app.dependency_overrides[get_db] = override_get_db

        with patch("app.routers.auth.crud_user.get_user_by_email") as mock_get:
            mock_get.return_value = None

            response = client.post(
                "/auth/token",
                data={"username": "nonexistent@example.com", "password": "password123"},
            )

        app.dependency_overrides.clear()
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_wrong_password(self):
        """Test login with wrong password."""
        app.dependency_overrides[get_db] = override_get_db

        with patch("app.routers.auth.crud_user.get_user_by_email") as mock_get:
            with patch("app.core.security.verify_password") as mock_verify:
                mock_user = MagicMock()
                mock_user.hashed_password = "hashed"
                mock_get.return_value = mock_user
                mock_verify.return_value = False

                response = client.post(
                    "/auth/token",
                    data={"username": "user@example.com", "password": "wrongpassword"},
                )

        app.dependency_overrides.clear()
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_inactive_user(self):
        """Test login returns 401 for inactive user."""
        app.dependency_overrides[get_db] = override_get_db

        with patch("app.routers.auth.crud_user.get_user_by_email") as mock_get:
            with patch("app.core.security.verify_password") as mock_verify:
                mock_user = MagicMock()
                mock_user.is_active = False
                mock_user.hashed_password = "hashed"
                mock_get.return_value = mock_user
                mock_verify.return_value = False

                response = client.post(
                    "/auth/token",
                    data={
                        "username": "inactive@example.com",
                        "password": "password123",
                    },
                )

        app.dependency_overrides.clear()
        assert response.status_code == 401

    def test_login_returns_jwt_token(self):
        """Test that login returns a valid JWT token structure."""
        app.dependency_overrides[get_db] = override_get_db

        with patch("app.routers.auth.crud_user.get_user_by_email") as mock_get:
            with patch("app.core.security.verify_password") as mock_verify:
                with patch("app.core.security.create_access_token") as mock_token:
                    mock_user = MagicMock()
                    mock_user.id = 1
                    mock_user.email = "user@example.com"
                    mock_user.is_active = True
                    mock_user.hashed_password = "hashed"

                    mock_get.return_value = mock_user
                    mock_verify.return_value = True
                    # Return a real JWT-like structure
                    mock_token.return_value = (
                        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
                        "eyJzdWIiOiJ1c2VyIiwiaWF0IjoxfQ.test"
                    )

                    response = client.post(
                        "/auth/token",
                        data={
                            "username": "user@example.com",
                            "password": "password123",
                        },
                    )

        app.dependency_overrides.clear()
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        # JWT tokens have 3 parts separated by dots
        assert len(data["access_token"].split(".")) == 3
        assert len(data["access_token"].split(".")) == 3
