import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

/**
 * Context to provide authentication-related data and functions across the app.
 * This includes user state, login, register, logout, and Google login functionality.
 */
const AuthContext = createContext();

/**
 * The AuthProvider component wraps the app and provides authentication context.
 * It listens for authentication state changes and manages user state.
 * 
 * @param {React.ReactNode} children - The child components to be wrapped by the provider.
 * @returns {React.ReactNode} - The children components wrapped inside AuthContext.Provider.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // State to store the current user
  const [loading, setLoading] = useState(true); // State to indicate loading status

  // Set up listener for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state when authentication status changes
      setLoading(false); // Set loading to false after authentication state is determined
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  /**
   * Logs the user in using email and password.
   * 
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise} - A promise representing the authentication result.
   */
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Registers a new user using email and password.
   * 
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise} - A promise representing the registration result.
   */
  const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * Logs out the current user.
   * 
   * @returns {Promise} - A promise representing the logout result.
   */
  const logout = () => {
    return signOut(auth);
  };

  // Google authentication provider setup
  const googleProvider = new GoogleAuthProvider();

  /**
   * Logs the user in using Google authentication.
   * 
   * @returns {Promise} - A promise representing the Google sign-in result.
   */
  const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  // Context value containing authentication functions and user state
  const value = {
    user, // The current user object
    login, // Function to log in a user
    loginWithGoogle, // Function to log in with Google
    register, // Function to register a new user
    logout, // Function to log out the current user
    isAuthenticated: !!user, // Boolean indicating if the user is authenticated
  };

  return (
    // Provide authentication data to child components
    <AuthContext.Provider value={value}>
      {/* Only render children if not loading */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the authentication context.
 * 
 * @returns {Object} - The authentication context value (user, login, register, etc.).
 */
export function useAuth() {
  return useContext(AuthContext);
}
