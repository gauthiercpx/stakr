from app import app


def test_openapi_json_available(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200

    data = response.json()
    assert data["openapi"].startswith("3.")
    assert data["info"]["title"] == "STAKR API"
    assert "paths" in data
    assert "/health" in data["paths"]
    assert "/echo" in data["paths"]
