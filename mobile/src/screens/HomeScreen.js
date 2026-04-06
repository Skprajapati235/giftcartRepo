import React, { useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import categoryService from '../services/categoryService';
import productService from '../services/productService';

const { width } = Dimensions.get('window');

const BANNERS = [
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=400&fit=crop',
];

const ADS = [
  { id: '1', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=400&fit=crop', title: '50% OFF' },
  { id: '2', img: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=200&fit=crop', title: 'Gift Boxes' },
  { id: '3', img: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=200&fit=crop', title: 'New Arrival' },
];

export default function HomeScreen({ navigation }) {
  const route = useRoute();
  const { signOut, user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Auto-sliding banner logic
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeBanner + 1) % BANNERS.length;
      setActiveBanner(nextIndex);
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [activeBanner]);

  useEffect(() => {
    if (route.params?.categoryId) {
      setSelectedCategory(route.params.categoryId);
    }
  }, [route.params?.categoryId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesData, productsData, cartRes] = await Promise.all([
        categoryService.getCategories().catch(() => []),
        productService.getProducts().catch(() => []),
        AsyncStorage.getItem('@giftcart_cart'),
      ]);
      setCategories(categoriesData || []);
      setAllProducts(productsData || []);
      setCartCount(cartRes ? JSON.parse(cartRes).length : 0);
    } catch (error) {
      if (error.response?.status === 401) signOut();
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const filteredProducts = useMemo(() => {
    let prods = allProducts;
    if (selectedCategory) {
      prods = prods.filter(p => p.category?._id === selectedCategory);
    }
    if (searchQuery) {
      prods = prods.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return prods;
  }, [allProducts, selectedCategory, searchQuery]);

  const addToCart = async (product) => {
    try {
      const raw = await AsyncStorage.getItem('@giftcart_cart');
      const items = raw ? JSON.parse(raw) : [];
      if (items.some(i => i._id === product._id)) {
        Alert.alert('Info', 'Product already in cart.');
        return;
      }
      const next = [...items, product];
      await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(next));
      setCartCount(next.length);
      Alert.alert('Cart', 'Product added to cart!');
    } catch (err) {
      Alert.alert('Error', 'Could not add to cart.');
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCardGrid}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.imgWrapper}>
        <Image
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&h=400&fit=crop' }}
          style={styles.productImageGrid}
        />
        {item.salePrice && item.price > item.salePrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.price - item.salePrice) / item.price) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>
      <View style={styles.prodInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        {item.weight ? <Text style={styles.productWeight}>{item.weight}</Text> : null}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{item.salePrice || item.price}</Text>
            {item.salePrice && item.price > item.salePrice && (
              <Text style={styles.listPrice}>₹{item.price}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => addToCart(item)}>
            <Ionicons name="add-circle" size={26} color="#D82B76" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setIsDrawerOpen(true)}>
          <Feather name="menu" size={28} color="#FF6A3D" />
        </TouchableOpacity>

        {!showSearch ? (
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/GiftorawithText2.png')}
              style={styles.logoImage}
            />
            {/* <Text style={styles.logoTextMain}>Gift</Text>
            <Text style={styles.logoTextSub}>Cart</Text> */}
          </View>
        ) : (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.searchIcon} onPress={() => setShowSearch(!showSearch)}>
            <Feather name={showSearch ? "x" : "search"} size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationText}>{user?.location || 'AJMER'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content (One Scrollable List) */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item._id}
        numColumns={2}
        ListHeaderComponent={
          <>
            {/* Auto-sliding Banners */}
            {!selectedCategory && (
            <View style={styles.bannerContainer}>
              <FlatList
                ref={bannerRef}
                data={BANNERS}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.mainBanner} />
                )}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                  setActiveBanner(idx);
                }}
              />
              <View style={styles.pagination}>
                {BANNERS.map((_, i) => (
                  <View key={i} style={[styles.dot, activeBanner === i && styles.activeDot]} />
                ))}
              </View>
            </View>
            )}

            {/* Categories */}
            <View style={styles.categoriesContainer}>
              <Text style={styles.sectionTitleHeader}>Explore Categories</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ _id: 'all', name: 'All' }, ...categories]}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.categoryScroll}
                renderItem={({ item }) => {
                  const isAll = item._id === 'all';
                  const isSelected = isAll ? !selectedCategory : selectedCategory === item._id;
                  return (
                    <TouchableOpacity
                      style={styles.categoryCircleItem}
                      onPress={() => setSelectedCategory(isAll ? null : item._id)}
                    >
                      <View style={[styles.circle, isSelected && styles.circleSelected]}>
                        {isAll ? (
                          <Ionicons name="apps" size={24} color={isSelected ? "#D82B76" : "#555"} />
                        ) : (
                          <Image source={{ uri: item.image || `https://api.dicebear.com/7.x/initials/png?seed=${item.name}` }} style={styles.circleImg} />
                        )}
                      </View>
                      <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* Ads Section (Flipkart style) */}
            {!selectedCategory && (
            <View style={styles.adsContainer}>
              <Text style={styles.sectionTitleHeader}>Special Deals</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={ADS}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.adsScroll}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.adCard}>
                    <Image source={{ uri: item.img }} style={styles.adImg} />
                    <View style={styles.adOverlay}>
                      <Text style={styles.adTitle}>{item.title}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
            )}

            <Text style={[styles.sectionTitleHeader, { marginBottom: 10 }]}>
              {selectedCategory ? categories.find(c => c._id === selectedCategory)?.name : 'Recommended For You'}
            </Text>
          </>
        }
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyBox}>
            {loading ? <ActivityIndicator color="#D82B76" /> : <Text style={styles.emptyText}>No products found</Text>}
          </View>
        )}
      />

      {/* Floating WhatsApp */}
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('WhatsApp', 'Opening support...')}>
        <FontAwesome name="whatsapp" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Drawer */}
      <Modal visible={isDrawerOpen} transparent animationType="fade">
        <View style={styles.drawerOverlay}>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setIsDrawerOpen(false)} />
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.logoTextMain}>GiftCart</Text>
              <TouchableOpacity onPress={() => setIsDrawerOpen(false)}><Feather name="x" size={24} color="#000" /></TouchableOpacity>
            </View>
            <View style={styles.drawerProfile}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text></View>
              <Text style={styles.drawerName}>{user?.name || 'Hello User'}</Text>
              <Text style={styles.drawerEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity style={styles.drawerItem} onPress={signOut}>
              <Feather name="log-out" size={20} color="#D82B76" /><Text style={[styles.drawerItemText, { color: '#D82B76' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { name: 'HOME', icon: 'home', screen: 'Home' },
          { name: 'COLLECTIONS', icon: 'grid', screen: 'Collections' },
          { name: 'WISHLIST', icon: 'heart', screen: 'Wishlist' },
          { name: 'CART', icon: 'shopping-cart', screen: 'Cart', badge: cartCount },
          { name: 'PROFILE', icon: 'user', screen: 'Profile' },
        ].map((tab, idx) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.bottomNavItem}
            onPress={() => navigation.navigate(tab.screen)}
          >
            <View>
              <Feather name={tab.icon} size={22} color={idx === 0 ? '#D82B76' : '#555'} />
              {tab.badge > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{tab.badge}</Text></View>
              )}
            </View>
            <Text style={[styles.bottomNavText, idx === 0 && { color: '#D82B76' }]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#ffffffff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  logoContainer: { flex: 1, alignItems: 'center' },
  logoTextMain: { fontSize: 24, fontWeight: '800', color: '#D82B76', fontStyle: 'italic' },
  logoTextSub: { fontSize: 16, fontWeight: '600', color: '#8A2761', marginTop: -8 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  locationButton: {
    borderWidth: 1, borderColor: '#DDD', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8
  },
  locationText: { fontSize: 10, fontWeight: '800' },
  listContent: { paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between', paddingHorizontal: 15 },
  bannerContainer: { height: 120, marginVertical: 15 },
  mainBanner: { width: width - 30, height: 120, borderRadius: 15, marginHorizontal: 15, resizeMode: 'cover' },
  pagination: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 3 },
  activeDot: { backgroundColor: '#FFF', width: 15 },
  categoriesContainer: { paddingBottom: 15 },
  sectionTitleHeader: { fontSize: 18, fontWeight: '800', color: '#333', marginLeft: 15, marginBottom: 15 },
  categoryScroll: { paddingHorizontal: 15 },
  categoryCircleItem: { alignItems: 'center', marginRight: 20, width: 65 },
  circle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF0F5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 5, overflow: 'hidden',
    borderWidth: 2, borderColor: 'transparent'
  },
  circleSelected: { borderColor: '#D82B76' },
  circleImg: { width: '100%', height: '100%' },
  categoryName: { fontSize: 10, fontWeight: '700', color: '#666', textAlign: 'center' },
  categoryNameSelected: { color: '#D82B76' },
  adsContainer: { paddingBottom: 25 },
  adsScroll: { paddingHorizontal: 15 },
  adCard: { width: 220, height: 80, marginRight: 15, borderRadius: 15, overflow: 'hidden' },
  adImg: { width: '100%', height: '100%' },
  adOverlay: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  adTitle: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  productCardGrid: { width: (width - 45) / 2, marginBottom: 20, backgroundColor: '#FFF', borderRadius: 15, elevation: 2, overflow: 'hidden' },
  imgWrapper: { width: '100%', height: 180, backgroundColor: '#F9F9F9' },
  productImageGrid: { width: '100%', height: '100%', resizeMode: 'cover' },
  prodInfo: { padding: 10 },
  productName: { fontSize: 13, minHeight: 18, fontWeight: '700', color: '#1a1a1a', marginTop: 2 },
  productWeight: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  priceContainer: { flex: 1 },
  productPrice: { fontSize: 15, fontWeight: '900', color: '#1a1a1a' },
  listPrice: { fontSize: 11, color: '#999', textDecorationLine: 'line-through', marginTop: -2 },
  discountBadge: {
    position: 'absolute', top: 10, left: 0, backgroundColor: '#00a65a',
    paddingHorizontal: 8, paddingVertical: 4, borderTopRightRadius: 10, borderBottomRightRadius: 10
  },
  discountText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  fab: {
    position: 'absolute', bottom: 90, right: 20, backgroundColor: '#25D366',
    width: 55, height: 55, borderRadius: 40, justifyContent: 'center', alignItems: 'center', elevation: 5
  },
  bottomNav: {
    position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: '#FFF',
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: Platform.OS === 'ios' ? 15 : 0
  },
  bottomNavItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottomNavText: { fontSize: 9, fontWeight: '800', marginTop: 4, color: '#555' },
  badge: {
    position: 'absolute', right: -8, top: -5, backgroundColor: '#D82B76',
    width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center'
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  drawerBackdrop: { flex: 1 },
  drawerContent: { width: width * 0.75, backgroundColor: '#FFF', padding: 20 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  drawerProfile: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { fontSize: 30, fontWeight: '700', color: '#D82B76' },
  drawerName: { fontSize: 18, fontWeight: '800' },
  drawerEmail: { fontSize: 12, color: '#888' },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  drawerItemText: { fontSize: 16, fontWeight: '700', marginLeft: 15 },
  emptyBox: { width: width - 30, height: 200, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
  searchContainer: { flex: 1, marginHorizontal: 10 },
  searchInput: { backgroundColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8 },
  menuButton: { padding: 5 },
  searchIcon: { padding: 8 },
  logoImage: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
});




