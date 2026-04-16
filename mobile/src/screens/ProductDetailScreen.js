import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Dimensions, Platform, Modal, ActivityIndicator, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getProductReviews, deleteReview, likeReview, dislikeReview } from '../services/reviewService';
import { toggleWishlist, getWishlist } from '../services/wishlistService';
import orderService from '../services/orderService';
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

  // Pricing Calculations
  const mrp = Number(product.price || 0);
  const salePrice = product.salePrice !== undefined && product.salePrice !== null ? Number(product.salePrice) : mrp;
  const unitPrice = salePrice;
  const discountAmount = mrp > salePrice ? mrp - salePrice : 0;
  const discountPercent = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
  
  const tax = Number(product.tax || 0);
  const shippingCost = Number(product.shippingCost || 0);
  const quantityNum = Number(quantity || 1);
  const totalPayable = (unitPrice * quantityNum) + (unitPrice * (tax / 100) * quantityNum) + (shippingCost * quantityNum);

  useEffect(() => {
    const checkCart = async () => {
      try {
        const raw = await AsyncStorage.getItem('@giftcart_cart');
        const cart = raw ? JSON.parse(raw) : [];
        setAdded(cart.some((item) => item._id === product._id));
      } catch (err) {}
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
      setInWishlist(wishlist.some((item) => item._id === product._id));
    } catch (err) {}
  };

  const handleToggleWishlist = async () => {
    if (!user) { showToast('Please login to add items to wishlist', 'warning'); return; }
    try {
      const response = await toggleWishlist(product._id);
      setInWishlist(response.includes(product._id));
    } catch (err) { showToast('Could not update wishlist', 'error'); }
  };

  const fetchReviews = async () => {
    try {
      const res = await getProductReviews(product._id);
      // Handle both paginated object and direct array response
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
    try { await likeReview(id); fetchReviews(); } catch (e) {}
  };

  const handleDislike = async (id) => {
    if (!user) return showToast('Please login to engage', 'warning');
    try { await dislikeReview(id); fetchReviews(); } catch (e) {}
  };

  const addToCart = async () => {
    try {
      const raw = await AsyncStorage.getItem('@giftcart_cart');
      const cart = raw ? JSON.parse(raw) : [];
      if (cart.some(i => i._id === product._id)) {
        navigation.navigate('Cart');
        return;
      }
      cart.push({ ...product, quantity });
      await AsyncStorage.setItem('@giftcart_cart', JSON.stringify(cart));
      setAdded(true);
      showToast('Added to cart', 'success');
    } catch (err) { showToast('Could not add to cart.', 'error'); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
           <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={handleToggleWishlist}>
           <Ionicons name={inWishlist ? "heart" : "heart-outline"} size={22} color={inWishlist ? "#FF3D00" : "#FFF"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Main Image Banner */}
        <View style={styles.imageWrapper}>
           <Image source={{ uri: product.image }} style={styles.mainImage} />
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
                 <Text style={styles.categoryName}>{product.category?.name || 'EXCLUSIVE GIFT'}</Text>
                 <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingValue}>{product.ratings?.toFixed(1) || '4.5'}</Text>
                 </View>
              </View>
              <Text style={styles.productTitle}>{product.name}</Text>
           </View>

           {/* Quick Specification Grid */}
           <View style={styles.specGrid}>
              {product.weight && (
                <View style={styles.specItem}>
                   <MaterialCommunityIcons name="weight" size={20} color="#D82B76" />
                   <Text style={styles.specLabel}>{product.weight}</Text>
                </View>
              )}
              {product.flowers && (
                <View style={styles.specItem}>
                   <MaterialCommunityIcons name="flower" size={20} color="#D82B76" />
                   <Text style={styles.specLabel}>{product.flowers} Flores</Text>
                </View>
              )}
               <View style={[styles.specItem, { borderRightWidth: 0 }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#D82B76" />
                  <Text style={styles.specLabel}>{product.deliveryTime ? `${product.deliveryTime} Hours` : '24-48 Hours'}</Text>
               </View>
            </View>

            <View style={styles.deliveryInfoRow}>
               <Feather name="truck" size={18} color="#D82B76" />
               <View style={{ marginLeft: 12 }}>
                  <Text style={styles.deliveryMainText}>Get it in {product.expectedDeliveryDate || 'N/A'}</Text>
                  <Text style={styles.deliverySubText}>Approx. Delivery Time: {product.deliveryTime || '24'} Hrs</Text>
               </View>
            </View>

           {/* Pricing Section */}
           <View style={styles.priceContainer}>
              <View>
                 <Text style={styles.label}>Total Price</Text>
                 <View style={styles.mainPriceRow}>
                    <Text style={styles.currency}>₹</Text>
                    <Text style={styles.currentPrice}>{salePrice.toLocaleString()}</Text>
                    {mrp > salePrice && (
                       <Text style={styles.oldPriceText}>₹{mrp.toLocaleString()}</Text>
                    )}
                 </View>
              </View>
              <View style={styles.quantityWidget}>
                 <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qBtn}>
                    <Feather name="minus" size={16} color="#1A1A1A" />
                 </TouchableOpacity>
                 <Text style={styles.qVal}>{quantity}</Text>
                 <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qBtn}>
                    <Feather name="plus" size={16} color="#1A1A1A" />
                 </TouchableOpacity>
              </View>
           </View>

           {/* Summary breakdown mini card */}
           <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                 <Text style={styles.sumLabel}>Price per unit</Text>
                 <Text style={styles.sumVal}>₹{unitPrice.toFixed(2)}</Text>
              </View>
              {discountPercent > 0 && (
                <View style={styles.summaryRow}>
                   <Text style={styles.sumLabel}>Discount</Text>
                   <Text style={[styles.sumVal, { color: '#16A34A' }]}>-₹{(discountAmount * quantity).toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                 <Text style={styles.sumLabel}>Tax ({tax}%)</Text>
                 <Text style={styles.sumVal}>+₹{(unitPrice * (tax / 100) * quantity).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                 <Text style={styles.sumLabel}>Shipping Cost</Text>
                 <Text style={styles.sumVal}>+₹{(shippingCost * quantity).toFixed(2)}</Text>
              </View>
              <View style={styles.sumDivider} />
              <View style={styles.summaryRow}>
                 <Text style={styles.finalLabel}>Total Payable Amount</Text>
                 <Text style={styles.finalPrice}>₹{totalPayable.toFixed(2)}</Text>
              </View>
           </View>

           {/* COD & Trust Section */}
           <View style={styles.trustRow}>
              {product.isCodAvailable && (
                <View style={styles.trustBadge}>
                   <MaterialCommunityIcons name="cash-multiple" size={16} color="#16A34A" />
                   <Text style={styles.trustText}>Cash on Delivery Available</Text>
                </View>
              )}
              <View style={styles.trustBadge}>
                 <MaterialCommunityIcons name="shield-check" size={16} color="#2979FF" />
                 <Text style={styles.trustText}>Genuine Product</Text>
              </View>
           </View>

           {/* Description */}
           <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Description</Text>
              <Text style={styles.descriptionText}>
                 {product.description || 'Elegant and sophisticated, this curated selection is designed to make every moment memorable.'}
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
                              {[1,2,3,4,5].map(s => (
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
         <TouchableOpacity 
            style={[styles.mainBtn, added && styles.addedBtn]} 
            activeOpacity={0.8}
            onPress={addToCart}
         >
            <View style={styles.btnRow}>
               <Feather name={added ? "shopping-bag" : "shopping-cart"} size={20} color="#FFF" />
               <Text style={styles.btnText}>{added ? 'IN YOUR CART' : 'ADD TO BAG'}</Text>
            </View>
            <Text style={styles.btnSubTotal}>Total: ₹{totalPayable.toFixed(0)}</Text>
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
  container: { flex: 1, backgroundColor: '#000' },
  header: { 
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 15, right: 15, 
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 100 
  },
  headerBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  
  imageWrapper: { width: width, height: ITEM_HEIGHT, position: 'relative' },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  offBadge: { position: 'absolute', bottom: 60, right: 0, backgroundColor: '#D82B76', paddingHorizontal: 15, paddingVertical: 8, borderTopLeftRadius: 20 },
  offText: { color: '#FFF', fontWeight: '900', fontSize: 14 },

  contentBox: { 
    marginTop: -40, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40,
    minHeight: 600, paddingHorizontal: 25, paddingBottom: 120
  },
  dragHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginTop: 15, marginBottom: 20 },
  
  topInfo: { marginBottom: 20 },
  categoryInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  categoryName: { fontSize: 11, fontWeight: '900', color: '#D82B76', letterSpacing: 1.5, textTransform: 'uppercase' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  ratingValue: { fontSize: 12, fontWeight: '800', color: '#FBC02D' },
  productTitle: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', lineHeight: 34 },

  specGrid: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 20, padding: 15, marginBottom: 25, borderWidth: 1, borderColor: '#F1F5F9' },
  specItem: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#E2E8F0', paddingVertical: 5 },
  specLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 6 },

  priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  label: { fontSize: 12, color: '#94A3B8', fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  mainPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  currency: { fontSize: 18, fontWeight: '900', color: '#D82B76' },
  currentPrice: { fontSize: 32, fontWeight: '900', color: '#1A1A1A' },
  oldPriceText: { fontSize: 14, color: '#CBD5E1', textDecorationLine: 'line-through', marginLeft: 10, fontWeight: '600' },

  quantityWidget: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 15, padding: 4 },
  qBtn: { width: 38, height: 38, backgroundColor: '#FFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  qVal: { fontSize: 18, fontWeight: '900', color: '#1A1A1A', marginHorizontal: 15 },

  summaryCard: { backgroundColor: '#FBFCFE', padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sumLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  sumVal: { fontSize: 13, color: '#1E293B', fontWeight: '800' },
  sumDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  finalLabel: { fontSize: 15, fontWeight: '900', color: '#1A1A1A' },
  finalPrice: { fontSize: 18, fontWeight: '900', color: '#D82B76' },

  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  trustText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    padding: 15,
    borderRadius: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deliveryMainText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  deliverySubText: {
    fontSize: 12,
    color: '#D82B76',
    fontWeight: '700',
    marginTop: 2,
  },

  section: { marginBottom: 35 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1A1A', marginBottom: 15 },
  descriptionText: { fontSize: 15, color: '#475569', lineHeight: 24, fontWeight: '500' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addReviewText: { color: '#D82B76', fontWeight: '800', fontSize: 14 },

  emptyReviews: { alignItems: 'center', padding: 40, backgroundColor: '#F8FAFC', borderRadius: 20 },
  emptyText: { marginTop: 10, fontSize: 14, color: '#94A3B8', fontWeight: '600', textAlign: 'center' },

  reviewCard: { marginBottom: 25, backgroundColor: '#FFF', padding: 2 },
  revHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  revProfile: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FDF2F5', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  revImg: { width: '100%', height: '100%' },
  revInitial: { fontSize: 20, fontWeight: '800', color: '#D82B76' },
  revNameSet: { flex: 1, marginLeft: 15 },
  revName: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  revStars: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  revDate: { fontSize: 10, color: '#94A3B8', marginLeft: 5, fontWeight: '700' },
  revComment: { fontSize: 15, color: '#334155', lineHeight: 22, fontWeight: '500', marginBottom: 12, backgroundColor: '#F8F9FA', padding: 12, borderRadius: 12 },
  revImagesList: { flexDirection: 'row', marginBottom: 15, paddingLeft: 5 },
  revImageItem: { width: 100, height: 100, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  revActions: { flexDirection: 'row', gap: 20, marginBottom: 15, paddingLeft: 5 },
  engBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  engText: { fontSize: 13, fontWeight: '800', color: '#64748B' },

  replyBox: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 18, borderTopLeftRadius: 4, marginLeft: 20 },
  replyBrand: { fontSize: 10, fontWeight: '900', color: '#D82B76', letterSpacing: 1, marginBottom: 5 },
  replyMsg: { fontSize: 13, color: '#1E293B', fontWeight: '600', lineHeight: 20 },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 25, paddingBottom: Platform.OS === 'ios' ? 35 : 20, paddingTop: 15,
    backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#F1F5F9'
  },
  mainBtn: { 
    backgroundColor: '#D82B76', height: 65, borderRadius: 22, flexDirection: 'row', 
    alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25,
    shadowColor: '#D82B76', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5
  },
  addedBtn: { backgroundColor: '#1A1A1A' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  btnSubTotal: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '800' },

  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: 50, right: 25, zIndex: 10 },
  fullImage: { width: width, height: width * 1.5 }
});
