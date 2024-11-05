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
      <h2>Home - Protected Content</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;