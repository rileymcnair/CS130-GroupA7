import pytest
from app import app


@pytest.fixture
def client():
    """
    Pytest fixture to create a Flask test client.
    """
    app.testing = True  # Enable testing mode
    client = app.test_client()
    yield client

def test_health_check(client):
    # Send a GET request to the /health endpoint
    response = client.get("/health")

    # Assert the status code is 200
    assert response.status_code == 200

    # Assert the response body is "App is running!"
    assert response.data.decode("utf-8") == "App is running!"
