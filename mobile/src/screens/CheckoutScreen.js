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
  const [paymentMethod, setPaymentMethod] = useState('Online');
  
  // Shipping Address Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    pinCode: '',
  });

  const allItemsCodAvailable = cartItems.every(item => item.isCodAvailable !== false);

  React.useEffect(() => {
    if (!allItemsCodAvailable && paymentMethod === 'COD') {
      setPaymentMethod('Online');
    }
  }, [allItemsCodAvailable, paymentMethod]);

  const orderSummary = cartItems.reduce(
    (summary, item) => {
      const quantity = Number(item.quantity || 1);
      const basePrice = item.salePrice !== undefined && item.salePrice !== null ? Number(item.salePrice) : Number(item.price || 0);
      const discount = Number(item.discount || 0);
      const tax = Number(item.tax || 0);
      const shippingCost = Number(item.shippingCost || 0);
      const discountedPrice = basePrice * (1 - discount / 100);
      const taxAmount = discountedPrice * (tax / 100);
      const itemTotal = (discountedPrice + taxAmount + shippingCost) * quantity;

      return {
        subtotal: summary.subtotal + basePrice * quantity,
        discountTotal: summary.discountTotal + (basePrice - discountedPrice) * quantity,
        taxTotal: summary.taxTotal + taxAmount * quantity,
        shippingTotal: summary.shippingTotal + shippingCost * quantity,
        grandTotal: summary.grandTotal + itemTotal,
      };
    },
    { subtotal: 0, discountTotal: 0, taxTotal: 0, shippingTotal: 0, grandTotal: 0 }
  );

  const displayTotal = Number(orderSummary.grandTotal.toFixed(2));

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
        paymentMethod,
      };
      
      const res = await orderService.createOrder(orderData);
      
      if (paymentMethod === 'COD') {
        // For COD, directly mark as success
        const raw = await AsyncStorage.getItem('@giftcart_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const orderedIds = cartItems.map(i => i._id);
        const nextCart = cart.filter(i => !orderedIds.includes(i._id));
        await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(nextCart));

        Alert.alert('Success', 'Order placed successfully with Cash on Delivery!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        // Online payment
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
      }
    } catch (error) {
      Alert.alert('Error', 'Could not place order.');
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
            {cartItems.map((item, idx) => {
              const quantity = Number(item.quantity || 1);
              const basePrice = item.salePrice !== undefined && item.salePrice !== null ? Number(item.salePrice) : Number(item.price || 0);
              const discount = Number(item.discount || 0);
              const tax = Number(item.tax || 0);
              const shippingCost = Number(item.shippingCost || 0);
              const discountedPrice = basePrice * (1 - discount / 100);
              const taxAmount = Number((discountedPrice * (tax / 100)).toFixed(2));
              const itemTotal = Number(((discountedPrice + taxAmount + shippingCost) * quantity).toFixed(2));

              return (
                <View key={item._id + idx} style={styles.orderItem}>
                  <View style={styles.orderItemLeft}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemMeta}>Qty {quantity} · ₹{basePrice} each</Text>
                    {discount > 0 && <Text style={styles.itemMeta}>Discount {discount}%</Text>}
                    {tax > 0 && <Text style={styles.itemMeta}>Tax {tax}%</Text>}
                    {shippingCost > 0 && <Text style={styles.itemMeta}>Shipping ₹{shippingCost}</Text>}
                  </View>
                  <Text style={styles.itemPrice}>₹{itemTotal}</Text>
                </View>
              );
            })}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{orderSummary.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>-₹{orderSummary.discountTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>₹{orderSummary.taxTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>₹{orderSummary.shippingTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalPrice}>₹{displayTotal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'Online' && styles.selectedOption]}
              onPress={() => setPaymentMethod('Online')}
            >
              <Ionicons name="card-outline" size={20} color={paymentMethod === 'Online' ? '#D82B76' : '#666'} />
              <Text style={[styles.paymentText, paymentMethod === 'Online' && styles.selectedText]}>Online Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'COD' && styles.selectedOption,
                !allItemsCodAvailable && styles.disabledPaymentOption,
              ]}
              onPress={() => allItemsCodAvailable && setPaymentMethod('COD')}
              disabled={!allItemsCodAvailable}
            >
              <Ionicons name="cash-outline" size={20} color={paymentMethod === 'COD' ? '#D82B76' : '#666'} />
              <Text style={[styles.paymentText, paymentMethod === 'COD' && styles.selectedText, !allItemsCodAvailable && styles.disabledText]}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>
          {!allItemsCodAvailable && (
            <Text style={styles.codNote}>COD not available for some items in your cart.</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.payBtn, loading && { opacity: 0.7 }]} 
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payBtnText}>
              {paymentMethod === 'COD' ? 'Place Order (Cash on Delivery)' : 'Pay Now ₹' + displayTotal}
            </Text>
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
  orderItemLeft: { flex: 1, paddingRight: 10 },
  itemName: { fontSize: 14, color: '#666', marginBottom: 4, fontWeight: '700' },
  itemMeta: { fontSize: 12, color: '#888', marginBottom: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#555' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#111' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#000' },
  totalPrice: { fontSize: 18, fontWeight: '800', color: '#D82B76' },
  paymentOptions: { flexDirection: 'row', gap: 15 },
  paymentOption: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#DDD', borderRadius: 10, backgroundColor: '#FFF' },
  selectedOption: { borderColor: '#D82B76', backgroundColor: '#FFF5F8' },
  disabledPaymentOption: { opacity: 0.5, backgroundColor: '#F9F9F9' },
  paymentText: { fontSize: 14, fontWeight: '600', color: '#666', marginLeft: 8 },
  disabledText: { color: '#AAA' },
  selectedText: { color: '#D82B76' },
  codNote: { fontSize: 12, color: '#888', marginTop: 5, fontStyle: 'italic' },
  payBtn: { backgroundColor: '#D82B76', borderRadius: 12, paddingVertical: 18, alignItems: 'center', marginTop: 10, elevation: 3 },
  payBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
});
