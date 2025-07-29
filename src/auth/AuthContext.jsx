import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = 'http://localhost:8080/api'; // Your base URL for the API

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Rehydrate authentication state from localStorage on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decodedUser = JSON.parse(storedUser);
        const decodedToken = jwtDecode(token);

        // Check if token is still valid (e.g., not expired)
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser(decodedUser);
        } else {
          // Token expired, remove it from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Failed to decode token or user data from localStorage', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        {
          method: 'POST',
          headers: { Accept: 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const token = await response.text();
      const decodedUser = jwtDecode(token);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(decodedUser));

      setIsAuthenticated(true);
      setUser(decodedUser);

      return token;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const token = await response.text();
      const decodedUser = jwtDecode(token);

      // Store JWT token and user info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(decodedUser));

      // Update state
      setIsAuthenticated(true);
      setUser(decodedUser);

      return token;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        register,  // Expose the register function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn("⚠️ useAuth called outside of AuthProvider!");
  }
  return context;
};
