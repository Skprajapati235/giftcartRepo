import React, { createContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, handleApiError } from '../api/apiClient';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationSet, setLocationSet] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('@giftcart_token');
        const rawUser = await AsyncStorage.getItem('@giftcart_user');
        if (token && rawUser) {
          const userData = JSON.parse(rawUser);
          setAuthToken(token);
          setUser(userData);
          setLocationSet(!!(userData?.state && userData?.city));
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
    setLocationSet(!!(userData?.state && userData?.city));
  };

  const updateUser = async (userData) => {
    await AsyncStorage.setItem('@giftcart_user', JSON.stringify(userData));
    setUser(userData);
    setLocationSet(!!(userData?.state && userData?.city));
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
    setLocationSet(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, locationSet, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
