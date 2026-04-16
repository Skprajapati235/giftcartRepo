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
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import LocationSelectionModal from '../components/LocationSelectionModal';
import userService from '../services/userService';
import couponService from '../services/couponService';
import { useToast } from '../context/ToastContext';
import { ProductCardSkeleton, CategorySkeleton, BannerSkeleton, SearchBarSkeleton } from '../components/Skeleton';

const { width } = Dimensions.get('window');

const BANNERS = [
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=400&fit=crop',
];

export default function HomeScreen({ navigation }) {
  const route = useRoute();
  const { signOut, user, updateUser } = useContext(AuthContext);
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(!user?.state || !user?.city);
  const [locationLoading, setLocationLoading] = useState(false);
  const userLocation = user?.state && user?.city ? `${user.state}, ${user.city}` : 'Set your location';

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-sliding banner logic
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef(null);

  // Auto-sliding coupons logic
  const [activeCouponIdx, setActiveCouponIdx] = useState(0);
  const couponRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeBanner + 1) % BANNERS.length;
      setActiveBanner(nextIndex);
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [activeBanner]);

  useEffect(() => {
    if (activeCoupons.length > 0) {
      const timer = setInterval(() => {
        const nextIndex = (activeCouponIdx + 1) % activeCoupons.length;
        setActiveCouponIdx(nextIndex);
        couponRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeCouponIdx, activeCoupons]);

  useEffect(() => {
    if (route.params?.categoryId) {
      setSelectedCategory(route.params.categoryId);
    }
  }, [route.params?.categoryId]);

  const loadData = useCallback(async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = isInitial ? 1 : page;

      const [categoriesData, prodResp, couponsData, cartRes] = await Promise.all([
        categoryService.getCategories({ limit: 50 }).catch(() => ({ data: [] })),
        productService.getProducts({
          page: currentPage,
          limit: 10,
          search: searchQuery,
          category: selectedCategory === 'all' ? null : selectedCategory
        }),
        couponService.getActiveCoupons({ limit: 20 }).catch(() => ({ data: [] })),
        AsyncStorage.getItem('@giftcart_cart'),
      ]);

      const newProducts = prodResp.data || [];
      if (isInitial) {
        setProducts(newProducts);
        setCategories(categoriesData?.data || []);
        setActiveCoupons(couponsData?.data || []);
        setCartCount(cartRes ? JSON.parse(cartRes).length : 0);
        setPage(2);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
      }

      setHasMore(currentPage < (prodResp.totalPages || 1));
    } catch (error) {
      if (error.response?.status === 401) signOut();
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [signOut, page, searchQuery, selectedCategory]);

  useEffect(() => {
    loadData(true);
  }, [searchQuery, selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadData(false);
    }
  };

  const addToCart = async (product) => {
    try {
      const raw = await AsyncStorage.getItem('@giftcart_cart');
      const items = raw ? JSON.parse(raw) : [];
      if (items.some(i => i._id === product._id)) {
        showToast('Product already in cart.', 'info');
        return;
      }
      const next = [...items, product];
      await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(next));
      setCartCount(next.length);
      showToast('Product added to cart!', 'success');
    } catch (err) {
      showToast('Could not add to cart.', 'error');
    }
  };

  const handleLocationSelect = async (state, city) => {
    setLocationLoading(true);
    try {
      const updatedUser = await userService.updateProfile({
        state,
        city,
      });
      await updateUser(updatedUser);
      setShowLocationModal(false);
      showToast('Location saved successfully!', 'success');
    } catch (error) {
      console.log('Location selection error:', error);
      showToast('Failed to save location.', 'error');
    } finally {
      setLocationLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCardGrid}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <View style={styles.imgWrapper}>
        <Image
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&h=400&fit=crop' }}
          style={styles.productImageGrid}
        />
        <View style={styles.cardHeaderActions}>
          {item.salePrice && item.price > item.salePrice && (
            <View style={styles.discountBadgeSmall}>
              <Text style={styles.discountTextSmall}>
                {Math.round(((item.price - item.salePrice) / item.price) * 100)}% OFF
              </Text>
            </View>
          )}
          <View style={styles.ratingBadgeSmall}>
            <Ionicons name="star" size={10} color="#FBC02D" />
            <Text style={styles.ratingTextSmall}>{item.ratings?.toFixed(1) || '4.2'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.prodInfo}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[styles.productName, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
          {item.expectedDeliveryDate && (
            <View style={styles.deliveryBadgeHome}>
              <Feather name="truck" size={8} color="#D82B76" />
              <Text style={styles.deliveryDateTextHome}>{item.expectedDeliveryDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.priceRowMain}>
          <View>
            <View style={styles.priceContainerHome}>
              <Text style={styles.productPriceHome}>₹{item.salePrice || item.price}</Text>
              {item.salePrice && item.price > item.salePrice && (
                <Text style={styles.listPriceHome}>₹{item.price}</Text>
              )}
            </View>
            {item.weight || item.flowers ? (
              <Text style={styles.productSubHome} numberOfLines={1}>
                {item.weight || item.flowers + ' flowers'}
              </Text>
            ) : (
              <Text style={styles.productSubHome}>Special Gift Case</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.addBtnGrid}
            onPress={() => addToCart(item)}
          >
            <Ionicons name="cart-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setIsDrawerOpen(true)}>
            <Feather name="menu" size={28} color="#FF6A3D" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/GiftorawithText2.png')}
              style={styles.logoImage}
            />
          </View>

          <View style={styles.headerRight}>
            <View style={styles.headerUser}>
              <View style={styles.userInfo}>
                <Text style={styles.userHi}>Hi, {user?.name?.split(' ')[0] || 'Guest'}</Text>
                <Text style={styles.locationText}>{userLocation}</Text>
              </View>
              <TouchableOpacity style={styles.userAvatar} onPress={() => navigation.navigate('Profile')}>
                {user?.profilePic ? (
                  <Image source={{ uri: user.profilePic }} style={styles.userAvatarImage} />
                ) : (
                  <Text style={styles.userAvatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Content (One Scrollable List) */}
        <FlatList
          data={loading ? [1, 2, 3, 4, 5, 6] : products}
          keyExtractor={(item, index) => loading ? `sk-${index}` : item._id}
          numColumns={2}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={loading ? null : handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            loading ? (
              <View style={{ paddingTop: 10 }}>
                <SearchBarSkeleton />
                <BannerSkeleton />
                <View style={styles.categoriesContainer}>
                  <Text style={styles.sectionTitleHeader}>Explore Categories</Text>
                  <View style={{ flexDirection: 'row', paddingLeft: 20, paddingTop: 15, marginBottom: 20 }}>
                    {[1, 2, 3, 4, 5].map((i) => <CategorySkeleton key={i} />)}
                  </View>
                </View>
                <Text style={[styles.sectionTitleHeader, { marginBottom: 15 }]}>Recommended For You</Text>
              </View>
            ) : (
              <>
                <View style={styles.searchSection}>
                  <Feather name="search" size={18} color="#999" />
                  <TextInput
                    style={styles.bodySearchInput}
                    placeholder="Search gifts, products or categories"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                  />
                </View>
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
                      getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                      onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                          bannerRef.current?.scrollToIndex({ index: info.index, animated: false });
                        }, 100);
                      }}
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

                {/* Coupons Section (Replaces Ads) */}
                {activeCoupons.length > 0 && !selectedCategory && (
                  <View style={styles.adsContainer}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionTitleHeader}>Hot Offers & Coupons</Text>
                      <Ionicons name="flame" size={20} color="#FF6A3D" />
                    </View>
                    <FlatList
                      ref={couponRef}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={activeCoupons}
                      pagingEnabled
                      snapToInterval={width - 15}
                      decelerationRate="fast"
                      keyExtractor={item => item._id}
                      contentContainerStyle={styles.adsScroll}
                      getItemLayout={(_, index) => ({
                        length: width - 15,
                        offset: (width - 15) * index,
                        index,
                      })}
                      onScrollToIndexFailed={(info) => {
                        setTimeout(() => {
                          couponRef.current?.scrollToIndex({ index: info.index, animated: false });
                        }, 100);
                      }}
                      renderItem={({ item, index }) => (
                        <TouchableOpacity
                          style={styles.couponCardAd}
                          activeOpacity={0.9}
                          onPress={() => navigation.navigate('Offers')}
                        >
                          {item.image ? (
                            <View style={{ flex: 1 }}>
                              <Image source={{ uri: item.image }} style={styles.couponAdImg} />
                              <View style={styles.couponOverlay}>
                                <View style={styles.couponOverlayTop}>
                                  <View style={styles.discountOverlayBadge}>
                                    <Text style={styles.discountOverlayText}>
                                      {item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `FLAT ₹${item.discountValue} OFF`}
                                    </Text>
                                  </View>
                                  <View style={styles.liveBadge}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>LIVE</Text>
                                  </View>
                                </View>
                                <View style={styles.couponOverlayBottom}>
                                  <Text style={styles.overlayMinOrder}>Min. ₹{item.minOrderAmount}</Text>
                                </View>
                              </View>
                            </View>
                          ) : (
                            <View style={[styles.couponCardFallback, { backgroundColor: index % 2 === 0 ? '#1E293B' : '#D82B76' }]}>
                              <View style={styles.couponDeco} />
                              <View style={styles.couponBody}>
                                <Text style={styles.couponCardTitle}>
                                  {item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `₹${item.discountValue} OFF`}
                                </Text>
                                <View style={styles.codePill}>
                                  <Text style={styles.codePillText}>{item.code}</Text>
                                </View>
                              </View>
                              <View style={styles.couponDecoRight} />
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                      onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 15));
                        setActiveCouponIdx(idx);
                      }}
                    />
                  </View>
                )}

                <Text style={[styles.sectionTitleHeader, { marginBottom: 10 }]}>
                  {selectedCategory ? categories.find(c => c._id === selectedCategory)?.name : 'Recommended For You'}
                </Text>
              </>
            )
          }
          renderItem={loading ? () => <ProductCardSkeleton /> : renderProduct}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color="#D82B76" />
              </View>
            ) : null
          )}
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
                <TouchableOpacity style={styles.drawerAvatar} onPress={() => { setIsDrawerOpen(false); navigation.navigate('Profile'); }}>
                  {user?.profilePic ? (
                    <Image source={{ uri: user.profilePic }} style={styles.drawerAvatarImage} />
                  ) : (
                    <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text></View>
                  )}
                </TouchableOpacity>
                <Text style={styles.drawerName}>{user?.name || 'Hello User'}</Text>
                <Text style={styles.drawerEmail}>{user?.email}</Text>
                <Text style={styles.drawerLocation}>{userLocation}</Text>
              </View>
              <TouchableOpacity style={styles.drawerItem} onPress={() => { setIsDrawerOpen(false); navigation.navigate('Profile'); }}>
                <Feather name="user" size={20} color="#111" /><Text style={styles.drawerItemText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.drawerItem} onPress={() => { setIsDrawerOpen(false); navigation.navigate('MyOrders'); }}>
                <Feather name="shopping-bag" size={20} color="#111" /><Text style={styles.drawerItemText}>My Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.drawerItem} onPress={() => { setIsDrawerOpen(false); navigation.navigate('Wishlist'); }}>
                <Feather name="heart" size={20} color="#111" /><Text style={styles.drawerItemText}>Wishlist</Text>
              </TouchableOpacity>
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
            { name: 'MY ORDERS', icon: 'shopping-bag', screen: 'MyOrders' },
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

      <LocationSelectionModal
        visible={showLocationModal}
        onLocationSelect={handleLocationSelect}
        loading={locationLoading}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  logoContainer: { flex: 1, alignItems: 'center' },
  logoTextMain: { fontSize: 24, fontWeight: '800', color: '#D82B76', fontStyle: 'italic' },
  logoTextSub: { fontSize: 16, fontWeight: '600', color: '#8A2761', marginTop: -8 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  locationButton: {
    borderWidth: 1, borderColor: '#DDD', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8
  },
  locationText: { fontSize: 10, fontWeight: '800', color: '#444' },
  headerUser: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  userInfo: { marginRight: 10, alignItems: 'flex-end' },
  userHi: { fontSize: 12, fontWeight: '800', color: '#111' },
  userAvatar: { width: 42, height: 42, borderRadius: 22, overflow: 'hidden', backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  userAvatarImage: { width: '100%', height: '100%' },
  userAvatarText: { fontSize: 16, fontWeight: '900', color: '#D82B76' },
  drawerAvatar: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', marginBottom: 12, justifyContent: 'center', alignItems: 'center' },
  drawerAvatarImage: { width: '100%', height: '100%' },
  drawerLocation: { color: '#777', fontSize: 12, marginTop: 4, textAlign: 'center' },
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
  adsContainer: { paddingBottom: 10, marginBottom: 10 },
  adsScroll: { paddingHorizontal: 15, paddingVertical: 10 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5, paddingHorizontal: 15 },
  couponCardAd: {
    width: width - 30, height: 100, marginRight: 15, borderRadius: 18,
    overflow: 'hidden', backgroundColor: '#FFF',
  },
  couponAdImg: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 18 },
  couponOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'space-between', padding: 12, borderRadius: 18
  },
  couponOverlayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  discountOverlayBadge: {
    backgroundColor: '#D82B76', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, elevation: 3
  },
  discountOverlayText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  liveText: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  couponOverlayBottom: { flexDirection: 'row', justifyContent: 'flex-start' },
  overlayMinOrder: {
    color: '#FFF', fontSize: 11, fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8
  },
  couponCardFallback: {
    flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
    position: 'relative'
  },
  couponDeco: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', position: 'absolute', left: -14, top: 38 },
  couponDecoRight: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', position: 'absolute', right: -14, top: 38 },
  couponBody: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  couponCardTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  codePill: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 5,
    borderRadius: 10, marginVertical: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: '#FFF'
  },
  codePillText: { color: '#FFF', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  productCardGrid: {
    backgroundColor: '#FFF',
    width: (width - 45) / 2,
    marginBottom: 15,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  imgWrapper: { width: '100%', height: 140, backgroundColor: '#F9F9F9', position: 'relative' },
  productImageGrid: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardHeaderActions: {
    position: 'absolute', top: 8, left: 8, right: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  discountBadgeSmall: { backgroundColor: '#D82B76', paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 5 },
  discountTextSmall: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  ratingBadgeSmall: {
    backgroundColor: 'rgba(255,255,255,0.92)', flexDirection: 'row', alignItems: 'center',
    gap: 2, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 5
  },
  ratingTextSmall: { fontSize: 9, fontWeight: '800', color: '#1A1A1A' },

  prodInfo: { padding: 9 },
  productName: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 6, height: 16 },
  priceRowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainerHome: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  productPriceHome: { fontSize: 14, fontWeight: '900', color: '#111827' },
  listPriceHome: { fontSize: 9, color: '#94A3B8', textDecorationLine: 'line-through' },
  productSubHome: { fontSize: 9, color: '#64748B', marginTop: 1, fontWeight: '600' },

  addBtnGrid: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#D82B76', justifyContent: 'center', alignItems: 'center' },
  deliveryBadgeHome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 5,
  },
  deliveryDateTextHome: {
    fontSize: 7,
    fontWeight: '800',
    color: '#D82B76',
  },
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
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 8,
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 18,
    gap: 10,
    elevation: 2,
    width: width - 30,
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f25656ff',

  },
  bodySearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    color: '#111',
  },
  searchIcon: { padding: 8 },
  menuButton: { padding: 5 },
  logoImage: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
});
