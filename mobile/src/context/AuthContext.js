import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, handleApiError } from '../api/apiClient';
import authService from '../services/authService';
import { useToast } from './ToastContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { showToast } = useToast();
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

  // Step 1 of the mobile OTP flow — sends the OTP, doesn't log anyone in yet.
  const sendOtp = async (name, mobileNumber) => {
    try {
      const response = await authService.sendOtp(name, mobileNumber);
      if (response.isOldUser) {
        await saveSession(response.token, response.user);
      }
      return response;
    } catch (error) {
      const err = handleApiError(error);
      if (err.message !== 'Name is required for new users') {
        showToast(err.message, 'error');
      }
      throw err;
    }
  };

  // Step 2 — verifying the OTP both logs an existing user in and creates a
  // brand-new account on the fly if this mobile number hasn't been seen
  // before. There's no separate "register" step anymore.
  const verifyOtp = async (mobileNumber, otp) => {
    try {
      const data = await authService.verifyOtp(mobileNumber, otp);
      await saveSession(data.token, data.user);
      return data;
    } catch (error) {
      const err = handleApiError(error);
      showToast(err.message, 'error');
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
    <AuthContext.Provider value={{ user, loading, locationSet, sendOtp, verifyOtp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
