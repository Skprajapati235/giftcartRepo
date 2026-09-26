import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  StatusBar,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import orderService from '../services/orderService';
import { OrderSkeleton } from '../components/Skeleton';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors, shadows } from '../constants/theme';

const statusColor = {
  delivered: { bg: '#DCFCE7', text: '#16A34A' },
  processing: { bg: '#FFF7ED', text: '#EA580C' },
  shipped: { bg: '#EFF6FF', text: '#2563EB' },
  cancelled: { bg: '#FEF2F2', text: '#DC2626' },
  pending: { bg: '#F3F4F6', text: '#6B7280' },
};

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { bottom } = useLayoutInsets();

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const unsubscribe = navigation.addListener('focus', fetchOrders);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrder = ({ item }) => {
    const rawStatus = (item.status || item.orderStatus || 'pending').toLowerCase();
    const statusCfg = statusColor[rawStatus] || statusColor.pending;
    const items = item.items || item.orderItems || [];
    const firstItem = items[0];

    const orderNum = item.orderId || item._id?.substring(0, 8).toUpperCase() || 'N/A';
    const total = item.totalAmount ?? item.totalPrice ?? item.grandTotal ?? 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
      >
        {/* Header: Order ID & Status */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdGroup}>
            <View style={styles.packageIconBox}>
              <Feather name="package" size={14} color={colors.primary} />
            </View>
            <Text style={styles.orderIdText}>Order #{orderNum}</Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.text }]}>
              {item.status || 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Body: Product Thumbnails & Summary */}
        <View style={styles.orderBody}>
          <View style={styles.imagesRow}>
            {items.slice(0, 3).map((it, idx) => (
              <View
                key={it._id || idx}
                style={[styles.thumbWrapper, idx !== 0 && { marginLeft: -12 }, { zIndex: 10 - idx }]}
              >
                <Image
                  source={{ uri: it.product?.image || it.image || 'https://via.placeholder.com/100' }}
                  style={styles.thumbImage}
                />
              </View>
            ))}
            {items.length > 3 && (
              <View style={[styles.moreThumb, { marginLeft: -12, zIndex: 5 }]}>
                <Text style={styles.moreThumbText}>+{items.length - 3}</Text>
              </View>
            )}
          </View>

          <View style={styles.orderInfoCol}>
            <Text style={styles.orderItemName} numberOfLines={1}>
              {firstItem?.name || firstItem?.product?.name || 'Festive Gift'}
              {firstItem?.isEggless ? ' · Eggless' : ''}
            </Text>
            <Text style={styles.orderItemCount}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
              {items.length > 1 ? ` (+${items.length - 1} more)` : ''}
            </Text>
          </View>
        </View>

        {/* Footer: Date & Total Amount */}
        <View style={styles.orderFooter}>
          <View style={styles.dateGroup}>
            <Feather name="clock" size={13} color={colors.primary} />
            <Text style={styles.dateText}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
            </Text>
          </View>

          <View style={styles.totalGroup}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalAmount}>₹{Number(total).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.arrowCircle}>
              <Feather name="chevron-right" size={16} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#741343" />
      <ScreenHeader
        title="My Orders"
        onBack={() => navigation.goBack()}
        border
        berry
        subtitle={orders.length > 0 ? `${orders.length} orders found` : null}
      />

      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <FlatList
          data={loading ? [1, 2, 3, 4] : orders}
          keyExtractor={(item, index) => (loading ? `sk-${index}` : item._id)}
          renderItem={loading ? () => <OrderSkeleton /> : renderOrder}
          contentContainerStyle={[styles.list, { paddingBottom: bottom + 24 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.brandBerry]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <View style={styles.emptyCircle}>
                  <Feather name="package" size={44} color={colors.brandBerry} />
                </View>
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't placed any orders yet. Start shopping to make someone smile!
                </Text>
                <TouchableOpacity
                  style={styles.shopBtn}
                  onPress={() => navigation.navigate('Home')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.shopBtnText}>Start Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#741343' },
  list: { padding: 14, flexGrow: 1 },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    padding: 14,
    marginBottom: 14,
    ...shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packageIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.brandCreamAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderIdText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: colors.textDark,
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderWarm,
    marginVertical: 12,
  },
  orderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: colors.brandCream,
    ...shadows.sm,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  moreThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreThumbText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted,
  },
  orderInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textDark,
  },
  orderItemCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  totalGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textLight,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.brandBerry,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandCreamAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.brandCreamAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textDark,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  shopBtn: {
    backgroundColor: colors.brandBerry,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    ...shadows.button,
  },
  shopBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
