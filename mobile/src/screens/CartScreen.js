import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { SafeScreen, ScreenHeader, StickyBottomBar } from '../components/layout';
import useDeliveryHours from '../hooks/useDeliveryHours';
import { colors, shadows } from '../constants/theme';

export default function CartScreen({ navigation }) {
  const { cart, cartLoading, removeFromCart, updateQuantity, refreshCart } = useCart();
  const { user } = useContext(AuthContext);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const deliveryHours = useDeliveryHours();
  const isOrderBlocked = Boolean(deliveryHours.isCurrentlyRestricted || deliveryHours.blockOrders);

  const getKey = (item) => item.variantKey || item._id;

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
    if (isOrderBlocked) {
      Alert.alert(
        '🌙 Night Delivery Paused',
        deliveryHours.message || `Orders cannot be placed during night hours. Delivery resumes after ${deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}.`,
        [{ text: 'OK' }]
      );
      return;
    }
    if (selectedItems.length === 0) {
      return;
    }
    if (!user) {
      navigation.navigate('Login', { redirectTo: 'Checkout' });
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
            size={22}
            color={isSelected ? colors.brandBerry : '#CBD5E1'}
          />
        </TouchableOpacity>

        <Image source={{ uri: item.image }} style={styles.image} />

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity onPress={() => removeFromCart(item)} style={styles.removeBtn}>
              <Feather name="trash-2" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Variant Badges */}
          <View style={styles.variantRow}>
            {item.weight ? (
              <View style={styles.weightBadge}>
                <Text style={styles.weightText}>{item.weight}</Text>
              </View>
            ) : null}
            {item.flavor ? (
              <View style={styles.flavorBadge}>
                <Text style={styles.flavorText}>
                  {typeof item.flavor === 'string' ? item.flavor : item.flavor.name}
                </Text>
              </View>
            ) : null}
            {item.isEggless ? (
              <View style={styles.egglessBadge}>
                <Text style={styles.egglessText}>Eggless</Text>
              </View>
            ) : null}
          </View>

          {/* Pricing & Stepper */}
          <View style={styles.bottomRow}>
            <View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>₹{salePrice}</Text>
                {hasSaving && <Text style={styles.mrpText}>₹{mrpPrice}</Text>}
              </View>
              <Text style={styles.lineTotal}>Item total: ₹{item.itemTotal}</Text>
            </View>

            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => updateQuantity(item, qty - 1)}
              >
                <Feather name="minus" size={13} color={colors.brandBerry} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => updateQuantity(item, qty + 1)}
              >
                <Feather name="plus" size={13} color={colors.brandBerry} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#741343" />
      <ScreenHeader
        title="Shopping Cart"
        onBack={() => navigation.goBack()}
        border
        berry
        subtitle={cart.length > 0 ? `${cart.length} item${cart.length !== 1 ? 's' : ''}` : null}
      />

      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Night Delivery Paused Banner */}
      {deliveryHours.isCurrentlyRestricted && (
        <View style={styles.nightBanner}>
          <Text style={{ fontSize: 20 }}>🌙</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.nightTitle}>
              Night Delivery Paused — Resumes {deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}
            </Text>
            <Text style={styles.nightSubtitle}>
              Orders are temporarily paused during night operating hours. Deliveries resume after {deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}. You can review your cart items.
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={cart}
        keyExtractor={getKey}
        renderItem={renderItem}
        refreshing={cartLoading}
        onRefresh={refreshCart}
        style={styles.listFlex}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          cart.length > 0 ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.secureBadge}>
                  <Text style={styles.secureText}>SECURE CHECKOUT</Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Item Total ({selectedTotals.totalQuantity} items)
                </Text>
                <Text style={styles.summaryVal}>₹{selectedTotals.subTotal}</Text>
              </View>

              {selectedTotals.totalDiscount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={styles.discountVal}>-₹{selectedTotals.totalDiscount}</Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={selectedTotals.totalShipping > 0 ? styles.summaryVal : styles.freeShipping}>
                  {selectedTotals.totalShipping > 0 ? `₹${selectedTotals.totalShipping}` : 'FREE'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxes</Text>
                <Text style={styles.summaryVal}>
                  {selectedTotals.totalTax > 0 ? `₹${selectedTotals.totalTax}` : 'Included'}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalVal}>₹{selectedTotals.grandTotal.toFixed(0)}</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !cartLoading && (
            <View style={styles.empty}>
              <View style={styles.emptyCircle}>
                <Feather name="shopping-bag" size={40} color={colors.brandBerry} />
              </View>
              <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
              <Text style={styles.emptySubtitle}>
                Looks like you haven't added anything to your cart yet.
              </Text>
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.85}
              >
                <Text style={styles.shopText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
      </View>

      {cart.length > 0 && (
        <StickyBottomBar>
          <View style={styles.bottomBarRow}>
            <View>
              <Text style={styles.bottomTotalLabel}>Total Amount</Text>
              <Text style={styles.bottomTotalVal}>₹{selectedTotals.grandTotal.toFixed(0)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutBtn,
                isOrderBlocked && styles.checkoutBtnPaused,
              ]}
              onPress={handleCheckout}
              disabled={isOrderBlocked}
              activeOpacity={0.85}
            >
              <Text style={[styles.checkoutText, isOrderBlocked && styles.checkoutTextPaused]}>
                {isOrderBlocked
                  ? `🌙 Delivery Paused (${deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'})`
                  : 'Proceed to Checkout'}
              </Text>
              <Feather name={isOrderBlocked ? 'lock' : 'arrow-right'} size={15} color={isOrderBlocked ? '#FFD166' : colors.brandGold} />
            </TouchableOpacity>
          </View>
        </StickyBottomBar>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#741343' },
  listFlex: { flex: 1 },
  list: { padding: 14, flexGrow: 1, paddingBottom: 30 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandCream,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    ...shadows.sm,
  },
  checkbox: { paddingRight: 8 },
  image: { width: 76, height: 76, borderRadius: 12, backgroundColor: '#FFF' },
  info: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 13.5, fontWeight: '800', color: colors.textDark, flex: 1, marginRight: 6 },
  removeBtn: { padding: 4 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  weightBadge: { backgroundColor: '#F0FDFA', paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 4 },
  weightText: { fontSize: 9, fontWeight: '800', color: '#0D9488' },
  flavorBadge: { backgroundColor: colors.brandCreamAlt, paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 4 },
  flavorText: { fontSize: 9, fontWeight: '800', color: colors.primary },
  egglessBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 4 },
  egglessText: { fontSize: 9, fontWeight: '800', color: '#16a34a' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 15, fontWeight: '900', color: colors.brandBerry },
  mrpText: { fontSize: 11, color: colors.textLight, textDecorationLine: 'line-through' },
  lineTotal: { fontSize: 10, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: 8,
    padding: 2,
  },
  stepBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 12, fontWeight: '800', color: colors.textDark, paddingHorizontal: 6 },
  nightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21091a',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 4,
    gap: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  nightTitle: { fontSize: 12.5, fontWeight: '900', color: '#FFD166' },
  nightSubtitle: { fontSize: 10.5, color: '#F3F4F6', marginTop: 2, lineHeight: 15 },
  checkoutBtnPaused: {
    backgroundColor: '#3d0f2b',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  checkoutTextPaused: {
    color: '#FFD166',
  },
  summaryCard: {
    backgroundColor: colors.brandCream,
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    ...shadows.sm,
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  summaryTitle: { fontSize: 16, fontWeight: '900', color: colors.brandBerry },
  secureBadge: { backgroundColor: colors.brandCreamAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  secureText: { fontSize: 8.5, fontWeight: '900', color: colors.primary, letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 12.5, color: colors.textMuted, fontWeight: '600' },
  summaryVal: { fontSize: 13, fontWeight: '800', color: colors.textDark },
  discountVal: { fontSize: 13, fontWeight: '800', color: '#16a34a' },
  freeShipping: { fontSize: 12.5, fontWeight: '900', color: '#16a34a' },
  summaryDivider: { height: 1, backgroundColor: colors.borderWarm, marginVertical: 10 },
  grandTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  grandTotalLabel: { fontSize: 14, fontWeight: '900', color: colors.brandBerry },
  grandTotalVal: { fontSize: 18, fontWeight: '900', color: colors.brandBerry },
  bottomBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomTotalLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  bottomTotalVal: { fontSize: 20, fontWeight: '900', color: colors.brandBerry },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brandBerry,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    ...shadows.button,
  },
  checkoutBtnPaused: { backgroundColor: '#475569' },
  checkoutText: { color: '#FFF', fontSize: 13.5, fontWeight: '900' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.brandCreamAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: colors.textDark },
  emptySubtitle: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  shopBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.brandBerry, borderRadius: 12, ...shadows.button },
  shopText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
});
