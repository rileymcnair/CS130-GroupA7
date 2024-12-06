import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

/**
 * Register component for handling user registration using email/password
 * or Google authentication.
 */
function Register() {
  const [email, setEmail] = useState(""); // Email state for the input field
  const [password, setPassword] = useState(""); // Password state for the input field
  const { register, loginWithGoogle, isAuthenticated } = useAuth(); // Destructure register and loginWithGoogle functions from AuthContext
  const navigate = useNavigate(); // Navigate hook to redirect users after authentication

  /**
   * Effect hook that checks if the user is authenticated.
   * If authenticated, redirect to the home page.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home"); // Redirect to the home page if authenticated
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handles form submission for registration using email and password.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password); // Attempt to register with provided email and password
      navigate("/home"); // Redirect to home on successful registration
    } catch (error) {
      console.error("Failed to register", error); // Log error if registration fails
    }
  };

  /**
   * Handles Google login registration.
   * Attempts to register a user using their Google account.
   */
  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle(); // Attempt Google login
      navigate("/home"); // Redirect to home on successful Google authentication
    } catch (error) {
      console.error("Failed to register with Google", error); // Log error if Google registration fails
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {/* Email input field */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update email state on change
        />
        
        {/* Password input field */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update password state on change
        />
        
        {/* Submit button for email/password registration */}
        <button type="submit">Register</button>
      </form>

      {/* Button to register using Google */}
      <button onClick={handleGoogleRegister} className="google-login-button">
        <img 
          src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" 
          alt="Google icon" 
          className="google-icon" 
        />
        Sign up with Google
      </button>

      {/* Link to login page if user already has an account */}
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
