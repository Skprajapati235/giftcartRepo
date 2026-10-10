import React, { useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { ToastProvider } from './src/context/ToastContext';
import { LoadingProvider } from './src/context/LoadingContext';
import AppNavigator from './src/navigation/AppNavigator';
import Loader from './src/components/loaders/Loader';
import FloatingWhatsAppShare from './src/components/FloatingWhatsAppShare';

export const navigationRef = createNavigationContainerRef();

function MainApp() {
  const { loading: authLoading } = useContext(AuthContext);
  const [splashVisible, setSplashVisible] = useState(true);

  return (
    <View style={styles.container}>
      <NavigationContainer ref={navigationRef}>
        <AppNavigator />
        <FloatingWhatsAppShare navigationRef={navigationRef} />
        <StatusBar style="dark" />
      </NavigationContainer>

      {/* Native Android Splash Screen overlay with smooth dissolve transition */}
      {splashVisible && (
        <Loader
          isAppReady={!authLoading}
          minDuration={1000}
          onFinish={() => setSplashVisible(false)}
        />
      )}
    </View>
  );
}

import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <LoadingProvider>
                  <MainApp />
                </LoadingProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
