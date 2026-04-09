import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Dimensions, Platform, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getProductReviews, deleteReview } from '../services/reviewService';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { user } = useContext(AuthContext);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const quantityNum = Number(quantity || 1);
  const mrp = Number(product.price || 0);
  const salePrice = product.salePrice !== undefined && product.salePrice !== null ? Number(product.salePrice) : mrp;
  const discount = Number(product.discount || 0);
  const tax = Number(product.tax || 0);
  const shippingCost = Number(product.shippingCost || 0);
  const discountAmount = mrp > salePrice ? Number((mrp - salePrice).toFixed(2)) : 0;
  const appliedDiscountText = discount > 0 ? discount : discountAmount > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
  const unitPrice = salePrice;
  const taxAmountPerUnit = Number((unitPrice * (tax / 100)).toFixed(2));
  const unitTotal = Number((unitPrice + taxAmountPerUnit + shippingCost).toFixed(2));
  const itemTotal = Number((unitTotal * quantityNum).toFixed(2));
  const totalDiscount = Number((discountAmount * quantityNum).toFixed(2));
  const totalTax = Number((taxAmountPerUnit * quantityNum).toFixed(2));
  const totalShipping = Number((shippingCost * quantityNum).toFixed(2));

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
    fetchReviews();
  }, [product]);

  const fetchReviews = async () => {
    try {
      const data = await getProductReviews(product._id);
      setReviews(data);
    } catch (err) {
      console.warn('Reviews fetch error', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReview(reviewId);
            fetchReviews();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete review');
          }
        }
      }
    ]);
  };

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
              <Text style={styles.ratingText}>
                {product.ratings ? product.ratings.toFixed(1) : '0.0'} ({product.numReviews || 0} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
          </View>

          <View style={styles.metaRow}>
            {product.flowers ? <Text style={styles.metaText}>{product.flowers} flowers</Text> : null}
            {product.weight ? <Text style={styles.metaText}>{product.weight}</Text> : null}
          </View>

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.saleLabel}>Price</Text>
              <View style={styles.priceRowTop}>
                <Text style={styles.price}>₹{unitPrice.toFixed(2)}</Text>
                {(appliedDiscountText > 0) && <View style={styles.discountBadge}><Text style={styles.discountBadgeText}>{appliedDiscountText}% OFF</Text></View>}
              </View>
            </View>
            <View style={styles.priceMetaRow}>
              <Text style={styles.priceMeta}>MRP ₹{mrp.toFixed(2)}</Text>
              {salePrice !== mrp && <Text style={styles.saleMeta}>Sale ₹{salePrice.toFixed(2)}</Text>}
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeading}>Price Breakdown</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item price</Text>
              <Text style={styles.summaryValue}>₹{unitPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>-₹{totalDiscount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>₹{totalTax.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>₹{totalShipping.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity</Text>
              <Text style={styles.summaryValue}>{quantityNum}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total payable</Text>
              <Text style={styles.summaryTotalValue}>₹{itemTotal.toFixed(2)}</Text>
            </View>
          </View>

          {product.isCodAvailable && (
            <View style={styles.codBadge}>
              <Ionicons name="cash-outline" size={16} color="#FFF" />
              <Text style={styles.codText}>Cash on Delivery Available</Text>
            </View>
          )}
          
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

          <View style={styles.divider} />

          {/* Reviews Section */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
            {product.numReviews > 0 && (
              <View style={styles.overallRating}>
                <Text style={styles.overallRatingText}>{product.ratings.toFixed(1)}</Text>
                <Ionicons name="star" size={16} color="#FFF" />
              </View>
            )}
          </View>

          {loadingReviews ? (
            <ActivityIndicator size="small" color="#D82B76" />
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet. Be the first to review!</Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev._id} style={styles.reviewCard}>
                <View style={styles.reviewUserRow}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>{rev.user?.name?.charAt(0) || 'U'}</Text>
                  </View>
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.userName}>{rev.user?.name || 'Anonymous'}</Text>
                    <View style={styles.reviewRatingRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons 
                          key={s} 
                          name={s <= rev.rating ? "star" : "star-outline"} 
                          size={12} 
                          color={s <= rev.rating ? "#FFD700" : "#E0E0E0"} 
                        />
                      ))}
                      <Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  {user && rev.user?._id === user.id && (
                    <View style={styles.myReviewActions}>
                      <TouchableOpacity 
                        onPress={() => navigation.navigate('AddReview', { product, existingReview: rev })}
                        style={{ marginRight: 15 }}
                      >
                        <Feather name="edit-3" size={18} color="#999" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteReview(rev._id)}>
                        <Feather name="trash-2" size={18} color="#999" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <Text style={styles.reviewComment}>{rev.comment}</Text>

                {rev.images && rev.images.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
                    {rev.images.map((img, i) => (
                      <Image key={i} source={{ uri: img }} style={styles.reviewImage} />
                    ))}
                  </ScrollView>
                )}

                {rev.reply && (
                  <View style={styles.adminReplyContainer}>
                    <View style={styles.replyConnector} />
                    <View style={styles.adminReplyBox}>
                      <Text style={styles.replyTitle}>Admin Reply</Text>
                      <Text style={styles.replyText}>{rev.reply}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.wishlistBtn}>
          <Feather name="heart" size={24} color="#D82B76" />
        </TouchableOpacity>
        <TouchableOpacity 
           style={styles.cartBtn} 
           onPress={added ? () => navigation.navigate('Cart') : addToCart}
        >
          <Text style={styles.cartBtnText}>{added ? 'GO TO CART' : 'ADD TO CART'}</Text>
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
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  metaText: { fontSize: 12, fontWeight: '700', color: '#666', backgroundColor: '#F4F4F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8 },
  weightBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  weightText: { fontSize: 12, fontWeight: '700', color: '#666' },
  priceSection: { marginBottom: 20 },
  priceRowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 32, fontWeight: '900', color: '#1a1a1a' },
  saleLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  priceMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  priceMeta: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  saleMeta: { fontSize: 12, color: '#16A34A', fontWeight: '700' },
  discountBadge: { backgroundColor: '#FEE2E2', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  discountBadgeText: { fontSize: 12, fontWeight: '800', color: '#B91C1C' },
  summaryCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryHeading: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  summaryDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  summaryTotalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  summaryTotalValue: { fontSize: 18, fontWeight: '900', color: '#D94660' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { fontSize: 13, color: '#666' },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#111' },
  oldPrice: { fontSize: 16, color: '#999', textDecorationLine: 'line-through', marginRight: 15 },
  discountTag: { backgroundColor: '#00a65a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discountTagText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  codBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 20, alignSelf: 'flex-start' },
  codText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 5 },
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
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  overallRating: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16A34A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  overallRatingText: { color: '#FFF', fontWeight: '800', marginRight: 4 },
  noReviews: { fontSize: 14, color: '#999', textAlign: 'center', marginVertical: 20 },
  reviewCard: { marginBottom: 25, backgroundColor: '#FFF' },
  reviewUserRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#D82B76' },
  reviewUserInfo: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 14, fontWeight: '700', color: '#333' },
  reviewRatingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  reviewDate: { fontSize: 12, color: '#999', marginLeft: 8 },
  reviewComment: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 10 },
  reviewImages: { flexDirection: 'row', marginBottom: 10 },
  reviewImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  adminReplyContainer: { marginTop: 10, paddingLeft: 20 },
  replyConnector: { position: 'absolute', left: 0, top: 0, bottom: 20, width: 2, backgroundColor: '#F0F0F0' },
  adminReplyBox: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 8 },
  replyTitle: { fontSize: 12, fontWeight: '800', color: '#D82B76', marginBottom: 4 },
  replyText: { fontSize: 13, color: '#555', lineHeight: 18 },
  myReviewActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 }
});

