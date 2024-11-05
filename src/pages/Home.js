import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

function Home() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-container">
      <nav className="home-navbar">
        <h2 className="home-title">Healthify</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </nav>
      <div className="home-content">
        <h2>Home - Protected Content</h2>
      </div>
    </div>
  );
}

export default Home;