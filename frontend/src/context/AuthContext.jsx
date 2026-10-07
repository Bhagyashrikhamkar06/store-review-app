import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('storepulse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('storepulse_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token with storage
  useEffect(() => {
    if (token) {
      localStorage.setItem('storepulse_token', token);
    } else {
      localStorage.removeItem('storepulse_token');
    }
  }, [token]);

  // Sync user with storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('storepulse_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('storepulse_user');
    }
  }, [user]);

  // Verify session on app load
  useEffect(() => {
    const checkSession = async () => {
      const savedToken = localStorage.getItem('storepulse_token');
      if (savedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Session check failed or expired:', err.message);
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Login failed.');
  };

  const register = async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Registration failed.');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const res = await apiClient.put('/auth/update-password', { currentPassword, newPassword });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('storepulse_token');
    localStorage.removeItem('storepulse_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        updatePassword,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
