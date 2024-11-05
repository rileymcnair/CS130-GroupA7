// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzS9g8UOjQ1eg4Av548w1HL4RGnfe0SUY",
  authDomain: "cs130-group-project-9b447.firebaseapp.com",
  projectId: "cs130-group-project-9b447",
  storageBucket: "cs130-group-project-9b447.appspot.com",
  messagingSenderId: "777255312791",
  appId: "1:777255312791:web:58a6ff3829b077d92e38d2",
  measurementId: "G-CTSP6WX4F5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };