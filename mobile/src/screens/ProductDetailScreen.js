import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Dimensions, Platform, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import reviewService from '../services/reviewService';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { user } = useContext(AuthContext);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviewsData, setReviewsData] = useState({ averageRating: 0, totalReviews: 0, reviews: [] });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [eligibleInfo, setEligibleInfo] = useState({ eligible: false, existingReview: null, deliveredOrderId: null });
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);

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

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const data = await reviewService.getReviewsByProduct(product._id);
        setReviewsData(data);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    const fetchEligibility = async () => {
      if (!user) return;
      try {
        const data = await reviewService.getEligibility(product._id);
        setEligibleInfo(data);
        if (data.existingReview) {
          setRating(data.existingReview.rating || 5);
          setComment(data.existingReview.comment || '');
          setImages(data.existingReview.images || []);
          setShowForm(true);
        }
      } catch (err) {
        console.error('Failed to check review eligibility', err);
      }
    };

    checkCart();
    fetchReviews();
    fetchEligibility();
  }, [product, user]);

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

  const renderStars = (value) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Ionicons
        key={index}
        name="star"
        size={14}
        color={index < value ? '#FFD700' : '#E2E8F0'}
        style={{ marginRight: 2 }}
      />
    ));
  };

  const handlePickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('Review Images', 'You can only upload up to 3 images.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permissions required', 'Please enable image library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (result.cancelled) return;

    try {
      setUploadingImage(true);
      const localUri = result.assets?.[0]?.uri || result.uri;
      const filename = localUri.split('/').pop();
      const match = /\\.([0-9a-z]+)(?:[\?#]|$)/i.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';
      const formData = new FormData();
      formData.append('file', {
        uri: localUri,
        name: filename,
        type: fileType,
      });
      const uploadResponse = await reviewService.uploadReviewImage(formData);
      setImages((prev) => [...prev, uploadResponse.url]);
    } catch (err) {
      console.error('Image upload failed', err);
      Alert.alert('Upload failed', 'Could not upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('Login required', 'You must be logged in to post a review.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Review required', 'Please add a review comment.');
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert('Rating required', 'Please choose a rating between 1 and 5.');
      return;
    }

    if (!eligibleInfo.deliveredOrderId) {
      Alert.alert('Not eligible', 'Reviews can only be submitted after order delivery.');
      return;
    }

    try {
      setSavingReview(true);
      if (eligibleInfo.existingReview) {
        await reviewService.updateReview(eligibleInfo.existingReview._id, {
          rating,
          comment,
          images,
        });
        Alert.alert('Review updated', 'Your review was updated successfully.');
      } else {
        await reviewService.createReview({
          productId: product._id,
          orderId: eligibleInfo.deliveredOrderId,
          rating,
          comment,
          images,
        });
        Alert.alert('Review submitted', 'Thank you for reviewing this product.');
      }
      const updatedReviews = await reviewService.getReviewsByProduct(product._id);
      setReviewsData(updatedReviews);
      const updatedEligibility = await reviewService.getEligibility(product._id);
      setEligibleInfo(updatedEligibility);
      setShowForm(false);
    } catch (err) {
      console.error('Submit review error', err);
      Alert.alert('Error', err.message || 'Could not save review.');
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!eligibleInfo.existingReview) return;
    Alert.alert('Delete review', 'Are you sure you want to delete your review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setSubmittingDelete(true);
            await reviewService.deleteReview(eligibleInfo.existingReview._id);
            Alert.alert('Deleted', 'Your review has been removed.');
            setComment('');
            setRating(5);
            setImages([]);
            setShowForm(false);
            const updatedReviews = await reviewService.getReviewsByProduct(product._id);
            setReviewsData(updatedReviews);
            setEligibleInfo({ ...eligibleInfo, existingReview: null });
          } catch (err) {
            console.error('Delete review error', err);
            Alert.alert('Error', 'Could not delete review.');
          } finally {
            setSubmittingDelete(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
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
              {renderStars(Math.round(reviewsData.averageRating))}
              <Text style={styles.ratingText}>{reviewsData.averageRating.toFixed(1)} ({reviewsData.totalReviews} reviews)</Text>
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
            {product.description || 'This beautiful product is carefully crafted to bring joy to your special occasions. Perfect for gifting to your loved ones.'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.reviewHeader}>
            <View>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <Text style={styles.reviewSubText}>{reviewsData.totalReviews} review{reviewsData.totalReviews === 1 ? '' : 's'} submitted</Text>
            </View>
            {user && (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => setShowForm((prev) => !prev)}
              >
                <Text style={styles.reviewButtonText}>
                  {showForm ? 'Hide Review Form' : eligibleInfo.existingReview ? 'Edit Your Review' : 'Write a Review'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {user ? (
            <View style={styles.reviewNoticeContainer}>
              <Text style={styles.reviewNoticeText}>
                {eligibleInfo.existingReview
                  ? 'You can update or delete your existing review below.'
                  : eligibleInfo.eligible
                  ? 'You are eligible to leave a review for this product because one of your orders has been delivered.'
                  : 'Reviews are only available after your order is marked delivered.'}
              </Text>
            </View>
          ) : (
            <View style={styles.reviewNoticeContainer}>
              <Text style={styles.reviewNoticeText}>Login to submit or edit your review.</Text>
            </View>
          )}

          {showForm && (
            <View style={styles.reviewFormCard}>
              <Text style={styles.formLabel}>Your rating</Text>
              <View style={styles.starRow}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
                    <Ionicons
                      name="star"
                      size={28}
                      color={index < rating ? '#FFD700' : '#E2E8F0'}
                      style={{ marginRight: 6 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Your review</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                multiline
                placeholder="Describe your experience with this product"
                style={styles.textArea}
              />

              <Text style={styles.formLabel}>Upload images ({images.length}/3)</Text>
              <View style={styles.imagesRow}>
                {images.map((uri, idx) => (
                  <Image key={idx} source={{ uri }} style={styles.reviewImage} />
                ))}
                {images.length < 3 && (
                  <TouchableOpacity style={styles.imageUploadBox} onPress={handlePickImage}>
                    {uploadingImage ? (
                      <ActivityIndicator color="#D82B76" />
                    ) : (
                      <Feather name="plus" size={24} color="#D82B76" />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitReview}
                  disabled={savingReview}
                >
                  <Text style={styles.submitButtonText}>{savingReview ? 'Saving...' : eligibleInfo.existingReview ? 'Update Review' : 'Submit Review'}</Text>
                </TouchableOpacity>
                {eligibleInfo.existingReview && (
                  <TouchableOpacity
                    style={[styles.deleteButton, submittingDelete && { opacity: 0.5 }]}
                    onPress={handleDeleteReview}
                    disabled={submittingDelete}
                  >
                    <Text style={styles.deleteButtonText}>Delete Review</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.reviewListContainer}>
            {loadingReviews ? (
              <ActivityIndicator size="large" color="#D82B76" style={{ marginTop: 20 }} />
            ) : reviewsData.reviews.length === 0 ? (
              <Text style={styles.noReviewsText}>No reviews yet for this product.</Text>
            ) : (
              reviewsData.reviews.map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewTopRow}>
                    <View>
                      <Text style={styles.reviewUser}>{review.user?.name || 'Anonymous'}</Text>
                      <Text style={styles.reviewMeta}>{review.user?.city || 'Unknown City'}{review.user?.state ? `, ${review.user.state}` : ''}</Text>
                    </View>
                    <View style={styles.reviewStarsRow}>{renderStars(review.rating)}</View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  {review.images?.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImagesScroll}>
                      {review.images.map((uri, idx) => (
                        <Image key={idx} source={{ uri }} style={styles.reviewImageCard} />
                      ))}
                    </ScrollView>
                  )}
                  {review.adminReply?.message && (
                    <View style={styles.adminReplyBox}>
                      <Text style={styles.adminReplyTitle}>Admin reply</Text>
                      <Text style={styles.adminReplyText}>{review.adminReply.message}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

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
  ratingBox: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 5 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  name: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', flex: 1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  metaText: { fontSize: 12, fontWeight: '700', color: '#666', backgroundColor: '#F4F4F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginRight: 8, marginBottom: 8 },
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
  cartBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewSubText: { fontSize: 13, color: '#666' },
  reviewButton: { backgroundColor: '#D82B76', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  reviewButtonText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  reviewNoticeContainer: { backgroundColor: '#FFF0F6', borderRadius: 16, padding: 14, marginBottom: 18 },
  reviewNoticeText: { color: '#9D174D', fontSize: 13 },
  reviewFormCard: { backgroundColor: '#FEF2F2', borderRadius: 22, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#FBCFE8' },
  formLabel: { fontSize: 14, fontWeight: '700', color: '#86198F', marginBottom: 10 },
  starRow: { flexDirection: 'row', marginBottom: 14 },
  textArea: { minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 18, padding: 16, backgroundColor: '#FFF', color: '#111' },
  imagesRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  reviewImage: { width: 90, height: 90, borderRadius: 18, marginBottom: 10 },
  imageUploadBox: { width: 90, height: 90, borderRadius: 18, borderWidth: 1, borderColor: '#FBB6CE', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  formActions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 18 },
  submitButton: { backgroundColor: '#D82B76', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 18, flex: 1, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  deleteButton: { backgroundColor: '#FDE8E8', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 18, flex: 1, alignItems: 'center' },
  deleteButtonText: { color: '#B91C1C', fontWeight: '800', fontSize: 14 },
  reviewListContainer: { marginBottom: 20 },
  noReviewsText: { color: '#666', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  reviewCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  reviewTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  reviewUser: { fontSize: 16, fontWeight: '800', color: '#111' },
  reviewMeta: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  reviewStarsRow: { flexDirection: 'row' },
  reviewComment: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 12 },
  reviewImagesScroll: { marginVertical: 10 },
  reviewImageCard: { width: 120, height: 120, borderRadius: 20, marginRight: 12 },
  adminReplyBox: { backgroundColor: '#F8FAFC', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#DBEAFE' },
  adminReplyTitle: { color: '#1D4ED8', fontWeight: '800', marginBottom: 8 },
  adminReplyText: { color: '#475569', fontSize: 14 },
});

