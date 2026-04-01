import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

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
        Alert.alert('Cart', 'Item already in cart!');
        return;
      }
      cart.push({ ...product, quantity });
      await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(cart));
      setAdded(true);
      Alert.alert('Success', 'Product added to cart.');
    } catch (err) {
      Alert.alert('Error', 'Could not add to cart.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerCircle}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCircle}>
          <Feather name="share-2" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f' }} style={styles.image} />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.badgeText}>{product.category?.name || 'Exclusive'}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
            {product.weight ? (
              <View style={styles.weightBadge}>
                <Text style={styles.weightText}>{product.weight}</Text>
              </View>
            ) : null}
          </View>
          
          <View style={styles.priceSection}>
            <Text style={styles.price}>₹{product.salePrice || product.price}</Text>
            {product.salePrice && product.price > product.salePrice && (
              <>
                <Text style={styles.oldPrice}>MRP ₹{product.price}</Text>
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                  </Text>
                </View>
              </>
            )}
          </View>
          
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>
            {product.description || 'This beautiful product is carefully crafted to bring joy to your special occasions. Perfect for giting to your loved ones.'}
          </Text>

          <View style={styles.divider} />
          
          <View style={styles.quantityRow}>
             <Text style={styles.sectionTitle}>Quantity</Text>
             <View style={styles.quantityControls}>
               <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                 <Feather name="minus" size={18} color="#D82B76" />
               </TouchableOpacity>
               <Text style={styles.qtyText}>{quantity}</Text>
               <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                 <Feather name="plus" size={18} color="#D82B76" />
               </TouchableOpacity>
             </View>
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.wishlistBtn}>
          <Feather name="heart" size={24} color="#D82B76" />
        </TouchableOpacity>
        <TouchableOpacity 
           style={[styles.cartBtn, added && styles.addedBtn]} 
           onPress={addToCart}
           disabled={added}
        >
          <Text style={styles.cartBtnText}>{added ? 'ADDED TO CART' : 'ADD TO CART'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 15, right: 15, 
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 
  },
  headerCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  imageContainer: { width: width, height: 380, backgroundColor: '#F8F8F8' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  detailsContainer: { padding: 20, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, elevation: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  categoryBadge: { backgroundColor: '#FFE0EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#D82B76', textTransform: 'uppercase' },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 5 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  name: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', flex: 1 },
  weightBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  weightText: { fontSize: 12, fontWeight: '700', color: '#666' },
  priceSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  price: { fontSize: 28, fontWeight: '900', color: '#1a1a1a', marginRight: 10 },
  oldPrice: { fontSize: 16, color: '#999', textDecorationLine: 'line-through', marginRight: 15 },
  discountTag: { backgroundColor: '#00a65a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discountTagText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 10 },
  description: { fontSize: 15, color: '#666', lineHeight: 22 },
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', borderRadius: 12, padding: 5 },
  qtyBtn: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  qtyText: { marginHorizontal: 15, fontSize: 18, fontWeight: '700' },
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, 
    backgroundColor: '#FFF', flexDirection: 'row', paddingHorizontal: 20, 
    alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0' 
  },
  wishlistBtn: { width: 55, height: 55, borderRadius: 15, borderWidth: 1, borderColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  cartBtn: { flex: 1, height: 55, backgroundColor: '#D82B76', borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  addedBtn: { backgroundColor: '#444' },
  cartBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

