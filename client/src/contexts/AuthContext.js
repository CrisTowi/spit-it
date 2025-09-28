import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setAuthToken(token);
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await apiService.verifyToken();
      setUser(response.user);
      setError(null);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      apiService.setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.login(email, password);

      // Store token and user data
      localStorage.setItem('token', response.token);
      apiService.setAuthToken(response.token);
      setUser(response.user);

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.register(name, email, password);

      // Store token and user data
      localStorage.setItem('token', response.token);
      apiService.setAuthToken(response.token);
      setUser(response.user);

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Error al registrarse';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    apiService.setAuthToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.updateProfile(profileData);
      setUser(response.user);

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Error al actualizar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.changePassword(currentPassword, newPassword);

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Error al cambiar contraseña';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (password) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.deleteAccount(password);
      logout();

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar cuenta';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
