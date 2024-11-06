from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import firebase_admin
from firebase_admin import credentials, firestore

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

@app.route('/remove_favorite_meal', methods=['POST'])
def remove_favorite_meal():
    data = request.json
    email = data.get('email')
    meal_id = data.get('id')
    
    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()
        
        if not user_docs:
            return jsonify({"error": "User not found"}), 404
        
        user_ref = user_docs[0].reference
        user_ref.update({
            'favorited_meals': firestore.ArrayRemove([meal_id])
        })
        
        return jsonify({"message": "Meal removed from favorites"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/remove_favorite_workout', methods=['POST'])
def remove_favorite_workout():
    data = request.json
    email = data.get('email')
    workout_id = data.get('id')
    
    try:
        user_query = db.collection('users').where('email', '==', email).limit(1)
        user_docs = user_query.get()
        
        if not user_docs:
            return jsonify({"error": "User not found"}), 404
        
        user_ref = user_docs[0].reference
        user_ref.update({
            'favorited_workouts': firestore.ArrayRemove([workout_id])
        })
        
        return jsonify({"message": "Workout removed from favorites"}), 200
    
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


if __name__ == '__main__':
    print("Flask app is running...")
    app.run()
