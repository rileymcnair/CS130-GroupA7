import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        navigate("/login");
      } catch (error) {
        console.error("Failed to log out", error);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "20%" }}>
      <h2>Logging out...</h2>
    </div>
  );
}

export default Logout;
