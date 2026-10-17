// PATH: mobile/src/utils/secureToken.js
//
// Stores the login token in the phone's secure storage (Android Keystore / iOS
// Keychain) instead of plain AsyncStorage. Existing logged-in users are migrated
// automatically the first time the token is read, so nobody gets logged out.
//
// Needs:  npx expo install expo-secure-store

import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStore = null;
try {
  // eslint-disable-next-line global-require
  SecureStore = require('expo-secure-store');
} catch (e) {
  SecureStore = null; // package not installed (or web) → falls back to AsyncStorage
}

const KEY = 'giftcart_token'; // SecureStore keys can't contain "@"
const LEGACY_KEY = '@giftcart_token';

export async function getToken() {
  try {
    if (SecureStore?.getItemAsync) {
      const secure = await SecureStore.getItemAsync(KEY);
      if (secure) return secure;
    }
  } catch (e) {
    // fall through to legacy storage
  }

  const legacy = await AsyncStorage.getItem(LEGACY_KEY);
  if (legacy && SecureStore?.setItemAsync) {
    try {
      await SecureStore.setItemAsync(KEY, legacy);
      await AsyncStorage.removeItem(LEGACY_KEY); // migrated
    } catch (e) {
      // keep legacy copy if secure write failed
    }
  }
  return legacy || null;
}

export async function setToken(token) {
  if (SecureStore?.setItemAsync) {
    try {
      await SecureStore.setItemAsync(KEY, token);
      await AsyncStorage.removeItem(LEGACY_KEY);
      return;
    } catch (e) {
      // fall back below
    }
  }
  await AsyncStorage.setItem(LEGACY_KEY, token);
}

export async function removeToken() {
  try {
    if (SecureStore?.deleteItemAsync) await SecureStore.deleteItemAsync(KEY);
  } catch (e) {
    // ignore
  }
  await AsyncStorage.removeItem(LEGACY_KEY);
}
