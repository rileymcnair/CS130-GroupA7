from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

from datetime import datetime
import pytz

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

def get_current_date():
    now = datetime.now(pytz.UTC)  
    date_str = now.strftime('%Y-%m-%d')
    day_name = now.strftime('%A')
    return date_str, day_name

db = firestore.client()

def get_user_doc_id_by_email(email):
    try:
        user_query = db.collection('users').where('email', '==', email).get()

        if not user_query:
            return None 

        user_doc = user_query[0]
        return user_doc.id
    except Exception as e:
        print(f"Error fetching user document ID: {str(e)}")
        return None

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
                day_ids = calendar.to_dict()["days"]
                for day_id in day_ids:
                    day_ref = db.collection('Day').document(day_id)
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
        
        day_query = db.collection('Day').where('meals', 'array_contains', meal_id)
        day_docs = day_query.get()
        for day_doc in day_docs:
            day_doc.reference.update({
                'meals': firestore.ArrayRemove([meal_id])
            })
        
        meal_ref = db.collection('Meal').document(meal_id)
        meal_doc = meal_ref.get()

        if not meal_doc.exists:
            return jsonify({"error": "Meal not found"}), 404

        meal_ref.delete()

        return jsonify({"message": "Meal removed from favorites, associated Day entries updated, and meal deleted successfully"}), 200
    
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

@app.route('/remove_workout', methods=['DELETE'])
def delete_workout():
    data = request.json
    workout_id = data.get('workout_id')

    if not workout_id:
        return jsonify({"error": "Workout ID is required"}), 400

    try:
        workout_ref = db.collection('Workout').document(workout_id)
        workout_doc = workout_ref.get()

        if not workout_doc.exists:
            return jsonify({"error": "Workout not found"}), 404

        workout_ref.delete()

        email = data.get('email')
        if email:
            user_query = db.collection('users').where('email', '==', email).limit(1)
            user_docs = user_query.get()

            if user_docs:
                user_ref = user_docs[0].reference
                user_ref.update({
                    'favorited_workouts': firestore.ArrayRemove([workout_id])
                })

        return jsonify({"message": "Workout deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/remove_favorite_workout', methods=['POST'])
def remove_favorite_workout():
    try:
        data = request.json
        email = data.get('email')
        workout_id = data.get('id')
        
        if not email or not workout_id:
            return jsonify({"error": "Email and Workout ID are required"}), 400

        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_ref = user_docs[0].reference
        user_ref.update({
            'favorited_workouts': firestore.ArrayRemove([workout_id])
        })

        day_query = db.collection('Day').where('workouts', 'array_contains', workout_id)
        day_docs = day_query.get()
        for day_doc in day_docs:
            day_doc.reference.update({
                'workouts': firestore.ArrayRemove([workout_id])
            })

        workout_ref = db.collection('Workout').document(workout_id)
        workout_doc = workout_ref.get()

        if not workout_doc.exists:
            return jsonify({"error": "Workout not found"}), 404

        workout_data = workout_doc.to_dict()
        exercise_ids = workout_data.get('exercises', [])

        for exercise_id in exercise_ids:
            exercise_ref = db.collection('Exercise').document(exercise_id)
            exercise_ref.delete()

        workout_ref.delete()

        return jsonify({"message": "Workout, associated exercises, and Day entries updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create_favorite_meal', methods=['POST'])
def create_favorite_meal():
    data = request.json
    if 'email' not in data:
        return jsonify({"error": "Email is required"}), 400

    try:
        meal_ref = db.collection('Meal').add({
            'name': data.get('name'),
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

        current_date, day_name = get_current_date()

        day_query = db.collection('Day').where('date', '==', current_date).limit(1)
        day_docs = day_query.get()

        if day_docs:
            day_ref = day_docs[0].reference
            day_ref.update({
                'meals': firestore.ArrayUnion([meal_id])
            })
        else:
            db.collection('Day').add({
                'date': current_date,
                'day': day_name,
                'meals': [meal_id],
                'workouts': []
            })

        return jsonify({"message": "Meal created and added to favorites", "meal_id": meal_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add_meal_to_favorites', methods=['POST'])
def add_meal_to_favorites():
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

        current_date, day_name = get_current_date()

        day_query = db.collection('Day').where('date', '==', current_date).limit(1)
        day_docs = day_query.get()

        if day_docs:
            day_ref = day_docs[0].reference
            day_ref.update({
                'meals': firestore.ArrayUnion([meal_id])
            })
        else:
            db.collection('Day').add({
                'date': current_date,
                'day': day_name,
                'meals': [meal_id],
                'workouts': []
            })

        return jsonify({
            "message": "Meal added to favorites and associated with today's entry",
            "meal_id": meal_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add_workout_to_favorites', methods=['POST'])
def add_workout_to_favorites():
    data = request.json
    workout_id = data.get('workout_id')
    email = data.get('email')

    if not workout_id or not email:
        return jsonify({"error": "Workout ID and email are required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_ref = user_docs[0].reference

        user_ref.update({
            'favorited_workouts': firestore.ArrayUnion([workout_id])
        })

        current_date, day_name = get_current_date()

        day_query = db.collection('Day').where('date', '==', current_date).limit(1)
        day_docs = day_query.get()

        if day_docs:
            day_ref = day_docs[0].reference
            day_ref.update({
                'workouts': firestore.ArrayUnion([workout_id])
            })
        else:
            db.collection('Day').add({
                'date': current_date,
                'day': day_name,
                'meals': [],
                'workouts': [workout_id]
            })

        return jsonify({
            "message": "Workout added to favorites and associated with today's entry",
            "workout_id": workout_id
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

@app.route('/check_is_favorite_workout', methods=['POST'])
def check_favorite_workout():
    data = request.json
    workout_id = data.get('workout_id')
    email = data.get('email')

    if not workout_id or not email:
        return jsonify({"error": "Workout ID and email are required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_data = user_docs[0].to_dict()
        is_favorite = workout_id in (user_data.get('favorited_workouts') or [])

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
        user_query = db.collection('users').where('email', '==', data['email']).limit(1)
        user_docs = user_query.get()
        if not user_docs:
            return jsonify({"error": "User with specified email not found"}), 404

        user_ref = user_docs[0].reference

        exercise_ids = []
        for exercise in data.get('exercises', []):
            exercise_ref = db.collection('Exercise').add(exercise)
            exercise_ids.append(exercise_ref[1].id)

        workout_ref = db.collection('Workout').add({
            'name': data.get('name', ''),
            'exercises': exercise_ids, 
            'body_part_focus': data.get('body_part_focus', ''),
            'total_minutes': data.get('total_minutes'),
        })
        workout_id = workout_ref[1].id

        user_ref.update({
            'favorited_workouts': firestore.ArrayUnion([workout_id])
        })

        current_date, day_name = get_current_date()
        day_query = db.collection('Day').where('date', '==', current_date).limit(1)
        day_docs = day_query.get()

        if day_docs:
            day_ref = day_docs[0].reference
            day_ref.update({
                'workouts': firestore.ArrayUnion([workout_id])
            })
        else:
            db.collection('Day').add({
                'date': current_date,
                'day': day_name,
                'meals': [],
                'workouts': [workout_id]
            })

        return jsonify({"message": "Workout created successfully", "workout_id": workout_id}), 200

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

@app.route('/get_user_workouts', methods=['GET'])
def get_user_workouts():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email parameter is required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_data = user_docs[0].to_dict()
        workout_ids = user_data.get('workouts', [])

        if not workout_ids:
            return jsonify({"message": "No workouts found for this user"}), 404

        workout_list = []
        for workout_id in workout_ids:
            workout_ref = db.collection('Workout').document(workout_id)
            workout_doc = workout_ref.get()

            if workout_doc.exists:
                workout_data = workout_doc.to_dict()
                workout_data['id'] = workout_id
                workout_list.append(workout_data)
            else:
                print(f"Workout with ID {workout_id} not found")

        if not workout_list:
            return jsonify({"message": "No valid workouts found for this user"}), 404

        return jsonify(workout_list), 200

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
            "name": str,
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
            cleaned_response = re.sub(r"^```json|```$", "", response.text.strip(), flags=re.MULTILINE)
            meal_data = json.loads(cleaned_response)
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

@app.route('/generate_workout', methods=['POST'])
def generate_workout():
    user_input = request.json
    if not user_input:
        return jsonify({"error": "Request body is required"}), 400

    try:
        model = genai.GenerativeModel('gemini-pro')

        body_parts = user_input.get('body_parts', '')

        prompt = f"""
        Create a workout recommendation based on the following criteria:
        - Total time available: {user_input.get('total_minutes', 'any')} minutes
        - Focus on body parts: {body_parts}
        - Desired calories to burn: {user_input.get('avg_calories_burned', 'any')} calories

        Be creative and engaging when naming the workout and exercises. The workout and exercise names should be a short phrase at most 2-3 words. Include around 3-4 exercises max, and the description for each exercise should be 1-2 sentences.

        Respond with ONLY a JSON object that fits this schema, with no additional text:
        {{
            "name": str,
            "total_minutes": int,
            "exercises": [
                {{
                    "name": str,
                    "avg_calories_burned": int,
                    "body_parts": str,
                    "description": str,
                    "reps": int,
                    "sets": int,
                    "weight": str
                }}
            ]
        }}
        """

        response = model.generate_content(prompt)

        try:
            cleaned_response = re.sub(r"^```json|```$", "", response.text.strip(), flags=re.MULTILINE)
            workout_data = json.loads(cleaned_response)
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse model's response to JSON. Try again to generate a new response."}), 500

        body_parts_list = [exercise.get('body_parts', '') for exercise in workout_data.get('exercises', [])]
        body_part_focus = ', '.join(sorted(set(', '.join(body_parts_list).split(', '))))

        exercise_ids = []
        for exercise in workout_data.get('exercises', []):
            exercise_ref = db.collection('Exercise').add(exercise)
            exercise_ids.append(exercise_ref[1].id)

        workout_data['exercises'] = exercise_ids
        workout_data['body_part_focus'] = body_part_focus

        workout_ref = db.collection('Workout').add(workout_data)
        workout_id = workout_ref[1].id

        return jsonify({
            "message": "Workout generated successfully",
            "workout_id": workout_id,
            "workout_data": workout_data
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_n_not_favorited_meals', methods=['GET'])
def get_n_not_favorited_meals():
    try:
        # Retrieve the numMeals parameter from the query string
        num_meals = int(request.args.get('numMeals', 10))  # Default to 10 meals if not provided
        user_email = request.args.get('email')  # Get the user's email from the query string

        if not user_email:
            return jsonify({"error": "Email is required"}), 400

        # Fetch the user's data to get the favorited meals
        user_query = db.collection('users').where('email', '==', user_email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_data = user_docs[0].to_dict()
        favorited_meals = set(user_data.get('favorited_meals', []))  # Get the list of favorited meals

        # Fetch meals from the 'Meal' collection
        meals_query = db.collection('Meal').get()
        meal_list = []

        # Add only non-favorited meals to the response
        for meal in meals_query:
            if meal.id not in favorited_meals:
                meal_list.append({**meal.to_dict(), 'id': meal.id})

            # Stop when we've collected the desired number of meals
            if len(meal_list) >= num_meals:
                break

        return jsonify(meal_list), 200

    except ValueError:
        # Handle invalid numMeals parameter
        return jsonify({"error": "Invalid number of meals requested"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_n_not_favorited_workouts', methods=['GET'])
def get_n_not_favorited_workouts():
    try:
        num_workouts = int(request.args.get('numWorkouts', 10))
        user_email = request.args.get('email')

        if not user_email:
            return jsonify({"error": "Email is required"}), 400

        user_query = db.collection('users').where('email', '==', user_email).limit(1)
        user_docs = user_query.get()
        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_data = user_docs[0].to_dict()
        favorited_workouts = set(user_data.get('favorited_workouts', []))

        workouts_query = db.collection('Workout').get()
        workout_list = []

        for workout in workouts_query:
            if workout.id not in favorited_workouts:
                workout_data = {**workout.to_dict(), 'id': workout.id}

                exercise_details = []
                for exercise_id in workout_data.get("exercises", []):
                    exercise_ref = db.collection('Exercise').document(exercise_id)
                    exercise_doc = exercise_ref.get()
                    if exercise_doc.exists:
                        exercise_details.append(exercise_doc.to_dict())

                workout_data["exercises"] = exercise_details
                workout_list.append(workout_data)

                if len(workout_list) >= num_workouts:
                    break

        return jsonify(workout_list), 200

    except ValueError:
        return jsonify({"error": "Invalid number of workouts requested"}), 400

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
    meal_id = data.get('meal_id')

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

        current_date, _ = get_current_date()

        day_query = db.collection('Day').where('date', '==', current_date).limit(1)
        day_docs = day_query.get()

        if day_docs:
            day_ref = day_docs[0].reference
            day_ref.update({
                'meals': firestore.ArrayRemove([meal_id])
            })

        return jsonify({
            "message": "Meal unfavorited and removed from today's entry successfully",
            "meal_id": meal_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/unfavorite_workout', methods=['POST'])
def unfavorite_workout():
    data = request.json
    email = data.get('email')
    workout_id = data.get('workout_id')

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

        current_date, _ = get_current_date()

        day_query = db.collection('Day').where('date', '==', current_date).limit(1)
        day_docs = day_query.get()

        if day_docs:
            day_ref = day_docs[0].reference
            day_ref.update({
                'workouts': firestore.ArrayRemove([workout_id])
            })

        return jsonify({
            "message": "Workout unfavorited and removed from today's entry successfully",
            "workout_id": workout_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/edit_meal', methods=['POST'])
def edit_meal():
    data = request.json
    email = data.get('email')
    meal_id = data.get('meal_id')  # Meal ID to identify the meal
    updated_meal_data = data.get('meal_data')  # Contains updated meal details

    if not email or not meal_id or not updated_meal_data:
        return jsonify({"error": "Email, Meal ID, and updated meal data are required"}), 400

    try:
        # Find the user by email
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        # Reference to the meal document
        meal_ref = db.collection('Meal').document(meal_id)
        meal_doc = meal_ref.get()

        if not meal_doc.exists:
            return jsonify({"error": "Meal not found"}), 404

        # Update the meal document with the new data
        meal_ref.update(updated_meal_data)

        return jsonify({
            "message": "Meal updated successfully",
            "meal_id": meal_id,
            "updated_meal_data": updated_meal_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500   

@app.route('/create_workout', methods=['POST'])
def create_workout():
    try:
        data = request.json
        exercises = data.get('exercises', [])
        body_part_focus = data.get('body_part_focus', '')
        total_minutes = data.get('total_minutes')

        workout_ref = db.collection('Workout').add({
            'exercises': exercises,
            'body_part_focus': body_part_focus,
            'total_minutes': total_minutes,
        })

        workout_id = workout_ref[1].id
        return jsonify({"message": "Workout created successfully", "workout_id": workout_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500 
    
@app.route('/get_favorite_workouts', methods=['GET'])
def get_favorite_workouts():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()
        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_data = user_docs[0].to_dict()
        workout_ids = user_data.get('favorited_workouts', [])

        workouts = []
        for workout_id in workout_ids:
            workout_ref = db.collection('Workout').document(workout_id)
            workout_doc = workout_ref.get()
            if workout_doc.exists:
                workout_data = workout_doc.to_dict()
                workout_data['id'] = workout_doc.id

                exercise_details = []
                for exercise_id in workout_data.get("exercises", []):
                    exercise_ref = db.collection('Exercise').document(exercise_id)
                    exercise_doc = exercise_ref.get()
                    if exercise_doc.exists:
                        exercise_details.append(exercise_doc.to_dict())

                workout_data["exercises"] = exercise_details
                workouts.append(workout_data)

        return jsonify(workouts), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/create_user_workout', methods=['POST'])
def create_user_workout():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()

        if not user_docs:
            return jsonify({"error": "User not found"}), 404

        user_id = user_docs[0].id

        workout_data = {
            'exercises': data.get('exercises', []),
            'body_part_focus': data.get('body_part_focus', ''),
            'total_minutes': data.get('total_minutes', 0),
        }
        workout_ref = db.collection('Workout').add(workout_data)
        workout_id = workout_ref[1].id

        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'workouts': firestore.ArrayUnion([workout_id])
        })

        return jsonify({"message": "Workout created successfully", "workout_id": workout_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/edit_user_workout/<workout_id>', methods=['PUT'])
def edit_user_workout(workout_id):
    data = request.json

    try:
        workout_ref = db.collection('Workout').document(workout_id)
        workout_doc = workout_ref.get()

        if not workout_doc.exists:
            return jsonify({"error": "Workout not found"}), 404

        workout_data = workout_doc.to_dict()
        exercise_ids = workout_data.get('exercises', [])

        workout_ref.update({
            'name': data.get('name'),
            'total_minutes': data.get('total_minutes'),
            'body_part_focus': data.get('body_part_focus'),
        })

        for index, exercise_id in enumerate(exercise_ids):
            if index >= len(data.get('exercises', [])):
                continue

            exercise_data = data['exercises'][index]
            exercise_ref = db.collection('Exercise').document(exercise_id)

            exercise_ref.update({
                'name': exercise_data.get('name'),
                'reps': exercise_data.get('reps'),
                'sets': exercise_data.get('sets'),
                'weight': exercise_data.get('weight'),
                'avg_calories_burned': exercise_data.get('avg_calories_burned'),
                'body_parts': exercise_data.get('body_parts'),
                'description': exercise_data.get('description'),
            })

        return jsonify({"message": "Workout and exercises updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_exercise/<exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    try:
        exercise_ref = db.collection('Exercise').document(exercise_id)
        exercise_doc = exercise_ref.get()

        if not exercise_doc.exists:
            return jsonify({"error": "Exercise not found"}), 404

        return jsonify(exercise_doc.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_calendar', methods=['GET'])
def get_calendar():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email parameter is required"}), 400

    try:
        calendar_query = db.collection('Calendar').where('belongs_to', '==', email)
        calendar_docs = calendar_query.get()

        if not calendar_docs:
            return jsonify({"message": "No calendar entries found for this user"}), 404

        calendar_data = [
            {**doc.to_dict(), 'id': doc.id} for doc in calendar_docs
        ]

        return jsonify(calendar_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_workouts_on_day', methods=['POST'])
def get_workouts_on_day():
    try:
        data = request.get_json()
        email = data.get('email')  # Email sent by the client
        date = data.get('date')  # Date in YYYY-MM-DD format

        if not email or not date:
            return jsonify({"error": "Email and Date are required"}), 400

        # Get the user document ID by email
        user_id = get_user_doc_id_by_email(email)
        if not user_id:
            return jsonify({"error": "User not found"}), 404

        # Fetch the Day entry by the given date
        day_docs = db.collection('Day').where('date', '==', date).get()
        if not day_docs:
            return jsonify([]), 200

        day_doc = day_docs[0]
        day_data = day_doc.to_dict()
        day_id = day_doc.id

        # Validate Calendar contains the Day ID
        calendar_docs = db.collection('Calendar').where('belongs_to', '==', user_id).get()
        # Assume the user has only one calendar
        calendar_doc = calendar_docs[0]
        
        if day_id not in calendar_doc.to_dict()["days"]:
            return jsonify({"error": "No Calendar entry contains the specified Day"}), 404

        calendar_doc = calendar_docs[0]
        calendar_data = calendar_doc.to_dict()

        # Validate Calendar belongs to the user
        if calendar_data.get('belongs_to') != user_id:
            return jsonify({"error": "The specified Calendar does not belong to the user"}), 403

        # Fetch workouts for the Day
        workout_ids = day_data.get('workouts', [])

        workouts_with_exercises = []
        for workout_id in workout_ids:
            workout_ref = db.collection('Workout').document(workout_id)
            workout_doc = workout_ref.get()

            if not workout_doc.exists:
                continue

            workout_data = workout_doc.to_dict()
            exercise_details = []
            for exercise_id in workout_data.get("exercises", []):
                exercise_ref = db.collection('Exercise').document(exercise_id)
                exercise_doc = exercise_ref.get()
                if exercise_doc.exists:
                    exercise_details.append({**exercise_doc.to_dict(), 'id': exercise_id})

            workout_data["exercises"] = exercise_details
            workouts_with_exercises.append({**workout_data, 'id': workout_id})

        return jsonify(workouts_with_exercises), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_weight_on_day', methods=['POST'])
def get_weight_on_day():
    try:
        data = request.get_json()
        date = data.get('date')
        if not date:
            return jsonify({"error": "Date parameter is required"}), 400

        day_docs = db.collection('Day').where('date', '==', date).get()
        if not day_docs:
            return jsonify({"message": "No data found for the specified date", "weight": []}), 200

        day_data = day_docs[0].to_dict()
        weight = day_data.get('weight', None)

        if weight is None:
            return jsonify({"message": "Weight not found for the specified date", "weight": None}), 200

        return jsonify({"date": date, "weight": weight}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_weight_on_day', methods=['POST'])
def update_weight_on_day():
    try:
        data = request.get_json()
        date = data.get('date')
        weight = data.get('weight')

        if not date or weight is None:
            return jsonify({"error": "Date and weight are required"}), 400

        day_query = db.collection('Day').where('date', '==', date).limit(1)
        day_docs = day_query.get()
        try:
            weight = int(weight) 
        except ValueError:
            return jsonify({"error": "Weight must be a valid number"}), 400

        if day_docs:
            day_ref = day_docs[0].reference
            day_ref.update({"weight": weight})
            return jsonify({"message": "Weight updated successfully"}), 200
        else:
            new_day = {
                "date": date,
                "weight": weight,
                "meals": [],  
                "workouts": [],
            }
            db.collection('Day').add(new_day)
            return jsonify({"message": "Weight added for new day"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_meals_on_day', methods=['POST'])
def get_meals_on_day():
    try:
        data = request.get_json()
        email = data.get('email')  # Email sent by the client
        date = data.get('date')  # Date in YYYY-MM-DD format

        if not email or not date:
            return jsonify({"error": "Email and Date are required"}), 400

        # Get the user document ID by email
        user_id = get_user_doc_id_by_email(email)
        if not user_id:
            return jsonify({"error": "User not found"}), 404

        # Fetch the Day entry by the given date
        day_docs = db.collection('Day').where('date', '==', date).get()
        if not day_docs:
            return jsonify([]), 200

        day_doc = day_docs[0]
        day_data = day_doc.to_dict()
        day_id = day_doc.id

        # Validate Calendar contains the Day ID
        calendar_docs = db.collection('Calendar').where('belongs_to', '==', user_id).get()
        # Assume the user has only one calendar
        calendar_doc = calendar_docs[0]
        
        if day_id not in calendar_doc.to_dict()["days"]:
            return jsonify({"error": "No Calendar entry contains the specified Day"}), 404

        calendar_doc = calendar_docs[0]
        calendar_data = calendar_doc.to_dict()

        # Validate Calendar belongs to the user
        if calendar_data.get('belongs_to') != user_id:
            return jsonify({"error": "The specified Calendar does not belong to the user"}), 403
        # Fetch meals for the Day
        meal_ids = day_data.get('meals', [])
        meals_with_details = []
        for meal_id in meal_ids:
            meal_ref = db.collection('Meal').document(meal_id)
            meal_doc = meal_ref.get()
            if meal_doc.exists:
                meals_with_details.append({**meal_doc.to_dict(), 'id': meal_id})

        return jsonify(meals_with_details), 200

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

if __name__ == '__main__':
    print("Flask app is running...")
    app.run(debug=True)
