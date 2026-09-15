import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Passwords no longer exist — login is mobile OTP only, so "forgot
// password" has nothing to do anymore. Kept only so any existing
// navigation.navigate('ForgotPassword') calls don't break.
export default function ForgotPasswordScreen({ navigation }) {
  useEffect(() => {
    navigation.replace('Login');
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' }}>
      <ActivityIndicator size="large" color="#D82B76" />
    </View>
  );
}
