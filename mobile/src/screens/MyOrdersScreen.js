import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import orderService from '../services/orderService';

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      
      <View style={styles.orderBody}>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toDateString()}</Text>
        <Text style={styles.orderItems}>{item.items.length} items</Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalValue}>₹{item.totalAmount}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#D82B76" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Feather name="package" size={60} color="#DDD" />
              <Text style={styles.emptyText}>No orders yet</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.shopText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  title: { fontSize: 20, fontWeight: '800', color: '#000' },
  list: { padding: 15 },
  orderCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#333' },
  orderStatus: { fontSize: 14, fontWeight: '700' },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderDate: { fontSize: 13, color: '#999' },
  orderItems: { fontSize: 13, color: '#666' },
  orderFooter: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#D82B76' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, color: '#999', marginVertical: 20 },
  shopBtn: { paddingHorizontal: 30, paddingVertical: 12, backgroundColor: '#D82B76', borderRadius: 10 },
  shopText: { color: '#FFF', fontWeight: '800' },
});
