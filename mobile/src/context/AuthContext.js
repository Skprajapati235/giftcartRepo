import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, handleApiError } from '../api/apiClient';
import authService from '../services/authService';
import userService from '../services/userService';
import { useToast } from './ToastContext';

export const AuthContext = createContext();

// Single place that decides which field holds the profile picture.
// Everywhere else in the app can just read `user.image`.
const normalizeUser = (u) => {
  if (!u) return u;
  const image = u.profilePic || u.image || u.profilePicture || u.avatar || '';
  return { ...u, image };
};

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
          const userData = normalizeUser(JSON.parse(rawUser));
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
    const normalized = normalizeUser(userData);
    await AsyncStorage.setItem('@giftcart_token', token);
    await AsyncStorage.setItem('@giftcart_user', JSON.stringify(normalized));
    setAuthToken(token);
    setUser(normalized);
    setLocationSet(!!(normalized?.state && normalized?.city));

    // Carry over guest location if account has none saved yet (matching giftfestive-main)
    if (!normalized?.state || !normalized?.city) {
      try {
        const guestLocRaw = await AsyncStorage.getItem('@giftcart_guest_location');
        if (guestLocRaw) {
          const guestLoc = JSON.parse(guestLocRaw);
          if (guestLoc?.state && guestLoc?.city) {
            userService
              .updateProfile({ state: guestLoc.state, city: guestLoc.city })
              .then((updated) => {
                const updatedUser = updated?.data || updated?.user || updated;
                updateUser({ ...normalized, ...updatedUser, state: guestLoc.state, city: guestLoc.city });
                AsyncStorage.removeItem('@giftcart_guest_location').catch(() => {});
              })
              .catch(() => {});
          }
        }
      } catch (e) {}
    }
  };

  // Merges into existing user so individual updates (like profile pic or name) don't wipe other fields
  const updateUser = async (userData) => {
    const raw = userData?.data || userData?.user || userData;
    let nextUser;
    setUser((prev) => {
      nextUser = normalizeUser({ ...prev, ...raw });
      return nextUser;
    });
    if (nextUser) {
      await AsyncStorage.setItem('@giftcart_user', JSON.stringify(nextUser));
      setLocationSet(!!(nextUser?.state && nextUser?.city));
    }
    return nextUser;
  };

  // Step 1 of mobile OTP flow — sends OTP. If existing user, backend returns token + user immediately.
  const sendOtp = async (name, mobileNumber) => {
    try {
      const response = await authService.sendOtp(name, mobileNumber);
      if (response.isOldUser && response.token && response.user) {
        await saveSession(response.token, response.user);
      }
      return response;
    } catch (error) {
      const err = handleApiError(error);
      if (err.message !== 'Name is required for new users' && !err.message?.includes('Name is required')) {
        showToast(err.message, 'error');
      }
      throw err;
    }
  };

  // Step 2 — verifying OTP logs in existing user or creates new user on the fly.
  const verifyOtp = async (mobileNumber, otp) => {
    try {
      const data = await authService.verifyOtp(mobileNumber, otp);
      if (data.token && data.user) {
        await saveSession(data.token, data.user);
      }
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

