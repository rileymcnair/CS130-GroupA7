import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

/**
 * Landing page component that displays a welcome message and login/register options.
 * It checks if the user is authenticated, and redirects them to the home page if they are.
 * 
 * @component
 * @example
 * return (
 *   <Landing />
 * )
 */
function Landing() {
  const { isAuthenticated } = useAuth();
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

  return (
    <div className="auth-container">
      <h2>Welcome to My App!</h2>
      <p>Please login or register to continue.</p>
      <div className="landing-buttons">
        <Link to="/login" className="landing-button">
          Login
        </Link>
        <Link to="/register" className="landing-button">
          Register
        </Link>
      </div>
    </div>
  );
}

export default Landing;
