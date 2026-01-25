"""Pytest fixtures for tests."""

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app import app


@pytest.fixture
def db_mock():
    """Mock database session."""
    return MagicMock()


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)
