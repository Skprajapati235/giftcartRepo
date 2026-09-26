import React, { useCallback, useContext, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  useWindowDimensions,
  Platform,
  TextInput,
  Modal,
  StatusBar,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import categoryService from '../services/categoryService';
import occasionService from '../services/occasionService';
import productService from '../services/productService';
import LocationSelectionModal from '../components/LocationSelectionModal';
import userService from '../services/userService';
import couponService from '../services/couponService';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton, CategorySkeleton, BannerSkeleton, SearchBarSkeleton } from '../components/Skeleton';
import { SafeScreen, BottomTabBar } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import useDeliveryHours from '../hooks/useDeliveryHours';
import { colors, shadows } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const GRID_H_PADDING = 14;
const GRID_GAP = 12;

const heroSlides = [
  {
    tag: "Fresh Blooms",
    title: "Flowers Worth\nEvery Celebration",
    desc: "Hand-tied bouquets delivered within hours, farm to doorstep.",
    cta: "Shop Flowers",
    categoryMatch: "flower",
    img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=85&w=1000&auto=format&fit=crop",
  },
  {
    tag: "Artisan Cakes",
    title: "Cakes Baked For\nSpecial Milestones",
    desc: "Freshly baked, delivered chilled and celebration-ready.",
    cta: "Shop Cakes",
    categoryMatch: "cake",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=85&w=1000&auto=format&fit=crop",
  },
  {
    tag: "Curated Hampers",
    title: "Gifts That Make\nMemories Last",
    desc: "Curated gift boxes for every relationship and festive moment.",
    cta: "Shop Gifts",
    categoryMatch: "gift",
    img: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=85&w=1000&auto=format&fit=crop",
  },
];

const fallbackOccasions = [
  {
    _id: 'birthday',
    name: 'Birthday',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop',
  },
  {
    _id: 'anniversary',
    name: 'Anniversary',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400&auto=format&fit=crop',
  },
  {
    _id: 'congratulations',
    name: 'Congratulations',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=400&auto=format&fit=crop',
  },
  {
    _id: 'wedding',
    name: 'Wedding',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop',
  },
  {
    _id: 'festivals',
    name: 'Festivals',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=400&auto=format&fit=crop',
  },
  {
    _id: 'valentine',
    name: "Valentine's",
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=400&auto=format&fit=crop',
  },
];

const getCouponBgImage = (coupon) => {
  if (coupon?.image && typeof coupon.image === 'string' && coupon.image.trim().length > 0) {
    return coupon.image;
  }
  if (coupon?.couponImage && typeof coupon.couponImage === 'string' && coupon.couponImage.trim().length > 0) {
    return coupon.couponImage;
  }
  if (coupon?.applicableProducts?.length > 0 && coupon.applicableProducts[0]?.image) {
    return coupon.applicableProducts[0].image;
  }
  if (coupon?.applicableOccasions?.length > 0 && coupon.applicableOccasions[0]?.image) {
    return coupon.applicableOccasions[0].image;
  }
  return 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop';
};

export default function HomeScreen({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const productCardWidth = Math.floor((screenWidth - GRID_H_PADDING * 2 - GRID_GAP) / 2);
  const route = useRoute();
  const { signOut, user, updateUser } = useContext(AuthContext);
  const { cart, addToCart: addToCartContext } = useCart();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState(fallbackOccasions);
  const [products, setProducts] = useState([]);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const userLocation = user?.state && user?.city ? `${user.city}, ${user.state}` : 'Select City';
  const { tabBarHeight } = useLayoutInsets();
  const deliveryHours = useDeliveryHours();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Hero carousel slider
  const [activeSlide, setActiveSlide] = useState(0);
  const heroRef = useRef(null);

  // Auto-sliding coupon ads
  const [activeCouponIdx, setActiveCouponIdx] = useState(0);
  const couponRef = useRef(null);

  const handleHeroCta = (slide) => {
    if (slide.categoryMatch) {
      const matchLower = slide.categoryMatch.toLowerCase();
      const found = categories.find((c) =>
        c.name.toLowerCase().includes(matchLower)
      );
      if (found) {
        handleSelectCategory(found._id);
        return;
      }
    }
    navigation.navigate('Collections');
  };

  // Check Location Prompt on Mount
  useEffect(() => {
    const checkLocation = async () => {
      if (user) {
        setShowLocationModal(!user?.state || !user?.city);
        return;
      }
      try {
        const raw = await AsyncStorage.getItem('@giftcart_guest_location');
        setShowLocationModal(!raw);
      } catch {
        setShowLocationModal(true);
      }
    };
    checkLocation();
  }, [user?.state, user?.city]);

  // Hero Carousel Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeSlide + 1) % heroSlides.length;
      setActiveSlide(nextIndex);
      heroRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 4500);
    return () => clearInterval(timer);
  }, [activeSlide]);

  // Coupon Carousel Autoplay
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
    if (route.params?.occasionId) {
      setSelectedOccasion(route.params.occasionId);
    }
  }, [route.params?.categoryId, route.params?.occasionId]);

  const loadData = useCallback(async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = isInitial ? 1 : page;
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
      };

      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedOccasion && selectedOccasion !== 'all') {
        params.occasion = selectedOccasion;
      }

      const [categoriesData, prodResp, couponsData, occasionData] = await Promise.all([
        categoryService.getCategories({ limit: 50 }).catch(() => ({ data: [] })),
        productService.getProductsWithPagination(params),
        couponService.getActiveCoupons({ limit: 20 }).catch(() => ({ data: [] })),
        occasionService.getOccasions().catch(() => ({ data: [] })),
      ]);

      const newProducts = prodResp.products || [];
      const occList = Array.isArray(occasionData)
        ? occasionData
        : occasionData?.data || occasionData?.occasions || [];

      if (isInitial) {
        setProducts(newProducts);
        setCategories(categoriesData?.data || []);
        setActiveCoupons(couponsData?.data || []);
        setOccasions(occList.length > 0 ? occList : fallbackOccasions);
        setPage(2);
      } else {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const uniqueNew = newProducts.filter((p) => !existingIds.has(p._id));
          return [...prev, ...uniqueNew];
        });
        setPage((prev) => prev + 1);
      }

      setHasMore(prodResp.hasMore);
    } catch (error) {
      if (error.response?.status === 401) signOut();
      showToast('Could not refresh products', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [signOut, page, searchQuery, selectedCategory, selectedOccasion, showToast]);

  useEffect(() => {
    loadData(true);
  }, [searchQuery, selectedCategory, selectedOccasion]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      loadData(false);
    }
  };

  const handleSelectCategory = (catId) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
    }
  };

  const handleSelectOccasion = (occId) => {
    if (selectedOccasion === occId) {
      setSelectedOccasion(null);
    } else {
      setSelectedOccasion(occId);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedOccasion(null);
    setSearchQuery('');
  };

  const addToCart = async (product) => {
    if (deliveryHours.isCurrentlyRestricted) {
      Alert.alert(
        '🌙 Night Delivery Paused',
        deliveryHours.message || `Orders are currently paused. Deliveries resume after ${deliveryHours.nextAvailableTime || '7:00 AM'}.`,
        [{ text: 'OK' }]
      );
      return;
    }
    await addToCartContext(product);
    showToast(`Added ${product.name} to cart! 🛍️`, 'success');
  };

  const handleLocationSelect = async (state, city) => {
    setLocationLoading(true);
    try {
      if (user) {
        const updatedUser = await userService.updateProfile({ state, city });
        await updateUser(updatedUser);
      } else {
        await AsyncStorage.setItem('@giftcart_guest_location', JSON.stringify({ state, city }));
      }
      setShowLocationModal(false);
      showToast('Location saved successfully!', 'success');
      loadData(true);
    } catch (error) {
      showToast('Failed to save location.', 'error');
    } finally {
      setLocationLoading(false);
    }
  };

  const activeCategoryObj = categories.find((c) => c._id === selectedCategory);
  const activeOccasionObj = occasions.find((o) => o._id === selectedOccasion);
  const activeFilterTitle = [
    activeCategoryObj?.name,
    activeOccasionObj?.name ? `${activeOccasionObj.name} Gifts` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      cardWidth={productCardWidth}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      onAddToCart={() => addToCartContext(item)}
      deliveryStatus={deliveryHours}
    />
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#741343" />
      <SafeScreen style={styles.container}>
        {/* ── Top Festive Brand Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsDrawerOpen(true)}
            activeOpacity={0.7}
          >
            <Feather name="menu" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoIconWrap}>
              <Image
                source={require('../assets/images/GiftFestiveIcon.png')}
                style={styles.logoIcon}
              />
            </View>
            <View style={styles.brandTextColumn}>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTextGift}>Gift</Text>
                <Text style={styles.brandTextFestive}>Festive</Text>
                <Ionicons name="sparkles" size={11} color="#FFD166" style={styles.brandSparkleIcon} />
              </View>
              {/* <View style={styles.taglineRow}>
                <Text style={styles.brandTagline}>GIFTING HAPPINESS</Text>
                <View style={styles.taglineDot} />
                <Text style={styles.brandTaglineCity}>FARIDABAD</Text>
              </View> */}
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.locationPill}
              onPress={() => setShowLocationModal(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="location-sharp" size={13} color="#FFD166" />
              <Text style={styles.locationText} numberOfLines={1}>
                {user?.city || 'City'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.userAvatar}
              onPress={() => navigation.navigate(user ? 'Profile' : 'Login')}
              activeOpacity={0.8}
            >
              {user?.profilePic ? (
                <Image source={{ uri: user.profilePic }} style={styles.userAvatarImage} />
              ) : (
                <Text style={styles.userAvatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Main Scrollable Feed ── */}
        <FlatList
          style={styles.feedList}
          data={loading ? [1, 2, 3, 4] : products}
          keyExtractor={(item, index) => (loading ? `sk-${index}` : item._id)}
          numColumns={2}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={loading ? null : handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <>
              {/* ── Night Delivery Restriction Banner ── */}
              {deliveryHours.isCurrentlyRestricted && (
                <View style={styles.nightBanner}>
                  <View style={styles.nightBannerContent}>
                    <Text style={styles.nightMoon}>🌙</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nightTitle}>Night Delivery Paused —</Text>
                      <Text style={styles.nightSubtitle}>
                        Orders resume after {deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}. Catalog browsing is open.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* ── Festive Search Bar ── */}
              <View style={styles.searchSection}>
                <Feather name="search" size={18} color={colors.brandBerry} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search flowers, cakes, hampers & gifts..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x" size={16} color="#999" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* ── Adaptive Hero Carousel Banner ── */}
              {!selectedCategory && !selectedOccasion && (
                <View style={styles.heroSection}>
                  <FlatList
                    ref={heroRef}
                    data={heroSlides}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, index) => index.toString()}
                    getItemLayout={(_, index) => ({ length: width - 28, offset: (width - 28) * index, index })}
                    renderItem={({ item }) => (
                      <View style={[styles.heroCard, { width: width - 28 }]}>
                        {/* Right Photo Container with Seamless Blend */}
                        <View style={styles.heroImageContainer}>
                          <Image
                            source={{ uri: item.img }}
                            style={styles.heroImage}
                            resizeMode="cover"
                          />
                          {/* Smooth seamless blend feathering the left edge of the photo into the card */}
                          <LinearGradient
                            colors={[
                              '#FFF5F8',
                              '#FFF5F8',
                              'rgba(255, 245, 248, 0.95)',
                              'rgba(255, 245, 248, 0.70)',
                              'rgba(255, 245, 248, 0.25)',
                              'transparent',
                            ]}
                            locations={[0, 0.12, 0.28, 0.52, 0.78, 1]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.heroImageFade}
                          />
                        </View>

                        <View style={styles.heroContent}>
                          <View style={styles.heroTagBadge}>
                            <Text style={styles.heroTagText}>✨ {item.tag}</Text>
                          </View>

                          <Text style={styles.heroTitle}>{item.title}</Text>
                          <Text style={styles.heroDesc} numberOfLines={2}>{item.desc}</Text>

                          <TouchableOpacity
                            style={styles.heroCtaBtn}
                            onPress={() => handleHeroCta(item)}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.heroCtaText}>{item.cta}</Text>
                            <Feather name="arrow-right" size={13} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 28));
                      setActiveSlide(idx);
                    }}
                  />

                  {/* Pagination Dots */}
                  <View style={styles.heroPagination}>
                    {heroSlides.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.heroDot,
                          activeSlide === i && styles.heroDotActive,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* ── 4 Trust & Benefits Badges (2x2 grid matching giftfestive-main) ── */}
              <View style={styles.trustGrid}>
                <View style={styles.trustCard}>
                  <View style={styles.trustIconBox}>
                    <Feather name="truck" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trustTitle}>Same Day Delivery</Text>
                    <Text style={styles.trustSubtitle}>Within 2-3 hours</Text>
                  </View>
                </View>

                <View style={styles.trustCard}>
                  <View style={styles.trustIconBox}>
                    <Feather name="check-circle" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trustTitle}>100% Fresh</Text>
                    <Text style={styles.trustSubtitle}>Bakery & farm fresh</Text>
                  </View>
                </View>

                <View style={styles.trustCard}>
                  <View style={styles.trustIconBox}>
                    <Feather name="shield" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trustTitle}>Secure Checkout</Text>
                    <Text style={styles.trustSubtitle}>UPI, Cards & COD</Text>
                  </View>
                </View>

                <View style={styles.trustCard}>
                  <View style={styles.trustIconBox}>
                    <Feather name="gift" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trustTitle}>Free Gift Card</Text>
                    <Text style={styles.trustSubtitle}>Festive note included</Text>
                  </View>
                </View>
              </View>

              {/* ── Shop by Category Section ── */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionPreTitle}>COLLECTIONS</Text>
                    <Text style={styles.sectionMainTitle}>Shop by Category</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewAllPill}
                    onPress={() => navigation.navigate('Collections')}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat._id;
                    return (
                      <TouchableOpacity
                        key={cat._id}
                        style={styles.categoryItem}
                        onPress={() => handleSelectCategory(cat._id)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.categoryCircle, isSelected && styles.categoryCircleActive]}>
                          <Image
                            source={{ uri: cat.image || `https://api.dicebear.com/7.x/initials/png?seed=${cat.name}` }}
                            style={styles.categoryImg}
                          />
                        </View>
                        <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]} numberOfLines={1}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* ── Shop by Occasion Section ── */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionPreTitle}>MOMENTS</Text>
                    <Text style={styles.sectionMainTitle}>Shop by Occasion</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewAllPill}
                    onPress={() => navigation.navigate('Collections')}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                >
                  {occasions.map((occ) => {
                    const isSelected = selectedOccasion === occ._id;
                    return (
                      <TouchableOpacity
                        key={occ._id}
                        style={styles.categoryItem}
                        onPress={() => handleSelectOccasion(occ._id)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.occasionCircle, isSelected && styles.occasionCircleActive]}>
                          <Image source={{ uri: occ.image }} style={styles.categoryImg} />
                        </View>
                        <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]} numberOfLines={1}>
                          {occ.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* ── Hot Offers & Coupons (when available) ── */}
              {activeCoupons.length > 0 && !selectedCategory && !selectedOccasion && (
                <View style={styles.offersSection}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.sectionMainTitle}>Festive Coupons & Offers</Text>
                      <Ionicons name="flame" size={18} color={colors.secondary} />
                    </View>
                    <TouchableOpacity
                      style={styles.viewAllPill}
                      onPress={() => navigation.navigate('Offers')}
                    >
                      <Text style={styles.viewAllText}>All Coupons</Text>
                    </TouchableOpacity>
                  </View>

                  <FlatList
                    ref={couponRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={activeCoupons}
                    pagingEnabled
                    snapToInterval={width - 28}
                    decelerationRate="fast"
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.horizontalScroll}
                    renderItem={({ item }) => {
                      const bgImg = getCouponBgImage(item);
                      return (
                        <TouchableOpacity
                          style={[styles.couponCard, { width: width - 28 }]}
                          activeOpacity={0.9}
                          onPress={() => navigation.navigate('Offers')}
                        >
                          {/* Background image from backend */}
                          {bgImg ? (
                            <Image
                              source={{ uri: bgImg }}
                              style={StyleSheet.absoluteFillObject}
                              resizeMode="cover"
                            />
                          ) : null}

                          {/* Rich gradient overlay for luxury contrast and readability */}
                          <LinearGradient
                            colors={['rgba(28, 6, 20, 0.90)', 'rgba(50, 12, 35, 0.76)', 'rgba(28, 6, 20, 0.88)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFillObject}
                          />

                          <View style={styles.couponLeft}>
                            <View style={styles.couponTagPill}>
                              <Text style={styles.couponTagText}>✨ FESTIVE OFFER</Text>
                            </View>
                            <Text style={styles.couponDiscountText}>
                              {item.discountType === 'percentage'
                                ? `${item.discountValue}% OFF`
                                : `FLAT ₹${item.discountValue} OFF`}
                            </Text>
                            <Text style={styles.couponMinOrder}>
                              {item.minOrderAmount > 0
                                ? `Min. Order ₹${item.minOrderAmount}`
                                : 'No min. order required'}
                            </Text>
                          </View>

                          <View style={styles.couponDivider} />

                          <View style={styles.couponRight}>
                            <View style={styles.couponCodePill}>
                              <Text style={styles.couponCodeText}>{item.code}</Text>
                            </View>
                            <Text style={styles.couponTapApply}>Tap to view &rarr;</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    onMomentumScrollEnd={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 28));
                      setActiveCouponIdx(idx);
                    }}
                  />
                </View>
              )}

              {/* ── Product Feed Header ── */}
              <View style={styles.feedHeaderRow}>
                <View>
                  <Text style={styles.sectionPreTitle}>
                    {activeFilterTitle ? 'SELECTED FOR YOU' : 'CURATED RANGE'}
                  </Text>
                  <Text style={styles.sectionMainTitle}>
                    {activeFilterTitle || 'Recommended For You'}
                  </Text>
                </View>

                {(selectedCategory || selectedOccasion) && (
                  <TouchableOpacity
                    style={styles.clearFilterBtn}
                    onPress={clearAllFilters}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={13} color={colors.brandBerry} />
                    <Text style={styles.clearFilterText}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          }
          renderItem={loading ? () => <ProductCardSkeleton cardWidth={productCardWidth} /> : renderProduct}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 70 }]}
          columnWrapperStyle={[styles.columnWrapper, { gap: GRID_GAP, paddingHorizontal: GRID_H_PADDING }]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() =>
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator color={colors.brandBerry} />
              </View>
            ) : !hasMore && products.length > 6 ? (
              <View style={styles.endBanner}>
                <Text style={styles.endBannerText}>✨ All {products.length} products loaded</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={() =>
            !loading && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🎁</Text>
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptySubtitle}>Try choosing another category or clearing your filters.</Text>
                <TouchableOpacity style={styles.emptyClearBtn} onPress={clearAllFilters}>
                  <Text style={styles.emptyClearText}>Show All Gifts</Text>
                </TouchableOpacity>
              </View>
            )
          }
        />

        {/* ── Floating WhatsApp Support Button ── */}
        <TouchableOpacity
          style={[styles.floatingSupportBtn, { bottom: tabBarHeight + 16 }]}
          onPress={() => navigation.navigate('CustomerSupport')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="headset" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* ── Premium Luxury Drawer Menu ── */}
        <Modal visible={isDrawerOpen} transparent animationType="fade">
          <View style={styles.drawerOverlay}>
            <TouchableOpacity
              style={styles.drawerBackdrop}
              onPress={() => setIsDrawerOpen(false)}
              activeOpacity={1}
            />
            <View style={styles.drawerContent}>
              {/* 1. Luxury Gradient Header */}
              <View style={styles.drawerHeaderWrap}>
                <LinearGradient
                  colors={['#741343', '#520B2E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.drawerHeaderRow}>
                  <Image
                    source={require('../assets/images/websitelogoimages.png')}
                    style={styles.drawerOfficialLogo}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.drawerCloseBtn}
                    onPress={() => setIsDrawerOpen(false)}
                    activeOpacity={0.75}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="x" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView
                style={styles.drawerScroll}
                contentContainerStyle={styles.drawerScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 2. User Profile / Guest Card */}
                {user ? (
                  <View style={styles.drawerProfileCard}>
                    <LinearGradient
                      colors={['#FFF5F8', '#FFF9F0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.drawerProfileRow}>
                      <TouchableOpacity
                        style={styles.drawerAvatarWrap}
                        onPress={() => {
                          setIsDrawerOpen(false);
                          navigation.navigate('Profile');
                        }}
                        activeOpacity={0.8}
                      >
                        {user?.profilePic ? (
                          <Image source={{ uri: user.profilePic }} style={styles.drawerAvatarImg} />
                        ) : (
                          <LinearGradient
                            colors={['#741343', '#D82B76']}
                            style={styles.drawerAvatarFallbackGrad}
                          >
                            <Text style={styles.drawerAvatarInitText}>
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                          </LinearGradient>
                        )}
                      </TouchableOpacity>

                      <View style={styles.drawerProfileInfo}>
                        <View style={styles.drawerNameRow}>
                          <Text style={styles.drawerUserName} numberOfLines={1}>
                            {user?.name || 'Festive Member'}
                          </Text>
                          <View style={styles.vipBadge}>
                            <Text style={styles.vipBadgeText}>VIP</Text>
                          </View>
                        </View>
                        <Text style={styles.drawerUserContact} numberOfLines={1}>
                          {user?.mobileNumber ? `+91 ${user.mobileNumber}` : (user?.email || 'Festive Account')}
                        </Text>
                        <View style={styles.drawerCityPill}>
                          <Ionicons name="location-sharp" size={11} color={colors.primary} />
                          <Text style={styles.drawerCityText} numberOfLines={1}>
                            {userLocation || 'Faridabad, HR'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.drawerManageBtn}
                      onPress={() => {
                        setIsDrawerOpen(false);
                        navigation.navigate('Profile');
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.drawerManageBtnText}>Manage Profile</Text>
                      <Feather name="arrow-right" size={12} color="#D82B76" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.drawerGuestCard}>
                    <LinearGradient
                      colors={['#FFF5F8', '#FFF8EB']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.guestHeaderRow}>
                      <Text style={styles.guestSparkle}>✨</Text>
                      <Text style={styles.guestWelcomeTitle}>WELCOME TO GIFTFESTIVE</Text>
                    </View>
                    <Text style={styles.guestSubtitle}>
                      Sign in to track orders, save gifts & enjoy exclusive festive discounts!
                    </Text>
                    <TouchableOpacity
                      style={styles.guestLoginBtn}
                      onPress={() => {
                        setIsDrawerOpen(false);
                        navigation.navigate('Login');
                      }}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={['#741343', '#D82B76']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.guestLoginGrad}
                      >
                        <Feather name="gift" size={15} color="#FFD166" />
                        <Text style={styles.guestLoginText}>Login / Sign Up</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 3. Section: Explore Menu */}
                <View style={styles.menuSectionHeader}>
                  <Text style={styles.menuSectionTitle}>EXPLORE MENU</Text>
                </View>

                {/* Menu items */}
                <TouchableOpacity
                  style={styles.premiumMenuItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    clearAllFilters();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#FFF0F5' }]}>
                      <Feather name="home" size={16} color={colors.brandBerry} />
                    </View>
                    <Text style={styles.menuItemLabel}>Home</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumMenuItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    navigation.navigate('Collections');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#FFF5EB' }]}>
                      <Feather name="grid" size={16} color="#D97706" />
                    </View>
                    <Text style={styles.menuItemLabel}>All Collections & Categories</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumMenuItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    navigation.navigate('MyOrders');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <Feather name="shopping-bag" size={16} color="#2563EB" />
                    </View>
                    <Text style={styles.menuItemLabel}>My Orders</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumMenuItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    navigation.navigate('Wishlist');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                      <Feather name="heart" size={16} color="#E11D48" />
                    </View>
                    <Text style={styles.menuItemLabel}>Saved Wishlist</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumMenuItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    navigation.navigate('Offers');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="flame" size={16} color="#D97706" />
                    </View>
                    <Text style={styles.menuItemLabel}>Offers & Festive Coupons</Text>
                  </View>
                  <View style={styles.hotOfferBadge}>
                    <Text style={styles.hotOfferText}>OFFERS</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumMenuItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    navigation.navigate('SavedAddresses');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#F0FDF4' }]}>
                      <Feather name="map-pin" size={16} color="#16A34A" />
                    </View>
                    <Text style={styles.menuItemLabel}>Saved Addresses</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumMenuItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    navigation.navigate('CustomerSupport');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#FAF5FF' }]}>
                      <Feather name="headphones" size={16} color="#9333EA" />
                    </View>
                    <Text style={styles.menuItemLabel}>Help & Support</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumMenuItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    navigation.navigate('TermsPolicy');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#F8FAFC' }]}>
                      <Feather name="shield" size={16} color="#64748B" />
                    </View>
                    <Text style={styles.menuItemLabel}>Terms & Policies</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>

                {/* 4. Quick Category Shortcuts */}
                {categories.length > 0 && (
                  <View style={styles.drawerQuickCategories}>
                    <View style={styles.quickCatHeader}>
                      <Text style={styles.quickCatTitle}>POPULAR COLLECTIONS</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setIsDrawerOpen(false);
                          navigation.navigate('Collections');
                        }}
                      >
                        <Text style={styles.quickCatViewAll}>View all &rarr;</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.quickChipsWrap}>
                      {categories.slice(0, 6).map((cat) => (
                        <TouchableOpacity
                          key={cat._id}
                          style={styles.quickChip}
                          onPress={() => {
                            setIsDrawerOpen(false);
                            handleSelectCategory(cat._id);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.quickChipText}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* 5. Sign Out / Login in Footer */}
                {user ? (
                  <TouchableOpacity
                    style={styles.drawerLogoutBtn}
                    onPress={() => {
                      setIsDrawerOpen(false);
                      signOut();
                    }}
                    activeOpacity={0.8}
                  >
                    <Feather name="log-out" size={16} color="#DC2626" />
                    <Text style={styles.drawerLogoutText}>Sign Out</Text>
                  </TouchableOpacity>
                ) : null}

                {/* Footer Brand Line */}
                <View style={styles.drawerFooterBrand}>
                  <Text style={styles.drawerFooterBrandText}>
                    GiftFestive • Handcrafted with ❤️ in India
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ── Bottom Navigation Tab Bar ── */}
        <BottomTabBar
          navigation={navigation}
          activeScreen="Home"
          cartBadge={cart.length}
        />
      </SafeScreen>

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
    backgroundColor: '#741343',
  },
  feedList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#741343',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 209, 102, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconWrap: {
    // width: 35,
    // height: 35,
    // borderRadius: 11,
    // backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 209, 102, 0.4)',
    // shadowColor: '#FFD166',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
  },
  logoIcon: {
    width: 36,
    height: 26,
    resizeMode: 'contain',
  },
  brandTextColumn: {
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextGift: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  brandTextFestive: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD166',
    letterSpacing: -0.4,
  },
  brandSparkleIcon: {
    marginLeft: 3,
    marginBottom: 4,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    marginTop: -1.5,
  },
  brandTagline: {
    fontSize: 7.5,
    fontWeight: '900',
    color: 'rgba(255, 235, 240, 0.9)',
    letterSpacing: 1.1,
  },
  taglineDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#FFD166',
  },
  brandTaglineCity: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFD166',
    letterSpacing: 0.9,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.45)',
    maxWidth: 96,
  },
  locationText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1D6',
    borderWidth: 1.5,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#741343',
  },
  nightBanner: {
    backgroundColor: colors.nightDark,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 209, 102, 0.25)',
  },
  nightBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nightMoon: {
    fontSize: 16,
  },
  nightTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    color: colors.brandGold,
  },
  nightSubtitle: {
    fontSize: 10,
    color: '#E5E7EB',
    marginTop: 1,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandCream,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    gap: 8,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textDark,
    paddingVertical: 2,
    fontWeight: '600',
  },
  heroSection: {
    marginHorizontal: 14,
    marginTop: 4,
    marginBottom: 14,
  },
  heroCard: {
    height: 160,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFF5F8',
    borderWidth: 1,
    borderColor: '#EAD6C5',
    ...shadows.sm,
  },
  heroImageContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '60%',
    height: '100%',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImageFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '55%',
  },
  heroContent: {
    padding: 16,
    justifyContent: 'center',
    width: '58%',
    height: '100%',
    zIndex: 10,
  },
  heroTagBadge: {
    backgroundColor: '#FFE4E6',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  heroTagText: {
    color: colors.primary,
    fontSize: 8.5,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.brandBerry,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  heroDesc: {
    fontSize: 9.5,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 13,
  },
  heroCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandBerry,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 7,
    ...shadows.button,
  },
  heroCtaText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  heroPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(116, 19, 67, 0.2)',
  },
  heroDotActive: {
    width: 14,
    backgroundColor: colors.primary,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 8,
  },
  trustCard: {
    width: (width - 28 - 8) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadows.sm,
  },
  trustIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.brandCreamAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDark,
  },
  trustSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  sectionPreTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionMainTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: -0.3,
  },
  viewAllPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.brandCreamAlt,
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  viewAllText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
  },
  horizontalScroll: {
    paddingHorizontal: 14,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 68,
  },
  categoryCircle: {
    width: 62,
    height: 62,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.brandCreamAlt,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    marginBottom: 6,
    ...shadows.sm,
  },
  categoryCircleActive: {
    borderColor: colors.brandBerry,
    borderWidth: 2.5,
  },
  occasionCircle: {
    width: 62,
    height: 62,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.brandCream,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    marginBottom: 6,
    ...shadows.sm,
  },
  occasionCircleActive: {
    borderColor: colors.brandBerry,
    borderWidth: 2.5,
  },
  categoryImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: colors.brandBerry,
    fontWeight: '900',
  },
  offersSection: {
    marginBottom: 16,
  },
  couponCard: {
    height: 105,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#21091a',
    ...shadows.sm,
  },
  couponLeft: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  couponTagPill: {
    backgroundColor: 'rgba(255, 209, 102, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 0.6,
    borderColor: 'rgba(255, 209, 102, 0.4)',
    marginBottom: 4,
  },
  couponTagText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFD166',
    letterSpacing: 0.5,
  },
  couponDiscountText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  couponMinOrder: {
    fontSize: 10,
    color: '#E5E7EB',
    marginTop: 2,
    fontWeight: '500',
  },
  couponDivider: {
    width: 1,
    height: 50,
    borderStyle: 'dashed',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 209, 102, 0.35)',
    marginHorizontal: 12,
    zIndex: 2,
  },
  couponRight: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  couponCodePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  couponCodeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFD166',
    letterSpacing: 1.2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  couponTapApply: {
    fontSize: 9.5,
    color: '#FFD166',
    fontWeight: '800',
    marginTop: 4,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    marginBottom: 12,
    marginTop: 4,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: colors.borderRose,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearFilterText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.brandBerry,
  },
  listContent: {
    paddingBottom: 80,
    backgroundColor: '#FFFFFF',
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },
  endBanner: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endBannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brandBerry,
    backgroundColor: colors.brandCreamAlt,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textDark,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyClearBtn: {
    backgroundColor: colors.brandBerry,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  emptyClearText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  floatingSupportBtn: {
    position: 'absolute',
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brandBerry,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
  },
  drawerContent: {
    width: Math.min(width * 0.82, 330),
    backgroundColor: '#FFFDFB',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  drawerHeaderWrap: {
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 209, 102, 0.25)',
    position: 'relative',
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerOfficialLogo: {
    width: 140,
    height: 38,
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerScrollContent: {
    padding: 14,
    paddingBottom: 36,
  },
  drawerProfileCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F6DCAE',
    marginBottom: 14,
    overflow: 'hidden',
    ...shadows.sm,
  },
  drawerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerAvatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD166',
    overflow: 'hidden',
    ...shadows.sm,
  },
  drawerAvatarImg: {
    width: '100%',
    height: '100%',
  },
  drawerAvatarFallbackGrad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarInitText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  drawerProfileInfo: {
    flex: 1,
  },
  drawerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  drawerUserName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
    flexShrink: 1,
  },
  vipBadge: {
    backgroundColor: '#FFD166',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  vipBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#741343',
    letterSpacing: 0.5,
  },
  drawerUserContact: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '600',
  },
  drawerCityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(116, 19, 67, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  drawerCityText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.brandBerry,
  },
  drawerManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F5',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  drawerManageBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D82B76',
  },
  drawerGuestCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F6DCAE',
    marginBottom: 14,
    overflow: 'hidden',
    ...shadows.sm,
  },
  guestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  guestSparkle: {
    fontSize: 14,
  },
  guestWelcomeTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: colors.brandBerry,
    letterSpacing: 0.8,
  },
  guestSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 10,
    fontWeight: '500',
  },
  guestLoginBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.sm,
  },
  guestLoginGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  guestLoginText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  menuSectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 6,
  },
  menuSectionTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
  premiumMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E293B',
  },
  hotOfferBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  hotOfferText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#B45309',
  },
  drawerQuickCategories: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1E5DF',
  },
  quickCatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  quickCatTitle: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  quickCatViewAll: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
  },
  quickChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1E5DF',
  },
  quickChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 14,
  },
  drawerLogoutText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  drawerFooterBrand: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  drawerFooterBrandText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
