import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, forgotPasswordApi, resetPasswordApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ba_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('ba_token') || null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('ba_user', JSON.stringify(user));
      localStorage.setItem('ba_token', token);
    } else {
      localStorage.removeItem('ba_user');
      localStorage.removeItem('ba_token');
    }
  }, [user, token]);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await loginUser(username, password);
      if (res.success && res.data) {
        setUser({
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          fullName: res.data.fullName,
          role: res.data.role || 'USER',
        });
        setToken(res.data.token || 'demo-auth-token-2026');
        setLoading(false);
        return { success: true };
      } else {
        setAuthError(res.message || 'Invalid username or password');
        setLoading(false);
        return { success: false, message: res.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await registerUser(userData);
      if (res.success && res.data) {
        setUser({
          id: res.data.id,
          username: res.data.username,
          email: res.data.email,
          fullName: res.data.fullName,
          role: res.data.role || 'USER',
        });
        setToken(res.data.token || 'demo-auth-token-2026');
        setLoading(false);
        return { success: true };
      } else {
        setAuthError(res.message || 'Registration failed');
        setLoading(false);
        return { success: false, message: res.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ba_user');
    localStorage.removeItem('ba_token');
  };

  const forgotPassword = async (email) => {
    return await forgotPasswordApi(email);
  };

  const resetPassword = async (resetToken, newPassword) => {
    return await resetPasswordApi(resetToken, newPassword);
  };

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
