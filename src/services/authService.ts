import axios from 'axios';
import type { User, LoginCredentials, AuthResponse } from '../types/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // For development, simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          id: '1',
          name: 'Admin User',
          email: credentials.email,
          role: 'admin',
          permissions: ['read', 'write', 'admin']
        };
        const token = 'mock-jwt-token';
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        resolve({ user, token });
      }, 500);
    });
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  // Refresh token
  refreshToken: async (): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // For development, simulate token refresh
      return new Promise((resolve) => {
        setTimeout(() => {
          const newToken = 'new-mock-jwt-token';
          localStorage.setItem('token', newToken);
          resolve(newToken);
        }, 500);
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }
};