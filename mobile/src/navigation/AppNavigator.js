import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import withAuthGuard from './withAuthGuard';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserEditProfileScreen from '../screens/UserEditProfileScreen';
import WishlistScreen from '../screens/WishlistScreen';
import CollectionsScreen from '../screens/CollectionsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import AddReviewScreen from '../screens/AddReviewScreen';
import OffersScreen from '../screens/OffersScreen';
import TermsPolicyScreen from '../screens/TermsPolicyScreen';
import SavedAddressesScreen from '../screens/SavedAddressesScreen';
import ManagePaymentsScreen from '../screens/ManagePaymentsScreen';
import DeveloperScreen from '../screens/DeveloperScreen';
import SupportScreen from '../screens/SupportScreen';

const Stack = createNativeStackNavigator();

// Screens that need a logged-in user. Everything not in this list is
// browsable as a guest — Home, product pages, categories, offers, cart.
const ProtectedCheckout = withAuthGuard(CheckoutScreen, 'Checkout');
const ProtectedProfile = withAuthGuard(ProfileScreen, 'Profile');
const ProtectedEditProfile = withAuthGuard(UserEditProfileScreen, 'EditProfile');
const ProtectedWishlist = withAuthGuard(WishlistScreen, 'Wishlist');
const ProtectedMyOrders = withAuthGuard(MyOrdersScreen, 'MyOrders');
const ProtectedOrderDetail = withAuthGuard(OrderDetailScreen, 'OrderDetail');
const ProtectedAddReview = withAuthGuard(AddReviewScreen, 'AddReview');
const ProtectedSavedAddresses = withAuthGuard(SavedAddressesScreen, 'SavedAddresses');
const ProtectedManagePayments = withAuthGuard(ManagePaymentsScreen, 'ManagePayments');

export default function AppNavigator() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#D82B76" />
      </View>
    );
  }

  // One single stack for everyone — logged in or not. Login is only
  // required at the moment someone opens a protected screen (see
  // withAuthGuard), never just to look around the app.
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FAFAFA' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Collections" component={CollectionsScreen} />
      <Stack.Screen name="TermsPolicy" component={TermsPolicyScreen} />
      <Stack.Screen name="Developer" component={DeveloperScreen} />
      <Stack.Screen name="CustomerSupport" component={SupportScreen} />

      {/* Guest-only entry points */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Login required */}
      <Stack.Screen name="Checkout" component={ProtectedCheckout} />
      <Stack.Screen name="Profile" component={ProtectedProfile} />
      <Stack.Screen name="EditProfile" component={ProtectedEditProfile} />
      <Stack.Screen name="Wishlist" component={ProtectedWishlist} />
      <Stack.Screen name="MyOrders" component={ProtectedMyOrders} />
      <Stack.Screen name="OrderDetail" component={ProtectedOrderDetail} />
      <Stack.Screen name="AddReview" component={ProtectedAddReview} />
      <Stack.Screen name="SavedAddresses" component={ProtectedSavedAddresses} />
      <Stack.Screen name="ManagePayments" component={ProtectedManagePayments} />
    </Stack.Navigator>
  );
}
