import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getWishlist } from '../services/wishlistService';
import { useFocusEffect } from '@react-navigation/native';

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (error) {
      console.warn('Fetch wishlist error', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [])
  );

  const handleRemove = async (productId) => {
    try {
      await toggleWishlist(productId);
      fetchWishlist();
    } catch (error) {
      console.warn("Error removing from wishlist", error);
    }
  };

  const renderWishItem = ({ item }) => {
    const product = item.product;
    if (!product) return null; // safety check
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('ProductDetail', { product: product })}
      >
        <Image source={{ uri: product.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>{product.category?.name || 'Category'}</Text>
          <Text style={styles.price}>₹{product.salePrice || product.price}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: '#F8FAFC' }]}
            onPress={() => handleRemove(product._id)}
          >
            <Feather name="trash-2" size={18} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => navigation.navigate('ProductDetail', { product: product })}
          >
            <Feather name="chevron-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
           <ActivityIndicator size="large" color="#D82B76" />
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={item => item._id}
          renderItem={renderWishItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Feather name="heart" size={60} color="#DDD" />
              <Text style={styles.emptyText}>Wishlist is empty</Text>
              <TouchableOpacity 
                style={styles.shopBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.shopBtnText}>Explore Products</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '800', color: '#000' },
  list: { padding: 15 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  image: { width: 80, height: 80, borderRadius: 15 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  category: { fontSize: 12, color: '#999', marginTop: 2, textTransform: 'uppercase' },
  price: { fontSize: 18, fontWeight: '900', color: '#D82B76', marginTop: 4 },
  addBtn: { backgroundColor: '#D82B76', width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 150 },
  emptyText: { fontSize: 18, color: '#999', marginTop: 15, fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shopBtn: { marginTop: 20, backgroundColor: '#FFF', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#D82B76' },
  shopBtnText: { color: '#D82B76', fontWeight: '800', fontSize: 14 }
});
