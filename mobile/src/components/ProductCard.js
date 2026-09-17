import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function ProductCard({ product, onPress, onAddToCart, onBuyNow, deliveryStatus }) {
  const basePrice = product.price || 0;
  const effectiveSalePrice = product.salePrice || basePrice;
  const discountPct = product.discount || 0;
  const discountAmount = basePrice * (discountPct / 100);
  const finalPrice = Math.max(0, effectiveSalePrice - discountAmount);
  
  const hasDiscount = discountPct > 0 || basePrice > finalPrice;
  const displayDiscount = discountPct > 0 ? discountPct : (hasDiscount ? Math.round(((basePrice - finalPrice) / basePrice) * 100) : 0);

  const isRestricted = deliveryStatus?.isCurrentlyRestricted;
  const nextTime = deliveryStatus?.nextAvailableTime || '7:00 AM';

  const handleRestrictedAction = (actionName) => {
    if (isRestricted) {
      Alert.alert(
        '🌙 Night Delivery Paused',
        deliveryStatus?.message || `Deliveries are currently paused. Orders will resume after ${nextTime}.`,
        [{ text: 'OK' }]
      );
      return;
    }
    if (actionName === 'buy' && onBuyNow) onBuyNow();
    if (actionName === 'cart' && onAddToCart) onAddToCart();
  };

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {hasDiscount && displayDiscount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{displayDiscount}% OFF</Text>
          </View>
        )}
        {isRestricted && (
          <View style={styles.restrictedBadge}>
            <Text style={styles.restrictedBadgeText}>🌙 Unavailable • After {nextTime}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category?.name || 'Unknown'}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {product.flavor && (
            <View style={[styles.badge, styles.flavorBadge]}>
              <Text style={styles.flavorText}>{product.flavor.name || product.flavor}</Text>
            </View>
          )}
          {product.weight && (
            <View style={[styles.badge, styles.weightBadge]}>
              <Text style={styles.weightText}>{product.weight}</Text>
            </View>
          )}
          {product.flowerCount && (
            <View style={[styles.badge, styles.flowerBadge]}>
              <Text style={styles.flowerText}>{product.flowerCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{finalPrice.toFixed(0)}</Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>₹{basePrice.toFixed(0)}</Text>
          )}
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.buyButton, isRestricted && styles.disabledButton]}
            onPress={() => handleRestrictedAction('buy')}
          >
            <Text style={styles.actionText}>{isRestricted ? 'Paused' : 'Buy'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cartButton, isRestricted && styles.disabledButton]}
            onPress={() => handleRestrictedAction('cart')}
          >
            <Text style={styles.actionText}>{isRestricted ? 'Wait' : 'Cart'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#171718',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#2b2b2d',
  },
  imageWrapper: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#333',
  },
  info: {
    padding: 12,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  category: {
    color: '#ff9ed9',
    fontSize: 13,
    marginBottom: 8,
  },
  price: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: '#ff5ea0',
    marginRight: 6,
  },
  cartButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#ff5ea0',
    marginLeft: 6,
  },
  actionText: {
    color: '#fff',
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  flavorBadge: {
    backgroundColor: '#FFF0F5',
    borderColor: '#FECDD3',
  },
  weightBadge: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  flowerBadge: {
    backgroundColor: '#F5F3FF',
    borderColor: '#EDE9FE',
  },
  flavorText: {
    color: '#D82B76',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weightText: {
    color: '#0D9488',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  flowerText: {
    color: '#7C3AED',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ff5ea0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 12,
  },
  originalPrice: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  restrictedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  restrictedBadgeText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#334155',
    borderColor: '#475569',
    opacity: 0.8,
  },
});
