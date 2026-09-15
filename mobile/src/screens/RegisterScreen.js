import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Registration is no longer a separate step — entering your name + mobile
// number on the Login screen and verifying the OTP creates the account
// automatically if it doesn't exist yet. This screen is kept only so any
// existing navigation.navigate('Register') calls don't break.
export default function RegisterScreen({ navigation }) {
  useEffect(() => {
    navigation.replace('Login');
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' }}>
      <ActivityIndicator size="large" color="#D82B76" />
    </View>
  );
}
