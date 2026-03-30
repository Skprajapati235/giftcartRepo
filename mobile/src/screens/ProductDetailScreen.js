import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProductDetailScreen({ route }) {
  const { product } = route.params;
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const checkCart = async () => {
      try {
        const raw = await AsyncStorage.getItem('@giftcart_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const exists = cart.some((item) => item._id === product._id);
        setAdded(exists);
      } catch (err) {
        console.warn('Cart load error', err);
      }
    };

    checkCart();
  }, [product]);

  const addToCart = async () => {
    try {
      const raw = await AsyncStorage.getItem('@giftcart_cart');
      const cart = raw ? JSON.parse(raw) : [];
      if (cart.some((item) => item._id === product._id)) {
        Alert.alert('Cart', 'This item is already in your cart.');
        setAdded(true);
        return;
      }
      cart.push(product);
      await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(cart));
      setAdded(true);
      Alert.alert('Added', 'Product added to cart successfully.');
    } catch (err) {
      Alert.alert('Error', 'Could not add to cart.');
    }
  };

  const buyNow = () => {
    Alert.alert('Buy Now', `Proceeding with payment for ${product.name}.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.card}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>{product.category?.name || 'General'}</Text>
          <Text style={styles.price}>₹{product.price?.toFixed(0)}</Text>
          <Text style={styles.description}>{product.description || 'No description available.'}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, styles.buttonSpacing, styles.buyButton]} onPress={buyNow}>
              <Text style={styles.actionLabel}>Buy Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, added ? styles.addedButton : styles.cartButton]}
              onPress={addToCart}
            >
              <Text style={styles.actionLabel}>{added ? 'Added' : 'Add to Cart'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 22,
    backgroundColor: '#222',
  },
  card: {
    marginTop: 18,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#171718',
    borderWidth: 1,
    borderColor: '#2a2a2d',
  },
  name: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 8,
  },
  category: {
    color: '#ff9ed9',
    fontSize: 14,
    marginBottom: 12,
  },
  price: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 18,
  },
  description: {
    color: '#d1d1d1',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonSpacing: {
    marginRight: 12,
  },
  buyButton: {
    backgroundColor: '#ff5ea0',
  },
  cartButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#ff5ea0',
  },
  addedButton: {
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: '#999',
  },
  actionLabel: {
    color: '#fff',
    fontWeight: '800',
  },
});
