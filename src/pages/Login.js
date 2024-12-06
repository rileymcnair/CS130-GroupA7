import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

/**
 * Login page component where users can log in using email/password or Google authentication.
 * If the user is already authenticated, they are redirected to the home page.
 * 
 * @component
 * @example
 * return (
 *   <Login />
 * )
 */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /**
   * Effect that redirects authenticated users to the home page.
   * This runs when the `isAuthenticated` status changes.
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handles the login form submission.
   * It attempts to log in the user with the provided email and password.
   * 
   * @param {Event} e - The form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/home");
    } catch (error) {
      console.error("Failed to log in", error);
    }
  };

  /**
   * Handles login via Google authentication.
   * It attempts to log in the user using their Google account.
   */
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/home");
    } catch (error) {
      console.error("Failed to log in with Google", error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleGoogleLogin} className="google-login-button">
        <img src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Google icon" className="google-icon" />
        Sign in with Google
      </button>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
