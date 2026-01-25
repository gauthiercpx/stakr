from app import app


def test_version_endpoint(client):
    response = client.get("/version")
    assert response.status_code == 200
    assert "version" in response.json()


def test_get_item(client):
    item_id = 42
    response = client.get(f"/items/{item_id}")
    assert response.status_code == 200
    assert response.json() == {"id": item_id, "name": f"Item {item_id}"}


def test_echo(client):
    payload = {"hello": "world"}
    response = client.post("/echo", json=payload)
    assert response.status_code == 200
    assert response.json() == payload
