from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)

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
        user_data = request.json

        user_ref = db.collection('UserAccount')

        user_ref.add({
            'avg_cal_intake': user_data.get('avg_cal_intake', 0),
            'date_of_birth': user_data.get('date_of_birth'),
            'email': user_data.get('email'),
            'goal': user_data.get('goal'),
            'height': user_data.get('height', 0),
            'name': user_data.get('name'),
            'weight': user_data.get('weight', 0)
        })

        return jsonify({"message": "User added successfully"}), 201

    except Exception as e:
        return jsonify({"error adding user": str(e)}), 400

if __name__ == '__main__':
    print("Flask app is running...")
    app.run()
