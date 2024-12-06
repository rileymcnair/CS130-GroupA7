import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Workout from './pages/Workout';
import Meal from './pages/Meal';
import DashboardLayout from './components/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Logout from "./pages/Logout";

/**
 * The main App component that defines the routing and authentication logic for the application.
 * It wraps the entire app in an AuthProvider to manage authentication context.
 * Routes are defined for various pages including login, register, dashboard, and more.
 */
function App() {
  return (
    <AuthProvider> {/* Provides authentication context to the entire app */}
      <Router> {/* The Router component from react-router-dom is used to handle routing */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} /> {/* Landing page route */}
          <Route path="/login" element={<Login />} /> {/* Login page route */}
          <Route path="/register" element={<Register />} /> {/* Registration page route */}

          {/* Protected Routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute> {/* Wrapper component that checks if user is authenticated */}
                <DashboardLayout> {/* Layout component for the dashboard */}
                  <Dashboard /> {/* The actual Dashboard component */}
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile /> {/* Profile page for authenticated users */}
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workouts" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Workout /> {/* Workout page for authenticated users */}
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meals" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Meal /> {/* Meal page for authenticated users */}
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* Logout Route */}
          <Route 
            path="/logout" 
            element={<Logout />} /> {/* Logout page route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
