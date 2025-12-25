/**
 * Authentication Context
 *
 * Manages authentication state and provides auth methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  studioId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, studioName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user_data');

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (err) {
        console.error('Failed to parse user data:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });

      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        studioId: response.studioId,
      };

      // Store token and user data
      localStorage.setItem('auth_token', response.accessToken);
      localStorage.setItem('user_data', JSON.stringify(userData));

      setUser(userData);
    } catch (err: any) {
      console.error('Login failed:', err);
      throw new Error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const register = async (email: string, password: string, studioName: string) => {
    try {
      const response = await api.register({ email, password, studioName });

      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        studioId: response.studio.id,
      };

      // Store token and user data
      localStorage.setItem('auth_token', response.accessToken);
      localStorage.setItem('user_data', JSON.stringify(userData));

      setUser(userData);
    } catch (err: any) {
      console.error('Registration failed:', err);
      throw new Error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
