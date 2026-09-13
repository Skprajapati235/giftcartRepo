import React, { useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

// Wrap any screen that should only be reachable while logged in
// (Checkout, Profile, Orders, Wishlist, ...). Everything else in the app
// (Home, product pages, categories, cart) stays open to guests — this is
// the only place login is enforced, and only when the person actually
// tries to open one of these screens.
export default function withAuthGuard(ScreenComponent, screenName) {
  return function GuardedScreen(props) {
    const { user, loading } = useContext(AuthContext);
    const { navigation } = props;

    useEffect(() => {
      if (!loading && !user) {
        navigation.replace('Login', { redirectTo: screenName, redirectParams: props.route?.params });
      }
    }, [loading, user]);

    if (loading || !user) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' }}>
          <ActivityIndicator size="large" color="#D82B76" />
        </View>
      );
    }

    return <ScreenComponent {...props} />;
  };
}
