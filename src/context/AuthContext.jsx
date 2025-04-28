import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;

// API base URL
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roleInfo, setRoleInfo] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const storedRoleInfo = localStorage.getItem('roleInfo');

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        if (storedRoleInfo) {
          setRoleInfo(JSON.parse(storedRoleInfo));
        }
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
        withCredentials: true
      });
      const { user, accessToken, refreshToken, roleInfo, dashboardUrl } = response.data.data;
      
      // Store auth data
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', accessToken);
      localStorage.setItem('accessToken', accessToken); // For compatibility
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('roleInfo', JSON.stringify(roleInfo));
      if (dashboardUrl) {
        localStorage.setItem('dashboardUrl', dashboardUrl);
      }
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      setRoleInfo(roleInfo);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setLoading(false);
      return response.data.data;
    } catch (error) {
      setLoading(false);
      
      // Better error handling for network/CORS issues
      if (error.message === 'Network Error') {
        console.error('Network Error: Possibly a CORS issue or server is not running');
        throw new Error('Connection error: Please ensure the server is running and CORS is properly configured.');
      } 
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Call logout API if needed
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage and state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('roleInfo');
      localStorage.removeItem('dashboardUrl');
      
      // Clear axios default header
      delete axios.defaults.headers.common['Authorization'];
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      setRoleInfo(null);
      setLoading(false);
    }
  };

  // Request password reset function
  const resetPassword = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password/request`, { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.message === 'Network Error') {
        throw new Error('Connection error: Please ensure the server is running and CORS is properly configured.');
      } else {
        throw new Error('Failed to send password reset link. Please try again later.');
      }
    }
  };

  // Reset password with token function
  const confirmPasswordReset = async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password/confirm`, {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.message === 'Network Error') {
        throw new Error('Connection error: Please ensure the server is running and CORS is properly configured.');
      } else {
        throw new Error('Failed to reset password. Please try again later.');
      }
    }
  };

  // Change password when logged in
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to change your password');
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.message === 'Network Error') {
        throw new Error('Connection error: Please ensure the server is running and CORS is properly configured.');
      } else {
        throw new Error('Failed to change password. Please try again later.');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        roleInfo,
        login,
        logout,
        resetPassword,
        confirmPasswordReset,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 