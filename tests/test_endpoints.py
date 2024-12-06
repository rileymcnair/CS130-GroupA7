import pytest
from app import app
import json


@pytest.fixture
def client():
    """Pytest fixture to create a Flask test client."""
    app.testing = True
    client = app.test_client()
    yield client


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.data.decode("utf-8") == "App is running!"


def test_add_user(client):
    user_data = {
        "avg_cal_intake": 2000,
        "date_of_birth": "1990-01-01",
        "email": "test_user@example.com",
        "goal": "Lose weight",
        "height": 170,
        "name": "Test User",
        "weight": 70,
    }
    response = client.post("/add_user", json=user_data)
    assert response.status_code == 201
    assert response.json["message"] == "User added successfully"


def test_get_profile(client):
    response = client.get("/get_profile", query_string={"email": "test_user@example.com"})
    assert response.status_code == 200
    assert response.json["email"] == "test_user@example.com"


def test_save_profile(client):
    profile_data = {
        "email": "test_user@example.com",
        "goal": "Gain muscle",
        "height": 175,
    }
    response = client.post("/save_profile", json=profile_data)
    assert response.status_code == 200
    assert response.json["message"] == "Profile saved successfully"

def test_get_meal_details(client):
    meal_id = "3jzmiuNpfhBQKjRTarvV"
    response = client.get("/get_meal_details", query_string={"mealId": meal_id})
    if response.status_code == 200:
        assert "name" in response.json
    elif response.status_code == 404:
        assert response.json["error"] == "Meal not found"


def test_get_meals_on_day(client):
    response = client.post(
        "/get_meals_on_day",
        json={"email": "test_user@example.com", "date": "2023-01-01"},
    )
    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_add_meal_to_favorites(client):
    response = client.post(
        "/add_meal_to_favorites",
        json={"meal_id": "aIPSXQ6tzP2X5SzGJAeY", "email": "test_user@example.com"},
    )
    assert response.status_code == 200
    assert response.json["message"].startswith("Meal added to favorites")


def test_remove_favorite_meal(client):
    response = client.post(
        "/remove_favorite_meal",
        json={"email": "test_user@example.com", "id": "7MYfiPPIDaw7q9eBbupc"},
    )
    assert response.status_code == 200
    assert "Meal removed from favorites" in response.json["message"]

def test_get_workout_details(client):
    workout_id = "5pEz6IdCGrOVlMA5HHC9"
    response = client.get("/get_workout_details", query_string={"workoutId": workout_id})
    if response.status_code == 200:
        assert "exercises" in response.json
    elif response.status_code == 404:
        assert response.json["error"] == "Workout not found"


def test_get_workouts_on_day(client):
    response = client.post(
        "/get_workouts_on_day",
        json={"email": "test_user@example.com", "date": "2023-01-01"},
    )
    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_update_weight_on_day(client):
    response = client.post(
        "/update_weight_on_day",
        json={"date": "2023-01-01", "weight": 70},
    )
    assert response.status_code in [200, 201]
    assert "message" in response.json


def test_get_weight_on_day(client):
    response = client.post(
        "/get_weight_on_day", json={"date": "2023-01-01"}
    )
    assert response.status_code == 200
    assert "weight" in response.json


def test_edit_user_workout(client):
    workout_data = {
        "name": "Updated Workout",
        "total_minutes": 45,
        "body_part_focus": "legs",
        "exercises": [
            {
                "name": "Squat",
                "reps": 10,
                "sets": 3,
                "weight": "20kg",
                "avg_calories_burned": 50,
                "body_parts": "legs",
                "description": "Do squats",
            }
        ],
    }
    workout_id = "5pEz6IdCGrOVlMA5HHC9"
    response = client.put(f"/edit_user_workout/{workout_id}", json=workout_data)
    assert response.status_code == 200

def test_create_favorite_meal(client):
    meal_data = {
        "email": "test_user@example.com",
        "name": "Pasta",
        "calories": 600,
        "carbs": 50,
        "fats": 10,
        "ingredients": ["Pasta", "Tomato Sauce", "Cheese"],
        "proteins": 15,
        "type": "Lunch",
    }
    response = client.post("/create_favorite_meal", json=meal_data)
    assert response.status_code == 200
    assert "Meal created and added to favorites" in response.json["message"]


def test_add_workout_to_favorites(client):
    response = client.post(
        "/add_workout_to_favorites",
        json={"workout_id": "r3MdWWZrX1wvUR3ISspO", "email": "test_user@example.com"},
    )
    assert response.status_code == 200
    assert "Workout added to favorites" in response.json["message"]

def test_get_n_not_favorited_meals(client):
    response = client.get(
        "/get_n_not_favorited_meals",
        query_string={"numMeals": 5, "email": "test_user@example.com"},
    )
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) <= 5


def test_get_n_not_favorited_workouts(client):
    response = client.get(
        "/get_n_not_favorited_workouts",
        query_string={"numWorkouts": 5, "email": "test_user@example.com"},
    )
    assert response.status_code == 200
    assert isinstance(response.json, list)
    assert len(response.json) <= 5


def test_edit_meal(client):
    updated_meal_data = {
        "meal_id": "ZBeMASTP3E7jKfWwzXpq",
        "meal_data": {
            "name": "Updated Meal",
            "calories": 500,
            "carbs": 40,
            "fats": 15,
            "proteins": 20,
        },
        "email": "test_user@example.com",
    }
    response = client.post("/edit_meal", json=updated_meal_data)
    assert response.status_code == 200
    assert "Meal updated successfully" in response.json["message"]


def test_create_workout(client):
    workout_data = {
        "exercises": ["exercise1", "exercise2"],
        "body_part_focus": "legs",
        "total_minutes": 45,
    }
    response = client.post("/create_workout", json=workout_data)
    assert response.status_code == 201
    assert "Workout created successfully" in response.json["message"]


def test_get_favorite_meals(client):
    response = client.get("/get_favorite_meals", query_string={"email": "test_user@example.com"})
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        assert isinstance(response.json, list)
    else:
        assert response.json["message"] == "No meals found for this user"


def test_get_favorite_workouts(client):
    response = client.get(
        "/get_favorite_workouts", query_string={"email": "test_user@example.com"}
    )
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        assert isinstance(response.json, list)
    else:
        assert response.json["message"] == "No workouts found for this user"


def test_get_calendar(client):
    response = client.get("/get_calendar", query_string={"email": "test_user@example.com"})
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        assert isinstance(response.json, list)


def test_get_workouts_on_day(client):
    response = client.post(
        "/get_workouts_on_day",
        json={"email": "test_user@example.com", "date": "2023-01-01"},
    )
    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_get_weight_on_day(client):
    response = client.post("/get_weight_on_day", json={"date": "2023-01-01"})
    assert response.status_code == 200
    assert "weight" in response.json


def test_update_weight_on_day(client):
    response = client.post(
        "/update_weight_on_day", json={"date": "2023-01-01", "weight": 70}
    )
    assert response.status_code in [200, 201]
    assert "message" in response.json


def test_get_meals_on_day(client):
    response = client.post(
        "/get_meals_on_day",
        json={"email": "test_user@example.com", "date": "2023-01-01"},
    )
    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_get_meal_details(client):
    response = client.get(
        "/get_meal_details", query_string={"mealId": "4e3gDIlwggkmVJwynTxX"}
    )
    if response.status_code == 200:
        assert "name" in response.json
    elif response.status_code == 404:
        assert response.json["error"] == "Meal not found"


def test_get_workout_details(client):
    response = client.get(
        "/get_workout_details", query_string={"workoutId": "5pnEpFPfRZRpMMNjBr9R"}
    )
    if response.status_code == 200:
        assert "exercises" in response.json
    elif response.status_code == 404:
        assert response.json["error"] == "Workout not found"


def test_get_exercise(client):
    response = client.get("/get_exercise/test_exercise_id")
    if response.status_code == 200:
        assert "name" in response.json
    elif response.status_code == 404:
        assert response.json["error"] == "Exercise not found"

