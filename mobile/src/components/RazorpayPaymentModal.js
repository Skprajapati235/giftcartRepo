import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Full-screen secure Razorpay checkout (same mechanism as the shop checkout) as a reusable modal.
 *
 * payment = { key, amount (in paise), orderId, name, description, user: { name, email, phone } }
 * onSuccess({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
 * onFailed(message)   – the gateway reported a failed payment (customer can retry)
 * onCancel()          – popup dismissed / back pressed without paying
 */
export default function RazorpayPaymentModal({ visible, payment, onSuccess, onFailed, onCancel }) {
  const html = useMemo(() => {
    if (!payment) return '';
    const u = payment.user || {};
    return `
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
          function post(obj) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(obj));
            }
          }
          var options = {
            "key": ${JSON.stringify(payment.key)},
            "amount": ${JSON.stringify(payment.amount)},
            "currency": "INR",
            "name": ${JSON.stringify(payment.name || 'GiftFestive')},
            "description": ${JSON.stringify(payment.description || '')},
            "order_id": ${JSON.stringify(payment.orderId)},
            "theme": { "color": "#D82B76" },
            "prefill": {
              "name": ${JSON.stringify(u.name || '')},
              "email": ${JSON.stringify(u.email || '')},
              "contact": ${JSON.stringify(u.phone || '')}
            },
            "handler": function (response) {
              window.__rzpPaymentDone = true;
              post({
                status: 'success',
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              });
            },
            "modal": {
              "ondismiss": function () {
                if (!window.__rzpPaymentDone) post({ status: 'cancelled' });
              }
            }
          };
          try {
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', function (response) {
              post({ status: 'failed', error: (response && response.error && response.error.description) ? response.error.description : 'Payment failed' });
            });
            rzp1.open();
          } catch (e) {
            post({ status: 'failed', error: 'Could not open the payment gateway. Check your internet connection.' });
          }
        </script>
      </body>
    </html>`;
  }, [payment]);

  const handleMessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      onFailed?.('Invalid payment response');
      return;
    }
    if (data.status === 'success') onSuccess?.(data);
    else if (data.status === 'failed') onFailed?.(data.error || 'Payment failed');
    else if (data.status === 'cancelled') onCancel?.();
  };

  return (
    <Modal visible={!!visible} animationType="slide" onRequestClose={() => onCancel?.()}>
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onCancel?.()} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.title}>Secure Payment</Text>
          <View style={{ width: 40 }} />
        </View>
        {!!payment && (
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            onMessage={handleMessage}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color="#D82B76" />
              </View>
            )}
            mixedContentMode="always"
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
});
