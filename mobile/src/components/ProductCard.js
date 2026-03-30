import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductCard({ product, onPress, onAddToCart, onBuyNow }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.category?.name || 'Unknown'}</Text>
        <Text style={styles.price}>₹{product.price?.toFixed(0)}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.buyButton]} onPress={onBuyNow}>
            <Text style={styles.actionText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cartButton]} onPress={onAddToCart}>
            <Text style={styles.actionText}>Cart</Text>
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
});
