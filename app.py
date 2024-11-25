from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

app = Flask(__name__)
CORS(app)  # enable CORS for javascript 


# initialize Firebase Admin SDK with service account creds
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")

# initialize DB
try:
    db = firestore.client()
    print("Firestore client initialized successfully.")
except Exception as e:
    print(f"Error initializing Firestore client: {e}")

# load API key from .env file
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# route to health check
@app.route('/health', methods=['GET'])
def health_check():
    return "App is running!", 200

# route to add a new user to DB
@app.route('/add_user', methods=['POST'])
def add_user():
    try:
        if not request.is_json:
            return jsonify({"error": "Invalid content type. Expected application/json"}), 400

        user_data = request.get_json()
        user_ref = db.collection('users')

        user_ref.add({
            'avg_cal_intake': user_data.get('avg_cal_intake'),
            'date_of_birth': user_data.get('date_of_birth'),
            'email': user_data.get('email'),
            'goal': user_data.get('goal'),
            'height': user_data.get('height'),
            'name': user_data.get('name'),
            'weight': user_data.get('weight'),
            'favorited_meals': [],
            'favorited_workouts': [],
        })

        return jsonify({"message": "User added successfully"}), 201

    except ValueError as ve:
        return jsonify({"error": f"Invalid data type: {ve}"}), 400
    except Exception as e:
        return jsonify({"error adding user": str(e)}), 400

@app.route('/get_profile', methods=['GET'])
def get_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email parameter is required"}), 400

    try:
        profile_ref = db.collection('users').where('email', '==', email)
        docs = profile_ref.get()

        if not docs:
            return jsonify({"message": "Profile not found"}), 404

        profile_data = docs[0].to_dict()
        profile_data['id'] = docs[0].id
        return jsonify(profile_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/save_profile', methods=['POST'])
def save_profile():
    data = request.json
    if 'email' not in data:
        return jsonify({"error": "Email is required"}), 400

    try:
        profile_ref = db.collection('users').where('email', '==', data['email'])
        docs = profile_ref.get()

        if docs:
            profile_id = docs[0].id
            db.collection('users').document(profile_id).update(data)
        else:
            db.collection('users').add(data)

        return jsonify({"message": "Profile saved successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/historical_data', methods=['GET'])
def get_historical_data():
    data = request.json
    if 'email' not in data:
        return jsonify({"error": "Email is required"}), 400

    try:
        res = []
        profile_ref = db.collection('users').where('email', '==', data['email'])
        profile_docs = profile_ref.get()
        if len(profile_docs) < 1:
            raise Exception('no profile associated with user')
        user_id = profile_docs[0].id
        calendar_ref = db.collection('Calendar').where('belongs_to', '==', user_id)
        if calendar_ref:
            calendar_docs = calendar_ref.get()
            for calendar in calendar_docs:
                weeks_ids = calendar.to_dict()["weeks"]
                for week_id in weeks_ids:
                    week_ref = db.collection('Week').document(week_id)
                    week_doc = week_ref.get()
                    week_dict = week_doc.to_dict()
                    if "days" in week_dict:
                        for day_id in week_dict["days"].values():
                            if day_id:
                                day_ref = db.collection("Day").document(day_id)
                                day_values = day_ref.get().to_dict()
                                res.append(day_values)
        return jsonify(res), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/remove_favorite_meal', methods=['POST'])
def remove_favorite_meal():
    data = request.json
    email = data.get('email')
    meal_id = data.get('id')
    
    if not email or not meal_id:
        return jsonify({"error": "Email and Meal ID are required"}), 400
    
    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()
        
        if not user_docs:
            return jsonify({"error": "User not found"}), 404
        
        user_ref = user_docs[0].reference
        user_ref.update({
            'favorited_meals': firestore.ArrayRemove([meal_id])
        })
        
        meal_ref = db.collection('Meal').document(meal_id)
        meal_doc = meal_ref.get()

        if not meal_doc.exists:
            return jsonify({"error": "Meal not found"}), 404

        meal_ref.delete()

        return jsonify({"message": "Meal removed from favorites and deleted successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/remove_meal', methods=['DELETE'])
def delete_meal():
    data = request.json
    meal_id = data.get('meal_id')

    if not meal_id:
        return jsonify({"error": "Meal ID is required"}), 400

    try:
        meal_ref = db.collection('Meal').document(meal_id)
        meal_doc = meal_ref.get()

        if not meal_doc.exists:
            return jsonify({"error": "Meal not found"}), 404

        meal_ref.delete()

        email = data.get('email')
        if email:
            user_query = db.collection('users').where('email', '==', email).limit(1)
            user_docs = user_query.get()

            if user_docs:
                user_ref = user_docs[0].reference
                user_ref.update({
                    'favorited_meals': firestore.ArrayRemove([meal_id])
                })

        return jsonify({"message": "Meal deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/remove_favorite_workout', methods=['POST'])
def remove_favorite_workout():
    data = request.json
    email = data.get('email')
    workout_id = data.get('id')
    
    if not email or not workout_id:
        return jsonify({"error": "Email and Workout ID are required"}), 400
    
    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()
        
        if not user_docs:
            return jsonify({"error": "User not found"}), 404
        
        user_ref = user_docs[0].reference
        user_ref.update({
            'favorited_workouts': firestore.ArrayRemove([workout_id])
        })

        workout_ref = db.collection('Workout').document(workout_id)
        workout_doc = workout_ref.get()

        if not workout_doc.exists:
            return jsonify({"error": "Workout not found"}), 404

        workout_ref.delete()

        return jsonify({"message": "Workout removed from favorites and deleted successfully"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create_favorite_meal', methods=['POST'])
def create_favorite_meal():
    data = request.json
    if 'email' not in data:
        return jsonify({"error": "Email is required"}), 400

    try:
        meal_ref = db.collection('Meal').add({
            'calories': data.get('calories'),
            'carbs': data.get('carbs'),
            'fats': data.get('fats'),
            'ingredients': data.get('ingredients'),
            'proteins': data.get('proteins'),
            'type': data.get('type')
        })
        meal_id = meal_ref[1].id

        users_ref = db.collection('users')
        user_query = users_ref.where('email', '==', data['email']).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User with specified email not found"}), 404

        user_doc = user_docs[0]
        user_ref = users_ref.document(user_doc.id)
        user_ref.update({
            'favorited_meals': firestore.ArrayUnion([meal_id])
        })

        return jsonify({"message": "Meal created and added to favorites", "meal_id": meal_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add_meal_to_favorites', methods=['POST'])
def add_to_favorites():
    data = request.json
    meal_id = data.get('meal_id')
    email = data.get('email')

    if not meal_id or not email:
        return jsonify({"error": "Meal ID and email are required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_ref = user_docs[0].reference

        user_ref.update({
            'favorited_meals': firestore.ArrayUnion([meal_id])
        })

        return jsonify({
            "message": "Meal added to favorites successfully",
            "meal_id": meal_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/check_is_favorite_meal', methods=['POST'])
def check_favorite():
    data = request.json
    meal_id = data.get('meal_id')
    email = data.get('email')

    if not meal_id or not email:
        return jsonify({"error": "Meal ID and email are required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_data = user_docs[0].to_dict()
        is_favorite = meal_id in (user_data.get('favorited_meals') or [])

        return jsonify({
            "is_favorite": is_favorite
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create_favorite_workout', methods=['POST'])
def create_favorite_workout():
    data = request.json
    if 'email' not in data:
        return jsonify({"error": "Email is required"}), 400

    try:
        exercise_ids = []
        for exercise in data.get('exercises', []):
            exercise_ref = db.collection('Exercise').add(exercise)
            exercise_ids.append(exercise_ref[1].id)

        workout_ref = db.collection('Workout').add({
            'exercises': exercise_ids,
            'is_recurring': data.get('is_recurring', False),
            'total_minutes': data.get('total_minutes')
        })
        workout_id = workout_ref[1].id

        users_ref = db.collection('users')
        user_query = users_ref.where('email', '==', data['email']).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User with specified email not found"}), 404

        user_doc = user_docs[0]
        user_ref = users_ref.document(user_doc.id)
        user_ref.update({
            'favorited_workouts': firestore.ArrayUnion([workout_id])
        })

        return jsonify({"message": "Workout created and added to favorites", "workout_id": workout_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_meal_details', methods=['GET'])
def get_meal_details():
    meal_id = request.args.get('mealId')
    if not meal_id:
        return jsonify({"error": "mealId parameter is required"}), 400

    try:
        meal_ref = db.collection('Meal').document(meal_id)
        meal_doc = meal_ref.get()

        if not meal_doc.exists:
            return jsonify({"error": "Meal not found"}), 404

        return jsonify(meal_doc.to_dict()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_workout_details', methods=['GET'])
def get_workout_details():
    workout_id = request.args.get('workoutId')
    if not workout_id:
        return jsonify({"error": "workoutId parameter is required"}), 400

    try:
        workout_ref = db.collection('Workout').document(workout_id)
        workout_doc = workout_ref.get()

        if not workout_doc.exists:
            return jsonify({"error": "Workout not found"}), 404

        workout_data = workout_doc.to_dict()
        exercise_details = []
        for exercise_id in workout_data.get("exercises", []):
            exercise_ref = db.collection('Exercise').document(exercise_id)
            exercise_doc = exercise_ref.get()
            if exercise_doc.exists:
                exercise_details.append(exercise_doc.to_dict())

        workout_data["exercises"] = exercise_details
        return jsonify(workout_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_user_meals', methods=['GET'])
def get_user_meals():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email parameter is required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_data = user_docs[0].to_dict()
        meal_ids = user_data.get('meals', [])

        if not meal_ids:
            return jsonify({"message": "No meals found for this user"}), 404

        meal_list = []
        for meal_id in meal_ids:
            meal_ref = db.collection('Meal').document(meal_id)
            meal_doc = meal_ref.get()

            if meal_doc.exists:
                meal_data = meal_doc.to_dict()
                meal_data['id'] = meal_id
                meal_list.append(meal_data)
            else:
                print(f"Meal with ID {meal_id} not found")

        if not meal_list:
            return jsonify({"message": "No valid meals found for this user"}), 404

        return jsonify(meal_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate_meal', methods=['POST'])
def generate_meal():
    user_input = request.json
    if not user_input:
        return jsonify({"error": "Request body is required"}), 400

    try:
        model = genai.GenerativeModel('gemini-pro')

        prompt = f"""
        Create a meal recommendation based on the following criteria:
        - Type of meal: {user_input.get('type', 'any')}
        - Dietary preference: {user_input.get('diet', 'any')}
        - Calorie range: {user_input.get('calories', 'any')} calories
        - Ingredients to include: {', '.join(user_input.get('ingredients', []))}
        - Time available: {user_input.get('time', 'any')} minutes

        Respond with ONLY a JSON object that fits this schema, with no additional text:
        {{
            "calories": int,
            "carbs": int,
            "fats": int,
            "proteins": int,
            "ingredients": [str],
            "type": "{user_input.get('type', 'meal')}"
        }}
        """

        response = model.generate_content(prompt)

        try:
            meal_data = json.loads(response.text)
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse model's response to JSON. Try again to generate a new response."}), 500

        # store generated meal in Firestore
        meal_ref = db.collection('Meal').add(meal_data)
        meal_id = meal_ref[1].id

        return jsonify({
            "message": "Meal generated successfully",
            "meal_id": meal_id,
            "meal_data": meal_data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_n_meals', methods=['GET'])
def get_n_meals():
    try:
        # Fetch the first 3 documents from the 'Meal' collection
        meals_query = db.collection('Meal').limit(3).get()

        # Prepare the meal list with IDs
        meal_list = []
        for meal in meals_query:
            # Log each meal's ID and data for debugging
            print("Meal ID:", meal.id)
            print("Meal Data:", meal.to_dict())

            # Add the document's data and ID to the response
            meal_list.append({**meal.to_dict(), 'id': meal.id})

        return jsonify(meal_list), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/get_favorite_meals', methods=['GET'])
def get_favorite_meals():
    # get favorites list from user profile, get the favorited meals
    # Fetch the first 10 meals
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email parameter is required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_data = user_docs[0].to_dict()
        meal_ids = user_data.get('favorited_meals', [])

        if not meal_ids:
            return jsonify({"message": "No meals found for this user"}), 404

        meal_list = []
        for meal_id in meal_ids:
            meal_ref = db.collection('Meal').document(meal_id)
            meal_doc = meal_ref.get()

            if meal_doc.exists:
                meal_data = meal_doc.to_dict()
                meal_data['id'] = meal_id
                meal_list.append(meal_data)
            else:
                print(f"Meal with ID {meal_id} not found")

        if not meal_list:
            return jsonify({"message": "No valid meals found for this user"}), 404

        return jsonify(meal_list), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/unfavorite_meal', methods=['POST'])
def unfavorite_meal():
    data = request.json
    email = data.get('email')
    meal_id = data.get('meal_id')  # Use consistent naming as 'add_to_favorites'

    if not email or not meal_id:
        return jsonify({"error": "Email and Meal ID are required"}), 400

    try:
        # Find the user by email
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_ref = user_docs[0].reference

        # Remove the meal ID from the favorited_meals array
        user_ref.update({
            'favorited_meals': firestore.ArrayRemove([meal_id])
        })

        return jsonify({
            "message": "Meal unfavorited successfully",
            "meal_id": meal_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    print("Flask app is running...")
    app.run(debug=True)
