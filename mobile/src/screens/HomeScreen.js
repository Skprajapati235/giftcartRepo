import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import api from '../api/apiClient';
import CategoryChip from '../components/CategoryChip';
import ProductCard from '../components/ProductCard';

export default function HomeScreen({ navigation }) {
  const { signOut, user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryRes, productRes] = await Promise.all([
        api.get('/api/category'),
        api.get('/api/product'),
      ]);
      setCategories(categoryRes.data || []);
      setProducts(productRes.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        signOut();
        return;
      }
      const message = error.response?.data?.message || error.message || 'Unable to load data';
      Alert.alert('Load failed', message);
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  const loadCart = async () => {
    const raw = await AsyncStorage.getItem('@giftcart_cart');
    setCartItems(raw ? JSON.parse(raw) : []);
  };

  const saveCart = async (items) => {
    await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(items));
    setCartItems(items);
  };

  const addToCart = async (product) => {
    const existing = cartItems.some((item) => item._id === product._id);
    if (existing) {
      Alert.alert('Cart', 'Product already in cart.');
      return;
    }
    const next = [...cartItems, product];
    await saveCart(next);
    Alert.alert('Cart', 'Product added to your cart.');
  };

  const buyNow = (product) => {
    Alert.alert('Buy Now', `Proceeding to buy ${product.name}.`);
  };

  useEffect(() => {
    loadData();
    loadCart();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter((item) => item.category?._id === selectedCategory);
  }, [products, selectedCategory]);

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCartPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topbar}>
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.username}>{user?.name || 'Shopper'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => setSelectedCategory('All')}>
          <Text style={styles.sectionAction}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContainer}>
        <CategoryChip title="All" selected={selectedCategory === 'All'} onPress={() => setSelectedCategory('All')} />
        {categories.map((category) => (
          <CategoryChip
            key={category._id}
            title={category.name}
            selected={selectedCategory === category._id}
            onPress={() => setSelectedCategory(category._id)}
          />
        ))}
      </ScrollView>

      <View style={styles.cartPreview}>
        <View style={styles.cartHeader}>
          <Text style={styles.sectionTitle}>My Cart</Text>
          <Text style={styles.cartCount}>{cartItems.length} items</Text>
        </View>
        {cartItems.length === 0 ? (
          <Text style={styles.cartEmpty}>Your cart is empty. Add products from below.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cartScroll}>
            {cartItems.map((item) => (
              <TouchableOpacity key={item._id} style={styles.cartCard} onPress={() => handleCartPress(item)}>
                <Text numberOfLines={1} style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartPrice}>₹{item.price?.toFixed(0)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Products</Text>
        <Text style={styles.sectionAction}>{filteredProducts.length} items</Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#ff5ea0" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item)}
              onAddToCart={() => addToCart(item)}
              onBuyNow={() => buyNow(item)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingHorizontal: 16,
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 18,
  },
  welcome: {
    color: '#888',
    fontSize: 15,
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  logoutButton: {
    backgroundColor: '#ff5ea0',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  logoutText: {
    color: '#111',
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionAction: {
    color: '#ff74c3',
    fontWeight: '700',
  },
  chipsScroll: {
    marginTop: 14,
    marginBottom: 18,
  },
  cartPreview: {
    backgroundColor: '#171718',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#2b2b2d',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cartCount: {
    color: '#ff9ed9',
    fontWeight: '700',
  },
  cartEmpty: {
    color: '#888',
    fontSize: 14,
  },
  cartScroll: {
    marginTop: 4,
  },
  cartCard: {
    backgroundColor: '#000',
    borderRadius: 18,
    padding: 14,
    marginRight: 12,
    width: 170,
  },
  cartName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  cartPrice: {
    color: '#ff5ea0',
    fontWeight: '800',
  },
  productList: {
    paddingBottom: 24,
  },
  chipsContainer: {
    paddingRight: 16,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productList: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});
