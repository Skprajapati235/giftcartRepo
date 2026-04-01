import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import orderService from '../services/orderService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen({ navigation, route }) {
  const { cartItems, total } = route.params;
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  
  // Shipping Address Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    pinCode: '',
  });

  const handleCheckout = async () => {
    // Validate Form
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.pinCode) {
      Alert.alert('Incomplete Info', 'Please fill all shipping details.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems,
        totalAmount: total,
        shippingAddress: shippingInfo,
      };
      
      const res = await orderService.createOrder(orderData);
      setPaymentData({
          orderId: res.razorpayOrder.id,
          amount: res.razorpayOrder.amount,
          key: 'rzp_test_SYHDfSdbJm7SOc',
          name: 'GiftCart',
          description: 'Payment for your order',
          user: {
              name: user.name,
              email: user.email,
          }
      });
      setShowWebView(true);
    } catch (error) {
      Alert.alert('Error', 'Could not initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  const onMessage = async (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setShowWebView(false);
    
    if (data.status === 'success') {
      setLoading(true);
      try {
        await orderService.verifyPayment({
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
        });
        
        // Remove only ordered items from cart
        const raw = await AsyncStorage.getItem('@giftcart_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const orderedIds = cartItems.map(i => i._id);
        const nextCart = cart.filter(i => !orderedIds.includes(i._id));
        await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(nextCart));

        Alert.alert('Success', 'Order placed successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } catch (err) {
        Alert.alert('Error', 'Payment verification failed.');
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert('Cancelled', 'Payment was cancelled or failed.');
    }
  };

  const razorpayHtml = paymentData ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          var options = {
            "key": "${paymentData.key}",
            "amount": "${paymentData.amount}",
            "currency": "INR",
            "name": "${paymentData.name}",
            "description": "${paymentData.description}",
            "order_id": "${paymentData.orderId}",
            "handler": function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'success',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }));
            },
            "prefill": {
              "name": "${paymentData.user.name}",
              "email": "${paymentData.user.email}"
            },
            "modal": {
              "ondismiss": function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
              }
            }
          };
          var rzp1 = new Razorpay(options);
          rzp1.open();
        </script>
      </body>
    </html>
  ` : '';

  if (showWebView) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowWebView(false)}>
                <Ionicons name="close" size={30} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Secure Payment</Text>
            <View style={{ width: 30 }} />
        </View>
        <WebView 
          originWhitelist={['*']}
          source={{ html: razorpayHtml }}
          onMessage={onMessage}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressForm}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={shippingInfo.fullName}
              onChangeText={(t) => setShippingInfo({...shippingInfo, fullName: t})}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={shippingInfo.phone}
              onChangeText={(t) => setShippingInfo({...shippingInfo, phone: t})}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Full Address (House No, Street, Landmark)"
              multiline
              value={shippingInfo.address}
              onChangeText={(t) => setShippingInfo({...shippingInfo, address: t})}
            />
            <TextInput
              style={styles.input}
              placeholder="Pin Code"
              keyboardType="number-pad"
              value={shippingInfo.pinCode}
              onChangeText={(t) => setShippingInfo({...shippingInfo, pinCode: t})}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary ({cartItems.length} items)</Text>
          <View style={styles.summaryCard}>
            {cartItems.map((item, idx) => (
              <View key={item._id + idx} style={styles.orderItem}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.salePrice || item.price}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalPrice}>₹{total}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.payBtn, loading && { opacity: 0.7 }]} 
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payBtnText}>Proceed to Pay ₹{total}</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '800', color: '#000' },
  content: { padding: 20 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#555', marginBottom: 15 },
  addressForm: { gap: 12 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#333',
  },
  summaryCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, elevation: 2 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { flex: 1, fontSize: 14, color: '#666', marginRight: 10 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#000' },
  totalPrice: { fontSize: 18, fontWeight: '800', color: '#D82B76' },
  payBtn: { backgroundColor: '#D82B76', borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginTop: 10, elevation: 3 },
  payBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
});
