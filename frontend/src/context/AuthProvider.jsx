import { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check validation on page load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('jwt_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify session is still valid with backend
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (err) {
          // Token expired or invalid, reset
          console.error('Session validation failed. Clearing credentials.', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log in a user
   * @param {string} identifier - Email or Username
   * @param {string} password
   */
  const login = async (identifier, password) => {
    try {
      const response = await api.post('/auth/login', { identifier, password });
      if (response.data.success) {
        const { token: userToken, user: userData } = response.data;
        
        localStorage.setItem('jwt_token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(userToken);
        setUser(userData);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please try again.';
    }
  };

  /**
   * Register a new user
   * @param {string} username 
   * @param {string} email 
   * @param {string} password 
   * @param {string} role 
   */
  const register = async (username, email, password, role) => {
    try {
      const response = await api.post('/auth/register', { username, email, password, role });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
    }
  };

  /**
   * Log out currently authenticated session
   */
  async function logout() {
    try {
      // Best effort notify backend of logout
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout notification to server failed:', err.message);
    } finally {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
