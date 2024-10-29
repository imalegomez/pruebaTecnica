import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Efecto para cargar el estado inicial de autenticación
  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setUserId(savedUserId);
      fetchUserInfo(savedUserId);
    }
    setIsAuthChecked(true);
  }, []);

  const fetchUserInfo = async (id) => {
    setIsLoadingUser(true);
    try {
      const response = await axios.get(`${API_URL}/users/${id}`);
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUserInfo(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, credentials);
      const { id } = response.data;
      updateUserId(id);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      const { id } = response.data;
      updateUserId(id);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  };

  const updateUserId = (id) => {
    setUserId(id);
    if (id) {
      localStorage.setItem('userId', id);
      fetchUserInfo(id);
    } else {
      localStorage.removeItem('userId');
      setUserInfo(null);
    }
  };

  const logout = () => {
    updateUserId(null);
  };

  if (!isAuthChecked) {
    return null;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        userId, 
        userInfo,
        isLoadingUser,
        setUserId: updateUserId,
        login,
        register,
        logout, 
        isAuthChecked 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};