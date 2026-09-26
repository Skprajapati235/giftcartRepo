import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import couponService from '../services/couponService';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../context/ToastContext';
import { SafeScreen, ScreenHeader, StickyBottomBar } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import useDeliveryHours from '../hooks/useDeliveryHours';
import { colors, shadows } from '../constants/theme';

export default function CheckoutScreen({ navigation, route }) {
  // cartItems + totals come straight from the backend cart (see
  // CartScreen) — nothing here recalculates price, tax, shipping or
  // discount, it only reads what the backend already computed.
  const { cartItems, totals: cartTotals } = route.params;
  const { user } = useContext(AuthContext);
  const { removeFromCart } = useCart();
  const { showToast } = useToast();
  const deliveryHours = useDeliveryHours();
  const isOrderBlocked = Boolean(deliveryHours.isCurrentlyRestricted || deliveryHours.blockOrders);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const paymentHandledRef = useRef(false);
  const createdOrderIdRef = useRef(null);
  const { bottom } = useLayoutInsets();

  // Shipping Address Form State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    phone: '',
    houseNo: '',
    street: '',
    pinCode: '',
    landmark: '',
  });
  const [savedAddress, setSavedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location permission to fetch your address.');
        return;
      }

      setLocationLoading(true);
      let location = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        setShippingInfo({
          ...shippingInfo,
          houseNo: addr.name || addr.district || '',
          street: addr.street || addr.subregion || addr.city || '',
          pinCode: addr.postalCode || '',
          landmark: addr.name !== addr.street ? addr.name : '',
        });
        showToast('Location fetched successfully!', 'success');
      }
    } catch (error) {
      showToast('Error fetching location', 'error');
    } finally {
      setLocationLoading(false);
    }
  };

  // Load saved address on mount
  React.useEffect(() => {
    const loadSavedAddress = async () => {
      try {
        const savedList = await AsyncStorage.getItem('@giftcart_saved_addresses');
        if (savedList) {
          const list = JSON.parse(savedList);
          if (list.length > 0) {
            const addr = list[0];
            setSavedAddress(addr);
            setShippingInfo(addr); // Pre-fill form too
            setShowAddressForm(false);
            return;
          }
        }

        const raw = await AsyncStorage.getItem('@giftcart_saved_address');
        if (raw) {
          const addr = JSON.parse(raw);
          setSavedAddress(addr);
          setShippingInfo(addr);
          setShowAddressForm(false);
        } else {
          setShowAddressForm(true);
        }
      } catch (e) {
        setShowAddressForm(true);
      }
    };
    loadSavedAddress();
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      const res = await couponService.getActiveCoupons({ limit: 50 });
      setActiveCoupons(res.data || []);
    } catch (err) {
      console.log('Error fetching active coupons:', err);
    }
  };

  const allItemsCodAvailable = cartItems.every(item => item.isCodAvailable !== false);

  React.useEffect(() => {
    if (!allItemsCodAvailable && paymentMethod === 'COD') {
      setPaymentMethod('Online');
    }
  }, [allItemsCodAvailable, paymentMethod]);

  const orderSummary = {
    subtotal: cartTotals.subTotal,
    savingsTotal: cartTotals.totalDiscount,
    taxTotal: cartTotals.totalTax,
    shippingTotal: cartTotals.totalShipping,
    grandTotal: cartTotals.grandTotal,
  };

  const displayTotal = Number(orderSummary.grandTotal.toFixed(2));
  const finalTotal = Number((displayTotal - couponDiscount).toFixed(2));

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      showToast('Please enter a coupon code', 'warning');
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await couponService.validateCoupon({
        code: couponCode,
        amount: displayTotal
      });
      setCouponDiscount(res.discountAmount);
      setAppliedCoupon(res.coupon);
      showToast('Coupon applied successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      showToast(msg, 'error');
      setCouponDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (isOrderBlocked) {
      Alert.alert(
        '🌙 Night Delivery Paused',
        deliveryHours.message || `Orders cannot be placed right now. Delivery will resume after ${deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate Form
    // Validation is handled below after resolving active address

    const activeAddress = showAddressForm ? shippingInfo : (savedAddress || shippingInfo);
    const { fullName: fn, phone: ph, houseNo: hn, street: st, pinCode: pc } = activeAddress;
    if (!fn || !ph || !hn || !st || !pc) {
      showToast('Please fill all required shipping details', 'warning');
      return;
    }

    const fullAddress = `${hn}, ${st}${activeAddress.landmark ? `, Near ${activeAddress.landmark}` : ''}`;
    const finalShippingInfo = { ...activeAddress, address: fullAddress };

    // Save address for next time
    try {
      await AsyncStorage.setItem('@giftcart_saved_address', JSON.stringify(finalShippingInfo));
      setSavedAddress(finalShippingInfo);
    } catch (e) { }

    setLoading(true);
    try {
      const orderData = {
        // Backend recalculates price/discount/tax/shipping/itemTotal from
        // live product data (see orderService.createOrder on the
        // backend) — this is just which product+variant+quantity was
        // ordered, so the charged amount always matches what the cart
        // already showed.
        items: cartItems.map((item) => ({
          _id: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          salePrice: item.salePrice ?? item.price,
          tax: item.tax || 0,
          shippingCost: item.shippingCost || 0,
          discount: item.discount || 0,
          isCodAvailable: item.isCodAvailable,
          isEggless: item.isEggless || false,
          deliveryTime: item.deliveryTime,
          expectedDeliveryDate: item.expectedDeliveryDate,
          flavor: item.flavor,
          weight: item.weight,
          flowerCount: item.flowerCount,
        })),
        totalAmount: finalTotal,
        shippingAddress: finalShippingInfo,
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        discountAmount: couponDiscount,
      };

      const res = await orderService.createOrder(orderData);
      const orderId = res?.order?._id || res?.data?._id || res?._id;
      createdOrderIdRef.current = orderId;

      if (paymentMethod === 'COD') {
        // Trigger confirmation email (same as giftfestive website)
        if (orderId) {
          orderService.sendOrderEmail(orderId);
        }

        // For COD, directly mark as success
        await Promise.all(cartItems.map((item) => removeFromCart(item)));

        showToast('🎉 Order placed successfully! Check your email for confirmation.', 'success');
        setTimeout(() => navigation.navigate('MyOrders'), 1500);
      } else {
        const razorpayKey = res.razorpayKeyId;
        if (!razorpayKey || !res.razorpayOrder?.id) {
          showToast('Online payment is not configured. Please try COD or contact support.', 'error');
          return;
        }
        paymentHandledRef.current = false;
        setPaymentData({
          orderId: res.razorpayOrder.id,
          amount: res.razorpayOrder.amount,
          key: razorpayKey,
          name: 'GiftFestive',
          description: 'Payment for your order',
          user: {
            name: user?.name || finalShippingInfo?.fullName || 'Customer',
            email: user?.email || '',
            phone: finalShippingInfo?.phone || user?.mobileNumber || user?.phone || '',
          },
        });
        setShowWebView(true);
      }
    } catch (error) {
      if (error?.response?.data?.isDeliveryRestricted || error?.response?.status === 403) {
        Alert.alert(
          '🌙 Night Delivery Paused',
          error.response?.data?.message || deliveryHours.message || `Orders cannot be placed during night hours. Delivery resumes after ${deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}.`,
          [{ text: 'OK' }]
        );
        return;
      }
      const errorMsg = error?.message || 'Could not place order';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onMessage = async (event) => {
    let data;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      showToast('Invalid payment response', 'error');
      setShowWebView(false);
      return;
    }

    if (data.status === 'success') {
      if (paymentHandledRef.current) return;
      paymentHandledRef.current = true;
      setShowWebView(false);
      setLoading(true);
      try {
        const verifyRes = await orderService.verifyPayment({
          razorpay_order_id: data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
        });

        // Trigger confirmation email (same as giftfestive website)
        const finalOrderId = verifyRes?.orderId || createdOrderIdRef.current;
        if (finalOrderId) {
          orderService.sendOrderEmail(finalOrderId);
        }

        await Promise.all(cartItems.map((item) => removeFromCart(item)));

        showToast('🎉 Payment successful! Order placed. Check your email for confirmation.', 'success');
        setTimeout(() => navigation.navigate('MyOrders'), 1500);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Payment verification failed';
        console.error('Payment verify error:', msg, err.response?.data);
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (data.status === 'failed') {
      if (paymentHandledRef.current) return;
      setShowWebView(false);
      showToast(data.error || 'Payment failed', 'error');
      return;
    }

    if (data.status === 'cancelled') {
      if (paymentHandledRef.current) return;
      setShowWebView(false);
      showToast('Payment cancelled', 'warning');
    }
  };

  const razorpayHtml = paymentData ? `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body { margin: 0; padding: 0; background-color: #FAFAFA; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .loader { text-align: center; color: #D82B76; font-size: 16px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="loader">Opening secure payment gateway...</div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          window.__rzpPaymentDone = false;
          var options = {
            "key": ${JSON.stringify(paymentData.key)},
            "amount": ${JSON.stringify(paymentData.amount)},
            "currency": "INR",
            "name": ${JSON.stringify(paymentData.name)},
            "description": ${JSON.stringify(paymentData.description)},
            "order_id": ${JSON.stringify(paymentData.orderId)},
            "theme": { "color": "#D82B76" },
            "prefill": {
              "name": ${JSON.stringify(paymentData.user.name || '')},
              "email": ${JSON.stringify(paymentData.user.email || '')},
              "contact": ${JSON.stringify(paymentData.user.phone || '')}
            },
            "handler": function (response) {
              window.__rzpPaymentDone = true;
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  status: 'success',
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                }));
              }
            },
            "modal": {
              "ondismiss": function() {
                if (!window.__rzpPaymentDone) {
                  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
                  }
                }
              }
            }
          };
          var rzp1 = new Razorpay(options);
          rzp1.on('payment.failed', function(response) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'failed',
                error: (response && response.error && response.error.description) ? response.error.description : 'Payment failed'
              }));
            }
          });
          rzp1.open();
        </script>
      </body>
    </html>
  ` : '';

  if (showWebView) {
    return (
      <SafeScreen style={{ flex: 1, backgroundColor: '#FFF' }}>
        <ScreenHeader title="Secure Payment" onBack={() => setShowWebView(false)} border />
        <WebView
          originWhitelist={['*']}
          source={{ html: razorpayHtml }}
          onMessage={onMessage}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="always"
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} border />

      {deliveryHours.isCurrentlyRestricted && (
        <View style={styles.checkoutWarningBanner}>
          <Text style={{ fontSize: 20 }}>🌙</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkoutWarningTitle}>
              Night Delivery Paused — Resumes {deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}
            </Text>
            <Text style={styles.checkoutWarningDesc}>
              Checkout and order placement are temporarily paused during night hours. You can review items and prepare your address. Deliveries resume after {deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}.
            </Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.scrollFlex} contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          {/* Saved Address Card */}
          {savedAddress && !showAddressForm && (
            <View style={styles.savedAddressCard}>
              <View style={styles.savedAddressTop}>
                <View style={styles.savedAddressBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                  <Text style={styles.savedAddressBadgeText}>Delivering To</Text>
                </View>
                <TouchableOpacity
                  style={styles.changeAddressBtn}
                  onPress={() => {
                    setShippingInfo({ ...savedAddress });
                    setShowAddressForm(true);
                  }}
                >
                  <Ionicons name="pencil-outline" size={13} color="#D82B76" />
                  <Text style={styles.changeAddressBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.savedName}>{savedAddress.fullName}</Text>
              <Text style={styles.savedPhone}>{savedAddress.phone}</Text>
              <Text style={styles.savedAddr}>
                {savedAddress.houseNo}, {savedAddress.street}
                {savedAddress.landmark ? `, Near ${savedAddress.landmark}` : ''}
              </Text>
              <Text style={styles.savedPin}>PIN: {savedAddress.pinCode}</Text>
            </View>
          )}

          {/* New Address Form */}
          {showAddressForm && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#555' }}>
                  {savedAddress ? 'Enter new address' : 'Enter delivery address'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {savedAddress && (
                    <TouchableOpacity
                      onPress={() => setShowAddressForm(false)}
                      style={[styles.locationBtn, { backgroundColor: '#6B7280' }]}
                    >
                      <Text style={styles.locationBtnText}>Use Saved</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.locationBtn}
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="location-outline" size={13} color="#FFF" />
                        <Text style={styles.locationBtnText}>My Location</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.addressForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name (Required)"
                  value={shippingInfo.fullName}
                  onChangeText={(t) => setShippingInfo({ ...shippingInfo, fullName: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (Required)"
                  keyboardType="phone-pad"
                  value={shippingInfo.phone}
                  onChangeText={(t) => setShippingInfo({ ...shippingInfo, phone: t })}
                />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="House / Flat No (Req)"
                    value={shippingInfo.houseNo}
                    onChangeText={(t) => setShippingInfo({ ...shippingInfo, houseNo: t })}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Pin Code (Req)"
                    keyboardType="number-pad"
                    value={shippingInfo.pinCode}
                    onChangeText={(t) => setShippingInfo({ ...shippingInfo, pinCode: t })}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Street / Area / Colony (Required)"
                  value={shippingInfo.street}
                  onChangeText={(t) => setShippingInfo({ ...shippingInfo, street: t })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Landmark / Nearby (Optional)"
                  value={shippingInfo.landmark}
                  onChangeText={(t) => setShippingInfo({ ...shippingInfo, landmark: t })}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers & Coupons</Text>
          <View style={styles.couponContainer}>
            <View style={styles.couponInputWrapper}>
              <Ionicons name="pricetag-outline" size={20} color="#666" style={{ marginLeft: 15 }} />
              <TextInput
                style={styles.couponInput}
                placeholder="Enter Promo Code"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                value={couponCode}
                onChangeText={setCouponCode}
                editable={!appliedCoupon}
              />
              {appliedCoupon ? (
                <TouchableOpacity
                  onPress={() => {
                    setAppliedCoupon(null);
                    setCouponDiscount(0);
                    setCouponCode('');
                  }}
                  style={styles.removeCoupon}
                >
                  <Ionicons name="close-circle" size={24} color="#D82B76" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleApplyCoupon}
                  style={styles.applyBtn}
                  disabled={validatingCoupon}
                >
                  {validatingCoupon ? (
                    <ActivityIndicator size="small" color="#D82B76" />
                  ) : (
                    <Text style={styles.applyBtnText}>APPLY</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {appliedCoupon ? (
              <Text style={styles.appliedMsg}>
                Yayy! You saved ₹{couponDiscount} with {appliedCoupon}
              </Text>
            ) : (
              <TouchableOpacity onPress={() => setShowCouponModal(true)}>
                <Text style={styles.viewAllCoupons}>View All Coupons</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Coupons Modal */}
        <Modal
          visible={showCouponModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCouponModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Available Offers</Text>
                <TouchableOpacity onPress={() => setShowCouponModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {activeCoupons.length > 0 ? activeCoupons.map((item) => (
                  <View key={item._id} style={styles.couponItemNew}>
                    {item.image && (
                      <Image source={{ uri: item.image }} style={styles.modalCouponImg} />
                    )}
                    <View style={styles.couponDetailBox}>
                      <View style={styles.couponItemHeader}>
                        <View style={styles.couponTag}>
                          <Ionicons name="pricetag" size={14} color="#D82B76" />
                          <Text style={styles.couponTagText}>{item.code}</Text>
                        </View>
                        <Text style={styles.couponValue}>
                          Save {item.discountType === 'percentage' ? `${item.discountValue}%` : `₹${item.discountValue}`}
                        </Text>
                      </View>
                      <Text style={styles.couponMinOrderModal}>Valid on orders above ₹{item.minOrderAmount}</Text>
                      <TouchableOpacity
                        style={styles.modalApplyBtn}
                        onPress={() => {
                          setCouponCode(item.code);
                          setShowCouponModal(false);
                        }}
                      >
                        <Text style={styles.modalApplyBtnText}>APPLY CODE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )) : (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#999' }}>No coupons available right now.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary ({cartItems.length} items)</Text>
          <View style={styles.summaryCard}>
            {cartItems.map((item, idx) => {
              const quantity = Number(item.quantity || 1);
              const mrp = Number(item.price || 0);
              const salePrice = Number(item.salePrice ?? item.price ?? 0);
              const tax = Number(item.tax || 0);
              const shippingCost = Number(item.shippingCost || 0);
              // Every number below (including itemTotal) came straight
              // from the backend cart response — nothing recomputed here.
              const taxAmount = Number(item.taxAmount || 0);
              const itemTotal = item.itemTotal;
              const hasSaving = mrp > salePrice;

              return (
                <View key={item.variantKey || item._id || idx} style={styles.orderItem}>
                  <View style={styles.orderItemLeft}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2, marginBottom: 4, flexWrap: 'wrap' }}>
                      {item.isEggless && (
                        <Text style={{ fontSize: 10, color: '#D82B76', fontWeight: '800', backgroundColor: '#FFF0F5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' }}>
                          Eggless
                        </Text>
                      )}
                      {item.flavor && (
                        <Text style={{ fontSize: 10, color: '#0369A1', fontWeight: '800', backgroundColor: '#E0F2FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' }}>
                          {item.flavor?.name || item.flavor}
                        </Text>
                      )}
                      {item.weight && (
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '800', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' }}>
                          {item.weight}
                        </Text>
                      )}
                      {item.flowerCount && (
                        <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '800', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' }}>
                          {item.flowerCount}
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.itemMeta}>Qty {quantity} · ₹{salePrice} each</Text>
                      {hasSaving && <Text style={{ fontSize: 11, color: '#CBD5E1', textDecorationLine: 'line-through' }}>₹{mrp}</Text>}
                    </View>
                    {tax > 0 && <Text style={styles.itemMeta}>Tax {tax}%  (+₹{taxAmount.toFixed(2)})</Text>}
                    {shippingCost > 0 && <Text style={styles.itemMeta}>Shipping +₹{shippingCost}</Text>}
                  </View>
                  <Text style={styles.itemPrice}>₹{itemTotal}</Text>
                </View>
              );
            })}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items Total</Text>
              <Text style={styles.summaryValue}>₹{orderSummary.subtotal.toFixed(2)}</Text>
            </View>
            {orderSummary.taxTotal > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>₹{orderSummary.taxTotal.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Cost</Text>
              <Text style={styles.summaryValue}>{orderSummary.shippingTotal > 0 ? `₹${orderSummary.shippingTotal.toFixed(2)}` : 'FREE'}</Text>
            </View>
            {couponDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#D82B76', fontWeight: 'bold' }]}>Coupon Discount</Text>
                <Text style={[styles.summaryValue, { color: '#D82B76' }]}>-₹{couponDiscount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalPrice}>₹{finalTotal}</Text>
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

      </ScrollView>

      <StickyBottomBar>
        <TouchableOpacity
          style={[
            styles.payBtn,
            (loading || isOrderBlocked) && { opacity: 0.85 },
            isOrderBlocked && styles.payBtnPaused,
          ]}
          onPress={handleCheckout}
          disabled={loading || isOrderBlocked}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.payBtnText, isOrderBlocked && styles.payBtnTextPaused]}>
              {isOrderBlocked
                ? `🌙 Delivery Paused (Resumes ${deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'})`
                : (paymentMethod === 'COD' ? 'Place Order (Cash on Delivery)' : 'Pay Now ₹' + finalTotal)}
            </Text>
          )}
        </TouchableOpacity>
      </StickyBottomBar>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollFlex: { flex: 1 },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandCreamAlt,
    borderWidth: 1,
    borderColor: colors.borderRose,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  locationBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  title: { fontSize: 20, fontWeight: '900', color: colors.brandBerry },
  content: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: colors.brandBerry, marginBottom: 12 },
  addressForm: { gap: 10 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13.5,
    color: colors.textDark,
  },
  summaryCard: {
    backgroundColor: colors.brandCream,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    ...shadows.sm,
  },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderItemLeft: { flex: 1, paddingRight: 10 },
  itemName: { fontSize: 13.5, color: colors.textDark, marginBottom: 3, fontWeight: '800' },
  itemMeta: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  itemPrice: { fontSize: 13.5, fontWeight: '800', color: colors.brandBerry },
  divider: { height: 1, backgroundColor: colors.borderWarm, marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 12.5, color: colors.textMuted, fontWeight: '600' },
  summaryValue: { fontSize: 13, fontWeight: '800', color: colors.textDark },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '900', color: colors.brandBerry },
  totalPrice: { fontSize: 18, fontWeight: '900', color: colors.brandBerry },
  paymentOptions: { flexDirection: 'row', gap: 12 },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  selectedOption: { borderColor: colors.brandBerry, backgroundColor: colors.brandCreamAlt },
  disabledPaymentOption: { opacity: 0.5, backgroundColor: '#F9F9F9' },
  paymentText: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginLeft: 8 },
  disabledText: { color: '#AAA' },
  selectedText: { color: colors.brandBerry, fontWeight: '900' },
  codNote: { fontSize: 11, color: colors.textMuted, marginTop: 6, fontStyle: 'italic' },
  payBtn: {
    backgroundColor: colors.brandBerry,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...shadows.button,
  },
  payBtnText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  // Coupon Styles
  couponContainer: {
    backgroundColor: colors.brandCream,
    borderRadius: 16,
    padding: 14,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
  },
  couponInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  couponInput: { flex: 1, paddingHorizontal: 12, fontSize: 13, fontWeight: '700', color: colors.textDark },
  applyBtn: { paddingHorizontal: 16, height: '100%', justifyContent: 'center' },
  applyBtnText: { color: colors.brandBerry, fontWeight: '900', fontSize: 12 },
  removeCoupon: { paddingHorizontal: 14 },
  appliedMsg: { marginTop: 8, color: '#16a34a', fontSize: 11.5, fontWeight: '800', marginLeft: 4 },
  viewAllCoupons: { marginTop: 8, color: colors.primary, fontSize: 12, fontWeight: '800', textDecorationLine: 'underline', marginLeft: 4 },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.brandBerry },
  couponItemNew: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: '#FFF',
    marginBottom: 12,
    ...shadows.sm,
  },
  modalCouponImg: { width: '100%', height: 110, resizeMode: 'cover' },
  couponDetailBox: { padding: 14 },
  couponItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  couponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandCreamAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  couponTagText: { color: colors.primary, fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  couponValue: { fontSize: 14, fontWeight: '900', color: colors.brandBerry },
  couponMinOrderModal: { fontSize: 10.5, color: colors.textMuted, fontWeight: '600', marginBottom: 12 },
  modalApplyBtn: { backgroundColor: colors.brandBerry, paddingVertical: 10, borderRadius: 10, alignItems: 'center', ...shadows.button },
  modalApplyBtnText: { color: '#FFF', fontWeight: '900', fontSize: 12 },
  // Saved Address Card
  savedAddressCard: {
    backgroundColor: colors.brandCream,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    padding: 14,
    marginBottom: 4,
  },
  savedAddressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedAddressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  savedAddressBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#16a34a',
    textTransform: 'uppercase',
  },
  changeAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: colors.borderRose,
    backgroundColor: colors.brandCreamAlt,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeAddressBtnText: { color: colors.brandBerry, fontSize: 11, fontWeight: '800' },
  savedName: { fontSize: 14, fontWeight: '900', color: colors.textDark, marginBottom: 2 },
  savedPhone: { fontSize: 12, color: colors.textMuted, fontWeight: '600', marginBottom: 4 },
  savedAddr: { fontSize: 12.5, color: colors.textDark, lineHeight: 18 },
  savedPin: { fontSize: 11.5, color: colors.brandBerry, fontWeight: '800', marginTop: 4 },
  payBtnPaused: {
    backgroundColor: '#475569',
  },
  checkoutWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21091a',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    gap: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  checkoutWarningTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFD166',
  },
  checkoutWarningDesc: {
    fontSize: 10.5,
    color: '#F3F4F6',
    marginTop: 2,
    lineHeight: 15,
  },
  payBtnPaused: {
    backgroundColor: '#3d0f2b',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  payBtnTextPaused: {
    color: '#FFD166',
    fontSize: 13,
  },
});
