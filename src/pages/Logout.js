import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/**
 * Logout page component that handles the user logout process.
 * It logs out the user and redirects them to the login page.
 * 
 * @component
 * @example
 * return (
 *   <Logout />
 * )
 */
function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Effect that triggers the logout process when the component is mounted.
   * It calls the logout function and redirects the user to the login page.
   */
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
