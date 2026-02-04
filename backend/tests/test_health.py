from app import app
from app.core.database import get_db


def test_health_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_version(client):
    response = client.get("/version")
    assert response.status_code == 200
    assert "version" in response.json()


def test_ready_ok(client):
    def override_get_db():
        class DummySession:
            def execute(self, _):
                return 1

            def close(self):
                pass

        yield DummySession()

    app.dependency_overrides[get_db] = override_get_db
    try:
        response = client.get("/ready")
        assert response.status_code == 200
        assert response.json() == {"status": "ready"}
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_ready_failure(client):
    def override_get_db_fail():
        class DummySession:
            def execute(self, _):
                raise RuntimeError("db down")

            def close(self):
                pass

        yield DummySession()

    app.dependency_overrides[get_db] = override_get_db_fail
    try:
        response = client.get("/ready")
        assert response.status_code == 503
        assert response.json()["detail"] == "Service not ready"
    finally:
        app.dependency_overrides.pop(get_db, None)
