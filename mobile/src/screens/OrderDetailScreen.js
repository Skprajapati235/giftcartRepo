import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, RefreshControl } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import orderService from '../services/orderService';
import { colors } from '../constants/theme';

export default function OrderDetailScreen({ route, navigation }) {
  const [order, setOrder] = useState(route.params.order);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveOrder = async () => {
    if (!route.params?.order?._id) return;
    try {
      const updated = await orderService.getOrderById(route.params.order._id);
      if (updated && updated._id) {
        setOrder(updated);
      }
    } catch (err) {
      // Keep existing order on error
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveOrder();
    const unsubscribe = navigation.addListener('focus', fetchLiveOrder);
    return unsubscribe;
  }, [navigation, route.params?.order?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveOrder();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Delivered':  return { color: '#16A34A', icon: 'check-circle',   bg: '#F0FDF4', border: '#BBF7D0' };
      case 'Cancelled':  return { color: '#DC2626', icon: 'close-circle',   bg: '#FEF2F2', border: '#FECACA' };
      case 'Processing': return { color: colors.brandBerry, icon: 'clock-outline',  bg: colors.backgroundRose, border: colors.borderRose };
      case 'Shipped':    return { color: '#D97706', icon: 'truck-delivery', bg: '#FFFBEB', border: '#FDE68A' };
      default:           return { color: '#64748B', icon: 'help-circle',    bg: '#F8FAFC', border: '#E2E8F0' };
    }
  };

  const steps = ['Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status);
  const statusConfig = getStatusConfig(order.status);
  const { bottom } = useLayoutInsets();

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <ScreenHeader
        title="Order Details"
        subtitle={`ID: #${order._id.slice(-8).toUpperCase()}`}
        onBack={() => navigation.goBack()}
        border
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brandBerry]} />}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 24 }]}
      >
        {/* Status Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.statusIconBox, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
            <MaterialCommunityIcons name={statusConfig.icon} size={30} color={statusConfig.color} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={[styles.heroStatusText, { color: statusConfig.color }]}>Order {order.status}</Text>
            <Text style={styles.heroIdText}>Order #{order._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.heroDate}>Placed on {new Date(order.createdAt).toDateString()}</Text>
          </View>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Tracking Timeline</Text>
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
                      {isCompleted ? `Your order has been ${isCancelled ? 'cancelled' : step.toLowerCase()}` : 'Pending update'}
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
              <Text style={styles.badgeCountText}>{order.items?.length || 0} ITEMS</Text>
            </View>
          </View>

          {order.items?.map((item, index) => {
            const product = item.product || {};
            const displayPrice = item.salePrice ?? item.price;

            return (
              <View key={index} style={[styles.itemRow, index === order.items.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.productImageBox}>
                  {product.image ? (
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                  ) : (
                    <Feather name="package" size={24} color="#CBD5E1" />
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name || product.name || 'Gift Item'}
                  </Text>

                  {/* Variant + Eggless + Flavor Badges */}
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {item.isEggless && (
                      <View style={styles.variantBadge}>
                        <Text style={styles.variantBadgeText}>Eggless</Text>
                      </View>
                    )}
                    {item.flavor && (
                      <View style={[styles.variantBadge, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                        <Text style={[styles.variantBadgeText, { color: '#0369A1' }]}>{item.flavor}</Text>
                      </View>
                    )}
                    {item.weight && (
                      <View style={[styles.variantBadge, { backgroundColor: colors.backgroundCream, borderColor: colors.borderWarm }]}>
                        <Text style={[styles.variantBadgeText, { color: '#64748B' }]}>{item.weight}</Text>
                      </View>
                    )}
                    {item.flowerCount && (
                      <View style={[styles.variantBadge, { backgroundColor: colors.backgroundCream, borderColor: colors.borderWarm }]}>
                        <Text style={[styles.variantBadgeText, { color: '#64748B' }]}>{item.flowerCount}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.itemMetaRow}>
                    <Text style={styles.productSub}>Qty: {item.quantity}</Text>
                    <Text style={styles.productPrice}>₹{displayPrice}</Text>
                  </View>

                  {item.expectedDeliveryDate && (
                    <View style={styles.deliveryBadgeOrder}>
                      <Feather name="truck" size={10} color={colors.primary} />
                      <Text style={styles.deliveryTextOrder}>Expected: {item.expectedDeliveryDate}</Text>
                    </View>
                  )}

                  {order.status === 'Delivered' && (
                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() => navigation.navigate('AddReview', { product, orderId: order._id })}
                      activeOpacity={0.8}
                    >
                      <Feather name="star" size={12} color={colors.brandBerry} />
                      <Text style={styles.reviewBtnText}>Rate this product</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Payment + Shipping */}
        <View style={styles.horizontalRow}>
          <View style={[styles.miniCard, { marginRight: 10, flex: 1.4 }]}>
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
            <Text style={[styles.miniSubText, { marginTop: 4, color: '#1E293B', fontWeight: '700' }]}>
              📞 {order.shippingAddress?.phone}
            </Text>
          </View>

          <View style={styles.miniCard}>
            <Text style={styles.miniTitle}>Payment</Text>
            <View style={[styles.payBadge, order.paymentMethod === 'COD' ? styles.payBadgeCod : styles.payBadgeOnline]}>
              <Text style={[styles.payBadgeText, order.paymentMethod === 'COD' ? { color: '#16A34A' } : { color: '#2563EB' }]}>
                {order.paymentMethod || 'Online'}
              </Text>
            </View>
            <Text style={styles.miniSubText2}>Grand Total</Text>
            <Text style={styles.totalPrice}>₹{order.totalAmount}</Text>
            {order.discountAmount > 0 && (
              <Text style={styles.couponSaved}>Saved ₹{order.discountAmount}</Text>
            )}
          </View>
        </View>

        {/* Customer Support Help Card */}
        <TouchableOpacity
          style={styles.supportHelpCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CustomerSupport', { orderId: order.orderId || order._id })}
        >
          <View style={styles.supportHelpLeft}>
            <View style={styles.supportIconBox}>
              <Feather name="headphones" size={20} color={colors.brandBerry} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportHelpTitle}>Need Help with this Order?</Text>
              <Text style={styles.supportHelpSub}>Reach support for delivery, items, or refund</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    marginLeft: 14,
    flex: 1,
  },
  heroStatusText: {
    fontSize: 18,
    fontWeight: '900',
  },
  heroIdText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  heroDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badgeCount: {
    backgroundColor: colors.backgroundCream,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.brandBerry,
  },
  timelineContainer: {
    marginLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 22,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E2E8F0',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    backgroundColor: '#16A34A',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  lineActive: {
    backgroundColor: '#16A34A',
  },
  timelineRight: {
    marginLeft: 14,
    flex: 1,
    paddingBottom: 10,
  },
  timelineStepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  textActive: {
    color: '#1E293B',
  },
  timelineTime: {
    fontSize: 9,
    color: '#16A34A',
    fontWeight: '800',
  },
  timelineStepDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  productImageBox: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: colors.backgroundCream,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 19,
  },
  variantBadge: {
    backgroundColor: colors.backgroundRose,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.borderRose,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  variantBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.brandBerry,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  productSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.brandBerry,
  },
  deliveryBadgeOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundCream,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  deliveryTextOrder: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.brandBerry,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    backgroundColor: colors.backgroundRose,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brandBerry,
  },
  horizontalRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  miniCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  miniTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  miniName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  miniSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  miniSubText2: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 10,
    fontWeight: '600',
  },
  payBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  payBadgeCod: {
    backgroundColor: '#F0FDF4',
  },
  payBadgeOnline: {
    backgroundColor: '#EFF6FF',
  },
  payBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  couponSaved: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '800',
    marginTop: 3,
  },
  supportHelpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  supportHelpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  supportIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.backgroundRose,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  supportHelpTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  supportHelpSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});

