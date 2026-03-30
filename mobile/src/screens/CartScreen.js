import React, { useCallback, useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function CartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  const loadCart = async () => {
    try {
      const raw = await AsyncStorage.getItem('@giftcart_cart');
      const items = raw ? JSON.parse(raw) : [];
      setCartItems(items);
      const sum = items.reduce((acc, item) => acc + (item.price || 0), 0);
      setTotal(sum);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadCart);
    return unsubscribe;
  }, [navigation]);

  const removeItem = async (id) => {
    try {
      const next = cartItems.filter(item => item._id !== id);
      await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(next));
      setCartItems(next);
      const sum = next.reduce((acc, item) => acc + (item.price || 0), 0);
      setTotal(sum);
    } catch (err) {
      Alert.alert('Error', 'Could not remove item from cart.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price?.toFixed(0)}</Text>
      </View>
      <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.removeBtn}>
        <Feather name="trash-2" size={20} color="#FF6A3D" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="shopping-cart" size={60} color="#DDD" />
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.shopText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalVal}>₹{total.toFixed(0)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => Alert.alert('Checkout', 'Proceeding to payment...')}>
            <Text style={styles.checkoutText}>Checkout Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '800', color: '#000' },
  list: { padding: 15 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 10, marginBottom: 15, elevation: 2 },
  image: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 18, fontWeight: '800', color: '#D82B76', marginTop: 5 },
  removeBtn: { padding: 10, justifyContent: 'center' },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#555' },
  totalVal: { fontSize: 22, fontWeight: '800', color: '#000' },
  checkoutBtn: { backgroundColor: '#D82B76', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  checkoutText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, color: '#999', marginVertical: 20 },
  shopBtn: { paddingHorizontal: 30, paddingVertical: 12, borderWidth: 2, borderColor: '#D82B76', borderRadius: 10 },
  shopText: { color: '#D82B76', fontWeight: '800' },
});
