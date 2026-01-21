from fastapi.testclient import TestClient

from app.main import app


def test_health_ok():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_version():
    client = TestClient(app)
    response = client.get("/version")
    assert response.status_code == 200
    assert "version" in response.json()
