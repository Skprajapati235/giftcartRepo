import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, handleApiError } from '../api/apiClient';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('@giftcart_token');
        const rawUser = await AsyncStorage.getItem('@giftcart_user');
        if (token && rawUser) {
          setAuthToken(token);
          setUser(JSON.parse(rawUser));
        }
      } catch (err) {
        console.warn('Restore auth failed', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const saveSession = async (token, userData) => {
    await AsyncStorage.setItem('@giftcart_token', token);
    await AsyncStorage.setItem('@giftcart_user', JSON.stringify(userData));
    setAuthToken(token);
    setUser(userData);
  };

  const signIn = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      await saveSession(data.token, data.user);
      return data;
    } catch (error) {
      const err = handleApiError(error);
      Alert.alert('Login failed', err.message);
      throw err;
    }
  };

  const signUp = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      return data;
    } catch (error) {
      const err = handleApiError(error);
      Alert.alert('Registration failed', err.message);
      throw err;
    }
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(['@giftcart_token', '@giftcart_user']);
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
