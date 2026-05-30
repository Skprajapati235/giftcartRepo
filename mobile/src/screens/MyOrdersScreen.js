import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import orderService from '../services/orderService';
import { OrderSkeleton } from '../components/Skeleton';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { bottom } = useLayoutInsets();

  const fetchOrders = async () => {
    try {
      const data = await orderService.getUserOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      case 'Processing': return '#2196F3';
      case 'Shipped': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const renderOrder = ({ item }) => {
    const firstItemImage = item.items?.[0]?.product?.image;
    const firstItem = item.items?.[0];
    
    return (
    <TouchableOpacity style={styles.orderCard} onPress={() => navigation.navigate('OrderDetail', { order: item })}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>

      <View style={styles.orderBody}>
        {firstItemImage ? (
          <Image source={{ uri: firstItemImage }} style={styles.orderImage} />
        ) : (
          <View style={[styles.orderImage, { justifyContent: 'center', alignItems: 'center' }]}>
            <Feather name="package" size={24} color="#999" />
          </View>
        )}
        <View style={styles.orderContentInfo}>
          <Text style={styles.orderDate}>{new Date(item.createdAt).toDateString()}</Text>
          {/* Show first item name + variant */}
          {firstItem && (
            <Text style={styles.orderItemName} numberOfLines={1}>
              {firstItem.name}
              {firstItem.isEggless ? ' · Eggless' : ''}
            </Text>
          )}
          <Text style={styles.orderItems}>
            {item.items?.length || 0} item{item.items?.length !== 1 ? 's' : ''}
            {item.items?.length > 1 ? ` (+ ${item.items.length - 1} more)` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.paymentMethod}>{item.paymentMethod || 'Online'} • {item.paymentStatus}</Text>
        </View>
        <Text style={styles.totalValue}>₹{item.totalAmount}</Text>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <SafeScreen style={styles.container}>
      <ScreenHeader title="My Orders" onBack={() => navigation.goBack()} border />

      <FlatList
        data={loading ? [1, 2, 3, 4] : orders}
        keyExtractor={(item, index) => loading ? `sk-${index}` : item._id}
        renderItem={loading ? () => <OrderSkeleton /> : renderOrder}
        contentContainerStyle={[styles.list, { paddingBottom: bottom + 16 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? () => (
          <View style={styles.empty}>
            <Feather name="package" size={60} color="#DDD" />
            <Text style={styles.emptyText}>No orders yet</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.shopText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 15, flexGrow: 1 },
  orderCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#333' },
  orderStatus: { fontSize: 14, fontWeight: '700' },
  orderBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  orderImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#F0F0F0' },
  orderContentInfo: { marginLeft: 15 },
  orderDate: { fontSize: 13, color: '#999' },
  orderItemName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginTop: 2 },
  orderItems: { fontSize: 12, color: '#888', marginTop: 3 },
  paymentMethod: { fontSize: 11, color: '#888', marginTop: 2 },
  orderFooter: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#D82B76' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, color: '#999', marginVertical: 20 },
  shopBtn: { paddingHorizontal: 30, paddingVertical: 12, backgroundColor: '#D82B76', borderRadius: 10 },
  shopText: { color: '#FFF', fontWeight: '800' },
});
