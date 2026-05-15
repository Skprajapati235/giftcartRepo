import React, { useEffect, useState, useContext, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Dimensions, Platform, Modal, ActivityIndicator, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getProductReviews, deleteReview, likeReview, dislikeReview } from '../services/reviewService';
import { toggleWishlist, getWishlist } from '../services/wishlistService';
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 450;

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isEggless, setIsEggless] = useState(false);

  // Image Gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryImages = [product.image, ...(product.images || [])].filter(Boolean);

  // Pricing Calculations — MRP and Sale Price per variant
  const baseMRP = Number(product.price || 0); // global MRP fallback
  const globalSalePrice = product.salePrice !== undefined && product.salePrice !== null
    ? Number(product.salePrice)
    : baseMRP;

  // Variant overrides: use variant's salePrice if set, else variant's price
  let variantMRP = baseMRP;
  let variantSalePrice = globalSalePrice;

  const unitMRP = baseMRP;
  let unitSalePrice = globalSalePrice;

  // Eggless adds ₹50 to sale price only
  if (isEggless) unitSalePrice += 50;

  const savingsAmount = unitMRP > unitSalePrice ? unitMRP - unitSalePrice : 0;
  const savingsPercent = unitMRP > 0 && savingsAmount > 0 ? Math.round((savingsAmount / unitMRP) * 100) : 0;
  const discountPercent = product?.discount || savingsPercent;

  useEffect(() => {
    const checkCart = async () => {
      try {
        const raw = await AsyncStorage.getItem('@giftcart_cart');
        const cart = raw ? JSON.parse(raw) : [];
        setAdded(cart.some((item) => item._id === product._id));
      } catch (err) { }
    };
    checkCart();
    fetchReviews();
    if (user) {
      checkWishlistStatus();
    }
  }, [product, user]);

  const checkWishlistStatus = async () => {
    try {
      const wishlist = await getWishlist();
      setInWishlist(wishlist.some((item) => item.product && item.product._id === product._id));
    } catch (err) { }
  };

  const handleToggleWishlist = async () => {
    if (!user) { showToast('Please login to add items to wishlist', 'warning'); return; }
    try {
      const response = await toggleWishlist(product._id);
      setInWishlist(response.status === 'added');
    } catch (err) { showToast('Could not update wishlist', 'error'); }
  };

  const fetchReviews = async () => {
    try {
      const res = await getProductReviews(product._id);
      const reviewsArray = res.data || (Array.isArray(res) ? res : []);
      setReviews(reviewsArray);
    } catch (err) {
      console.log('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleLike = async (id) => {
    if (!user) return showToast('Please login to engage', 'warning');
    try { await likeReview(id); fetchReviews(); } catch (e) { }
  };

  const handleDislike = async (id) => {
    if (!user) return showToast('Please login to engage', 'warning');
    try { await dislikeReview(id); fetchReviews(); } catch (e) { }
  };

  const addToCart = async () => {
    try {
      const raw = await AsyncStorage.getItem('@giftcart_cart');
      const cart = raw ? JSON.parse(raw) : [];

      const egglessStr = product.hasEgglessOption && isEggless ? 'Eggless' : '';
      const cartItemId = `${product._id}_${egglessStr}`;

      if (cart.some(i => i.cartItemId === cartItemId || (!i.cartItemId && i._id === product._id))) {
        navigation.navigate('Cart');
        return;
      }

      const cartItem = {
        ...product,
        cartItemId,
        quantity,
        price: unitMRP,
        salePrice: unitSalePrice,
        discount: 0,
        isEggless: product.hasEgglessOption ? isEggless : false
      };

      cart.push(cartItem);
      await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(cart));
      setAdded(true);
      showToast('Added to cart', 'success');
    } catch (err) { showToast('Could not add to cart.', 'error'); }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveImageIndex(index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Feather name="share-2" size={20} color="#1A1A1A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleToggleWishlist}>
            <Ionicons name={inWishlist ? "heart" : "heart-outline"} size={22} color={inWishlist ? "#F43F5E" : "#1A1A1A"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Main Image Gallery Banner */}
        <View style={styles.imageWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {galleryImages.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.mainImage} />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          {galleryImages.length > 1 && (
            <View style={styles.paginationDots}>
              {galleryImages.map((_, idx) => (
                <View key={idx} style={[styles.dot, activeImageIndex === idx && styles.activeDot]} />
              ))}
            </View>
          )}

          {discountPercent > 0 && (
            <View style={styles.offBadge}>
              <Text style={styles.offText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        {/* Content Details */}
        <View style={styles.contentBox}>
          <View style={styles.dragHandle} />

          <View style={styles.topInfo}>
            <View style={styles.categoryInfo}>
              <View style={styles.catBadge}>
                <MaterialCommunityIcons name="flower" size={14} color="#D82B76" />
                <Text style={styles.categoryName}>{product.category?.name || 'FLOWERS'}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingValue}>{product.ratings?.toFixed(1) || '4.8'} <Text style={styles.ratingCount}>({product.reviewsCount || 120})</Text></Text>
              </View>
            </View>

            <View style={styles.titleRow}>
              <View style={{ flex: 1, paddingRight: 15 }}>
                <Text style={styles.productTitle}>{product.name}</Text>
                <View style={styles.titleUnderline} />
              </View>
              <View style={styles.giftWrapBox}>
                <View style={styles.giftWrapIconBox}>
                  <Feather name="gift" size={18} color="#D82B76" />
                </View>
                <Text style={styles.giftWrapText}>Gift Wrap</Text>
              </View>
            </View>

            <View style={styles.mainPriceRowTop}>
              <Text style={styles.currentPriceTop}>₹{unitSalePrice.toLocaleString()}</Text>
              {unitMRP > unitSalePrice && (
                <Text style={styles.oldPriceTextTop}>₹{unitMRP.toLocaleString()}</Text>
              )}
              {savingsAmount > 0 && (
                <View style={styles.savingsBadgeTop}>
                  <Text style={styles.savingsTextTop}>You Save ₹{savingsAmount.toLocaleString()}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Specifications Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <MaterialCommunityIcons name="moped" size={22} color="#D82B76" />
              </View>
              <Text style={styles.featureLabel}>Delivery</Text>
              <Text style={styles.featureValue}>{product.deliveryTime ? `${product.deliveryTime} Hrs` : '2-4 Hours'}</Text>
            </View>
            {product.flavor ? (
              <View style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <MaterialCommunityIcons name="cake-variant" size={22} color="#D82B76" />
                </View>
                <Text style={styles.featureLabel}>Flavor</Text>
                <Text style={styles.featureValue} numberOfLines={1}>{product.flavor.name || product.flavor}</Text>
              </View>
            ) : product.flowerCount ? (
              <View style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <MaterialCommunityIcons name="flower" size={22} color="#D82B76" />
                </View>
                <Text style={styles.featureLabel}>Flowers</Text>
                <Text style={styles.featureValue} numberOfLines={1}>{product.flowerCount}</Text>
              </View>
            ) : (
              <View style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <MaterialCommunityIcons name="gift-outline" size={22} color="#D82B76" />
                </View>
                <Text style={styles.featureLabel}>Type</Text>
                <Text style={styles.featureValue} numberOfLines={1}>Premium</Text>
              </View>
            )}
            
            {product.weight ? (
              <View style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <MaterialCommunityIcons name="weight" size={22} color="#D82B76" />
                </View>
                <Text style={styles.featureLabel}>Weight</Text>
                <Text style={styles.featureValue} numberOfLines={1}>{product.weight}</Text>
              </View>
            ) : (
              <View style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <MaterialCommunityIcons name="leaf" size={22} color="#D82B76" />
                </View>
                <Text style={styles.featureLabel}>Freshness</Text>
                <Text style={styles.featureValue}>100% Fresh</Text>
              </View>
            )}

            {product.weight ? (
              <View style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <MaterialCommunityIcons name="leaf" size={22} color="#D82B76" />
                </View>
                <Text style={styles.featureLabel}>Freshness</Text>
                <Text style={styles.featureValue} numberOfLines={1}>100% Fresh</Text>
              </View>
            ) : (
              <View style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <Ionicons name="heart" size={22} color="#D82B76" />
                </View>
                <Text style={styles.featureLabel}>Perfect</Text>
                <Text style={styles.featureValue} numberOfLines={1}>Occasions</Text>
              </View>
            )}
          </View>

          {/* Express Delivery Box */}
          <View style={styles.expressDeliveryBox}>
            <View style={styles.expressImgPlaceholder}>
              <MaterialCommunityIcons name="moped" size={32} color="#D82B76" />
            </View>
            <View style={styles.expressTextContainer}>
              <Text style={styles.expressTitle}>Express Delivery</Text>
              <Text style={styles.expressSub}>{product.expectedDeliveryDate ? `${product.expectedDeliveryDate} Hrs` : '2-4 Hours'}</Text>
            </View>
            <View style={styles.fastDeliveryIconBox}>
              <MaterialCommunityIcons name="clock-fast" size={24} color="#D82B76" />
              <View style={{ marginLeft: 4 }}>
                <Text style={styles.fastDeliveryText}>FAST</Text>
                <Text style={styles.fastDeliveryText}>DELIVERY</Text>
              </View>
            </View>
          </View>

          {/* Quantity Section */}
          {/* <View style={styles.quantitySection}>
            <Text style={styles.quantityTitle}>Quantity</Text>
            <View style={styles.quantityWidget}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qBtn}>
                <Feather name="minus" size={16} color="#1A1A1A" />
              </TouchableOpacity>
              <Text style={styles.qVal}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qBtn}>
                <Feather name="plus" size={16} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
          </View> */}

          {/* Trust Section */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trustRow} style={{ marginBottom: 30 }}>
            {product.isCodAvailable && (
              <View style={styles.trustBadge}>
                <MaterialCommunityIcons name="cash-multiple" size={20} color="#16A34A" />
                <View>
                  <Text style={styles.trustTitle}>Cash on Delivery</Text>
                  <Text style={styles.trustSub}>Available</Text>
                </View>
              </View>
            )}
            <View style={styles.trustBadge}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#2979FF" />
              <View>
                <Text style={styles.trustTitle}>100% Original</Text>
                <Text style={styles.trustSub}>& Fresh</Text>
              </View>
            </View>
            <View style={styles.trustBadge}>
              <Feather name="lock" size={18} color="#9C27B0" />
              <View>
                <Text style={styles.trustTitle}>Secure</Text>
                <Text style={styles.trustSub}>Payments</Text>
              </View>
            </View>
          </ScrollView>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.descriptionText}>
              {product.description || 'Elegant and sophisticated, this curated selection is designed to make every moment memorable. Perfect for gifting your loved ones on special occasions.'}
            </Text>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            </View>

            {loadingReviews ? (
              <ActivityIndicator color="#D82B76" style={{ margin: 20 }} />
            ) : reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <MaterialCommunityIcons name="star-outline" size={40} color="#DDD" />
                <Text style={styles.emptyText}>No reviews yet. Share your feedback!</Text>
              </View>
            ) : (
              reviews.map((rev) => (
                <View key={rev._id} style={styles.reviewCard}>
                  <View style={styles.revHeader}>
                    <View style={styles.revProfile}>
                      {rev.user?.profilePic ? (
                        <Image source={{ uri: rev.user.profilePic }} style={styles.revImg} />
                      ) : (
                        <Text style={styles.revInitial}>{rev.user?.name?.charAt(0)}</Text>
                      )}
                    </View>
                    <View style={styles.revNameSet}>
                      <Text style={styles.revName}>{rev.user?.name || 'Anonymous'}</Text>
                      <View style={styles.revStars}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Ionicons key={s} name="star" size={10} color={s <= rev.rating ? "#FFD700" : "#EEE"} />
                        ))}
                        <Text style={styles.revDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                      </View>
                    </View>
                    {user && rev.user?._id === user.id && (
                      <TouchableOpacity onPress={() => navigation.navigate('AddReview', { product, existingReview: rev })}>
                        <Feather name="edit-2" size={16} color="#D82B76" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.revComment}>{rev.comment}</Text>

                  {rev.images && rev.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.revImagesList}>
                      {rev.images.map((img, idx) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.9}
                          onPress={() => {
                            setSelectedImage(img);
                            setIsModalVisible(true);
                          }}
                        >
                          <Image source={{ uri: img }} style={styles.revImageItem} />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  <View style={styles.revActions}>
                    <TouchableOpacity style={styles.engBtn} onPress={() => handleLike(rev._id)}>
                      <Ionicons
                        name={user && (rev.likes || []).includes(user.id) ? "thumbs-up" : "thumbs-up-outline"}
                        size={14}
                        color={user && (rev.likes || []).includes(user.id) ? "#D82B76" : "#666"}
                      />
                      <Text style={styles.engText}>{(rev.likes || []).length}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.engBtn} onPress={() => handleDislike(rev._id)}>
                      <Ionicons
                        name={user && (rev.dislikes || []).includes(user.id) ? "thumbs-down" : "thumbs-down-outline"}
                        size={14}
                        color={user && (rev.dislikes || []).includes(user.id) ? "#333" : "#666"}
                      />
                      <Text style={styles.engText}>{(rev.dislikes || []).length}</Text>
                    </TouchableOpacity>
                  </View>

                  {rev.reply && (
                    <View style={styles.replyBox}>
                      <Text style={styles.replyBrand}>GIFT CART RESPONSE</Text>
                      <Text style={styles.replyMsg}>{rev.reply}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modern Sticky Footer Action */}
      <View style={styles.footer}>
        <View style={styles.footerTotalBox}>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalPrice}>₹{(unitSalePrice * quantity).toLocaleString()}</Text>
        </View>
        <View style={styles.footerDivider} />
        <TouchableOpacity
          style={[styles.mainBtn, added && styles.addedBtn]}
          activeOpacity={0.8}
          onPress={addToCart}
        >
          <Feather name="shopping-bag" size={20} color="#FFF" />
          <Text style={styles.btnText}>{added ? 'IN BAG' : 'ADD TO BAG'}</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 15, right: 15,
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 100
  },
  headerRight: { flexDirection: 'row', gap: 10 },
  headerBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },

  imageWrapper: { width: width, height: ITEM_HEIGHT, position: 'relative' },
  mainImage: { width: width, height: ITEM_HEIGHT, resizeMode: 'cover' },
  paginationDots: { position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  activeDot: { backgroundColor: '#FFF', width: 20 },
  offBadge: { position: 'absolute', bottom: 40, right: 0, backgroundColor: '#F43F5E', paddingHorizontal: 16, paddingVertical: 8, borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
  offText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  contentBox: {
    marginTop: -25, backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35,
    minHeight: 600, paddingHorizontal: 20, paddingBottom: 120
  },
  dragHandle: { width: 0, height: 0, marginTop: 20 },

  topInfo: { marginBottom: 20, paddingTop: 10 },
  categoryInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryName: { fontSize: 10, fontWeight: '800', color: '#D82B76', letterSpacing: 0.5, textTransform: 'uppercase' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF9C4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  ratingValue: { fontSize: 12, fontWeight: '800', color: '#F59E0B' },
  ratingCount: { color: '#9CA3AF', fontWeight: '600' },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  productTitle: { fontSize: 26, fontWeight: '900', color: '#1E293B', lineHeight: 32, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  titleUnderline: { width: 35, height: 3, backgroundColor: '#F43F5E', marginTop: 10, borderRadius: 2 },

  giftWrapBox: { alignItems: 'center', marginTop: 5 },
  giftWrapIconBox: { width: 44, height: 44, backgroundColor: '#FFF0F5', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  giftWrapText: { fontSize: 10, color: '#475569', fontWeight: '600' },

  mainPriceRowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currentPriceTop: { fontSize: 32, fontWeight: '800', color: '#F43F5E' },
  oldPriceTextTop: { fontSize: 16, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '600' },
  savingsBadgeTop: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  savingsTextTop: { fontSize: 11, color: '#10B981', fontWeight: '700' },

  featuresGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  featureCard: { width: (width - 40 - 30) / 4, backgroundColor: '#FFF', borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F8FAFC' },
  featureIconBox: { width: 36, height: 36, backgroundColor: '#FFF0F5', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  featureLabel: { fontSize: 10, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 2 },
  featureValue: { fontSize: 9, fontWeight: '500', color: '#64748B', textAlign: 'center' },

  expressDeliveryBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F7', padding: 16, borderRadius: 16, marginBottom: 30, borderWidth: 1, borderColor: '#FCE7F3' },
  expressImgPlaceholder: { width: 50, height: 50, backgroundColor: '#FFF', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  expressTextContainer: { flex: 1 },
  expressTitle: { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  expressSub: { fontSize: 11, color: '#64748B', lineHeight: 16 },
  fastDeliveryIconBox: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  fastDeliveryText: { fontSize: 8, fontWeight: '900', color: '#D82B76', lineHeight: 10 },

  quantitySection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  quantityTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  quantityWidget: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  qBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  qVal: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginHorizontal: 20 },

  trustRow: { gap: 10, paddingBottom: 5 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  trustTitle: { fontSize: 11, fontWeight: '800', color: '#1E293B' },
  trustSub: { fontSize: 10, fontWeight: '500', color: '#64748B', marginTop: 2 },

  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  descriptionText: { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '400' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addReviewText: { color: '#D82B76', fontWeight: '800', fontSize: 14 },

  emptyReviews: { alignItems: 'center', padding: 40, backgroundColor: '#F8FAFC', borderRadius: 20 },
  emptyText: { marginTop: 10, fontSize: 14, color: '#94A3B8', fontWeight: '600', textAlign: 'center' },

  reviewCard: { marginBottom: 25, backgroundColor: '#FFF' },
  revHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  revProfile: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FDF2F5', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  revImg: { width: '100%', height: '100%' },
  revInitial: { fontSize: 18, fontWeight: '800', color: '#D82B76' },
  revNameSet: { flex: 1, marginLeft: 12 },
  revName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  revStars: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  revDate: { fontSize: 10, color: '#94A3B8', marginLeft: 8, fontWeight: '600' },
  revComment: { fontSize: 14, color: '#475569', lineHeight: 20, fontWeight: '400', marginBottom: 12, backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12 },
  revImagesList: { flexDirection: 'row', marginBottom: 12 },
  revImageItem: { width: 80, height: 80, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  revActions: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  engBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  engText: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  replyBox: { backgroundColor: '#FFF5F7', padding: 12, borderRadius: 12, borderTopLeftRadius: 0, marginLeft: 15, marginTop: 5 },
  replyBrand: { fontSize: 10, fontWeight: '800', color: '#D82B76', letterSpacing: 1, marginBottom: 4 },
  replyMsg: { fontSize: 13, color: '#334155', fontWeight: '500', lineHeight: 18 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 35 : 20, paddingTop: 15,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10
  },
  footerTotalBox: { paddingRight: 20 },
  footerTotalLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  footerTotalPrice: { fontSize: 20, fontWeight: '800', color: '#F43F5E', marginTop: 2 },
  footerDivider: { width: 1, height: 35, backgroundColor: '#E2E8F0', marginRight: 20 },
  mainBtn: {
    flex: 1, backgroundColor: '#F43F5E', height: 55, borderRadius: 28, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#F43F5E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6
  },
  addedBtn: { backgroundColor: '#1E293B', shadowColor: '#1E293B' },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: 50, right: 25, zIndex: 10 },
  fullImage: { width: width, height: width * 1.5 }
});
