import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";

function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
