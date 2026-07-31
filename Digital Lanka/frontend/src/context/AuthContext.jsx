import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    id: null,
    role: null,
    nic: null,
    fullName: null,
    isAuthenticated: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Configure Axios defaults when authState changes
  useEffect(() => {
    if (authState.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

  const login = async (nic, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { nic, password });
      const { token, id, role, fullName } = response.data;
      
      setAuthState({
        token,
        id,
        role,
        nic,
        fullName,
        isAuthenticated: true
      });
      setIsLoading(false);
      return { success: true, role };
    } catch (error) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'Login failed. Please verify credentials.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setAuthState({
      token: null,
      id: null,
      role: null,
      nic: null,
      fullName: null,
      isAuthenticated: false
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
