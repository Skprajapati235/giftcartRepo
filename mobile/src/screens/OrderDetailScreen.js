import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Delivered':  return { color: '#00C853', icon: 'check-circle',   bg: '#E8F5E9' };
      case 'Cancelled':  return { color: '#FF3D00', icon: 'close-circle',   bg: '#FBE9E7' };
      case 'Processing': return { color: '#2979FF', icon: 'clock-outline',  bg: '#E3F2FD' };
      case 'Shipped':    return { color: '#FF9100', icon: 'truck-delivery', bg: '#FFF3E0' };
      default:           return { color: '#9E9E9E', icon: 'help-circle',    bg: '#F5F5F5' };
    }
  };

  const steps = ['Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status);
  const statusConfig = getStatusConfig(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Status Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.statusIconBox, { backgroundColor: statusConfig.bg }]}>
            <MaterialCommunityIcons name={statusConfig.icon} size={32} color={statusConfig.color} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroStatusText, { color: statusConfig.color }]}>Order {order.status}</Text>
            <Text style={styles.heroIdText}>#{order._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.heroDate}>{new Date(order.createdAt).toDateString()}</Text>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Tracking</Text>
          <View style={styles.timelineContainer}>
            {steps.map((step, index) => {
              const isCompleted = currentStepIndex >= index || order.status === 'Delivered';
              const isCancelled = order.status === 'Cancelled';
              const isLast = index === steps.length - 1;

              if (isCancelled && index > 0) return null;

              const getStepDate = (s) => {
                if (isCancelled && s === 'Processing') return order.cancelledAt;
                const d = s === 'Processing' ? order.processingAt
                        : s === 'Shipped'    ? order.shippedAt
                        : s === 'Delivered'  ? order.deliveredAt : null;
                if (!d) return null;
                const date = new Date(d);
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              };

              return (
                <View key={step} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, isCompleted && styles.dotActive]}>
                      {isCompleted && <Ionicons name="checkmark" size={10} color="#FFF" />}
                    </View>
                    {!isLast && <View style={[styles.timelineLine, isCompleted && styles.lineActive]} />}
                  </View>
                  <View style={styles.timelineRight}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[styles.timelineStepTitle, isCompleted && styles.textActive]}>
                        {isCancelled ? 'Order Cancelled' : step}
                      </Text>
                      {getStepDate(step) && <Text style={styles.timelineTime}>{getStepDate(step)}</Text>}
                    </View>
                    <Text style={styles.timelineStepDesc}>
                      {isCompleted ? `Your order has been ${isCancelled ? 'cancelled' : step.toLowerCase()}` : 'Pending'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Order Items</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{order.items?.length || 0}</Text>
            </View>
          </View>

          {order.items?.map((item, index) => {
            const product = item.product || {};
            const displayPrice = item.salePrice ?? item.price;

            return (
              <View key={index} style={[styles.itemRow, index === order.items.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.productImageBox}>
                  {product.image
                    ? <Image source={{ uri: product.image }} style={styles.productImage} />
                    : <Feather name="package" size={24} color="#DDD" />
                  }
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name || product.name || 'Gift Item'}</Text>

                  {/* Variant + Eggless + Flavor Badges */}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {item.isEggless && (
                      <View style={styles.variantBadge}>
                        <Text style={styles.variantBadgeText}>
                          Eggless
                        </Text>
                      </View>
                    )}
                    {item.flavor && (
                      <View style={[styles.variantBadge, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                        <Text style={[styles.variantBadgeText, { color: '#0369A1' }]}>
                          {item.flavor}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.itemMetaRow}>
                    <Text style={styles.productSub}>Qty: {item.quantity}</Text>
                    <Text style={styles.productPrice}>₹{displayPrice}</Text>
                  </View>

                  {item.expectedDeliveryDate && (
                    <View style={styles.deliveryBadgeOrder}>
                      <Feather name="truck" size={10} color="#D82B76" />
                      <Text style={styles.deliveryTextOrder}>Expected: {item.expectedDeliveryDate}</Text>
                    </View>
                  )}

                  {order.status === 'Delivered' && (
                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() => navigation.navigate('AddReview', { product, orderId: order._id })}
                    >
                      <Text style={styles.reviewBtnText}>Rate this product</Text>
                      <Feather name="star" size={12} color="#D82B76" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Payment + Shipping */}
        <View style={styles.horizontalRow}>
          <View style={[styles.miniCard, { marginRight: 10, flex: 1.5 }]}>
            <Text style={styles.miniTitle}>Shipping Address</Text>
            <Text style={styles.miniName}>{order.shippingAddress?.fullName}</Text>
            <Text style={styles.miniSubText}>
              {[order.shippingAddress?.houseNo, order.shippingAddress?.street].filter(Boolean).join(', ')
                || order.shippingAddress?.address}
            </Text>
            {order.shippingAddress?.landmark && (
              <Text style={styles.miniSubText}>Near {order.shippingAddress.landmark}</Text>
            )}
            <Text style={styles.miniSubText}>PIN: {order.shippingAddress?.pinCode}</Text>
            <Text style={[styles.miniSubText, { marginTop: 4, color: '#1A1A1A', fontWeight: '700' }]}>
              📞 {order.shippingAddress?.phone}
            </Text>
          </View>

          <View style={styles.miniCard}>
            <Text style={styles.miniTitle}>Payment</Text>
            <View style={[styles.payBadge, order.paymentMethod === 'COD' ? styles.payBadgeCod : styles.payBadgeOnline]}>
              <Text style={[styles.payBadgeText, order.paymentMethod === 'COD' ? { color: '#16A34A' } : { color: '#1D4ED8' }]}>
                {order.paymentMethod || 'Online'}
              </Text>
            </View>
            <Text style={styles.miniSubText2}>Grand Total</Text>
            <Text style={styles.totalPrice}>₹{order.totalAmount}</Text>
            {order.discountAmount > 0 && (
              <Text style={styles.couponSaved}>Coupon saved ₹{order.discountAmount}</Text>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFE' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, height: 60, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F3F7'
  },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  scrollContent: { padding: 15 },

  heroCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 20, borderRadius: 24, marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  statusIconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  heroInfo: { marginLeft: 15 },
  heroStatusText: { fontSize: 20, fontWeight: '900' },
  heroIdText: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '700', fontFamily: 'monospace' },
  heroDate: { fontSize: 11, color: '#CBD5E1', marginTop: 2 },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 1 },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  badgeCount: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeCountText: { fontSize: 12, fontWeight: '800', color: '#64748B' },

  timelineContainer: { marginLeft: 5 },
  timelineItem: { flexDirection: 'row', minHeight: 65 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#E2E8F0', zIndex: 2, justifyContent: 'center', alignItems: 'center' },
  dotActive: { backgroundColor: '#00C853' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 2 },
  lineActive: { backgroundColor: '#00C853' },
  timelineRight: { marginLeft: 15, flex: 1, paddingBottom: 10 },
  timelineStepTitle: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  textActive: { color: '#1A1A1A' },
  timelineTime: { fontSize: 9, color: '#2E7D32', fontWeight: '800' },
  timelineStepDesc: { fontSize: 12, color: '#94A3B8', marginTop: 3 },

  itemRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  productImageBox: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productInfo: { marginLeft: 14, flex: 1 },
  productName: { fontSize: 14, fontWeight: '700', color: '#1E293B', lineHeight: 20 },

  variantBadge: { backgroundColor: '#FFF0F5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#FECDD3', alignSelf: 'flex-start', marginTop: 4 },
  variantBadgeText: { fontSize: 11, fontWeight: '800', color: '#D82B76' },

  itemMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  productSub: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  productPrice: { fontSize: 16, fontWeight: '900', color: '#D82B76' },

  deliveryBadgeOrder: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF0F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6, alignSelf: 'flex-start' },
  deliveryTextOrder: { fontSize: 10, fontWeight: '800', color: '#D82B76' },

  reviewBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FFF0F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start' },
  reviewBtnText: { fontSize: 11, fontWeight: '800', color: '#D82B76' },

  horizontalRow: { flexDirection: 'row', marginBottom: 16 },
  miniCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 16, elevation: 1 },
  miniTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  miniName: { fontSize: 14, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  miniSubText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  miniSubText2: { fontSize: 11, color: '#94A3B8', marginTop: 10, fontWeight: '600' },

  payBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 4 },
  payBadgeCod: { backgroundColor: '#F0FDF4' },
  payBadgeOnline: { backgroundColor: '#EFF6FF' },
  payBadgeText: { fontSize: 12, fontWeight: '800' },

  totalPrice: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', marginTop: 2 },
  couponSaved: { fontSize: 11, color: '#16A34A', fontWeight: '700', marginTop: 4 },
});
