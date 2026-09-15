import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { SafeScreen, ScreenHeader, StickyBottomBar } from '../components/layout';

export default function CartScreen({ navigation }) {
  const { cart, cartLoading, removeFromCart, updateQuantity, refreshCart } = useCart();
  const [selectedKeys, setSelectedKeys] = useState([]);

  const getKey = (item) => item.variantKey || item._id;

  // Refresh from the backend every time this screen comes into focus, and
  // default-select every line so "Checkout Now" works the way it used to.
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshCart);
    return unsubscribe;
  }, [navigation, refreshCart]);

  useEffect(() => {
    setSelectedKeys(cart.map(getKey));
  }, [cart.length]);

  const toggleSelection = (key) => {
    setSelectedKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const selectedItems = cart.filter((item) => selectedKeys.includes(getKey(item)));

  // Pure aggregation of numbers the backend already calculated per line —
  // nothing about price/tax/discount is recomputed here. Discount, tax and
  // shipping are flat per line (NOT multiplied by quantity) — only the
  // price itself scales with quantity, matching how the backend prices it.
  const selectedTotals = selectedItems.reduce(
    (acc, item) => ({
      subTotal: acc.subTotal + Number(item.salePrice ?? item.price ?? 0) * Number(item.quantity || 0),
      totalDiscount: acc.totalDiscount + Number(item.discountAmount || 0),
      totalTax: acc.totalTax + Number(item.taxAmount || 0),
      totalShipping: acc.totalShipping + Number(item.shippingCost || 0),
      grandTotal: acc.grandTotal + Number(item.itemTotal || 0),
      totalQuantity: acc.totalQuantity + Number(item.quantity || 0),
    }),
    { subTotal: 0, totalDiscount: 0, totalTax: 0, totalShipping: 0, grandTotal: 0, totalQuantity: 0 }
  );

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      return;
    }
    navigation.navigate('Checkout', { cartItems: selectedItems, totals: selectedTotals });
  };

  const renderItem = ({ item }) => {
    const key = getKey(item);
    const isSelected = selectedKeys.includes(key);
    const salePrice = Number(item.salePrice ?? item.price ?? 0);
    const qty = Number(item.quantity || 1);
    const mrpPrice = Number(item.price || 0);
    const hasSaving = mrpPrice > salePrice;

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => toggleSelection(key)} style={styles.checkbox}>
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={24}
            color={isSelected ? "#D82B76" : "#DDD"}
          />
        </TouchableOpacity>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 }}>
            <Text style={styles.price}>₹{salePrice}</Text>
            {hasSaving && (
              <Text style={styles.mrpText}>₹{mrpPrice}</Text>
            )}
          </View>
          {item.isEggless && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: '#D82B76', fontWeight: '800', backgroundColor: '#FFF0F5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' }}>
                Eggless
              </Text>
            </View>
          )}

          {/* Quantity stepper — every tap calls the backend, which
              recalculates itemTotal and the cart totals. */}
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, qty - 1)}>
              <Feather name="minus" size={14} color="#741343" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item, qty + 1)}>
              <Feather name="plus" size={14} color="#741343" />
            </TouchableOpacity>
          </View>
          <Text style={styles.lineTotal}>Item total: ₹{item.itemTotal}</Text>
        </View>
        <TouchableOpacity onPress={() => removeFromCart(item)} style={styles.removeBtn}>
          <Feather name="trash-2" size={20} color="#FF6A3D" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <ScreenHeader title="My Cart" onBack={() => navigation.goBack()} border />

      <FlatList
        data={cart}
        keyExtractor={getKey}
        renderItem={renderItem}
        refreshing={cartLoading}
        onRefresh={refreshCart}
        style={styles.listFlex}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          !cartLoading && (
            <View style={styles.empty}>
              <Feather name="shopping-cart" size={60} color="#DDD" />
              <Text style={styles.emptyText}>Your cart is empty</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.shopText}>Shop Now</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      />

      {cart.length > 0 && (
        <StickyBottomBar>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalVal}>₹{selectedTotals.grandTotal.toFixed(0)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Checkout Now</Text>
          </TouchableOpacity>
        </StickyBottomBar>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  listFlex: { flex: 1 },
  list: { padding: 15, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 15, padding: 10, marginBottom: 15, elevation: 2 },
  checkbox: { paddingRight: 10 },
  image: { width: 80, height: 80, borderRadius: 10 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginTop: 5 },
  mrpText: { fontSize: 13, color: '#CBD5E1', textDecorationLine: 'line-through', fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  qtyBtn: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: '#ead6c5', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 14, fontWeight: '700', color: '#333', minWidth: 18, textAlign: 'center' },
  lineTotal: { fontSize: 12, color: '#741343', fontWeight: '700', marginTop: 6 },
  removeBtn: { padding: 10, justifyContent: 'center' },
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
