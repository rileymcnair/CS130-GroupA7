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



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workouts" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Workout />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meals" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Meal />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
          path="/logout" 
          element={<Logout />} 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;