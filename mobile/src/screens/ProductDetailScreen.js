import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductReviews, likeReview, dislikeReview } from '../services/reviewService';
import productService from '../services/productService';
import { useToast } from '../context/ToastContext';
import { SafeScreen, StickyBottomBar } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import useDeliveryHours from '../hooks/useDeliveryHours';
import ProductCard from '../components/ProductCard';
import { colors, shadows } from '../constants/theme';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 380;
const EGGLESS_SURCHARGE = 50;

function productHasEgglessOption(product) {
  if (!product) return false;
  if (product.hasEgglessOption === true || product.hasEgglessOption === 'true') return true;
  const categoryName = (product.category?.name || product.category || '').toString().toLowerCase();
  return /cake|pastry|bakery|dessert/.test(categoryName);
}

export default function ProductDetailScreen({ route, navigation }) {
  const { product: initialProduct } = route.params;
  const [product, setProduct] = useState(initialProduct);
  const { user } = useContext(AuthContext);
  const { cart, addToCart: addToCartContext } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const deliveryHours = useDeliveryHours();
  const isOrderBlocked = Boolean(deliveryHours.isCurrentlyRestricted || deliveryHours.blockOrders);

  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  // Eggless selection
  const hasEgglessOption = productHasEgglessOption(product);
  const [isEggless, setIsEggless] = useState(true);

  // Variants selection
  const weightOptions = product.weightOptions || [];
  const flowerCountOptions = product.flowerCountOptions || [];
  const [selectedWeightOption, setSelectedWeightOption] = useState(
    weightOptions.length > 0 ? weightOptions[0] : null
  );
  const [selectedFlowerCountOption, setSelectedFlowerCountOption] = useState(
    flowerCountOptions.length > 0 ? flowerCountOptions[0] : null
  );
  const activeVariantOption = selectedWeightOption || selectedFlowerCountOption;

  // Gallery
  const galleryImages = Array.from(new Set([product.image, ...(product.images || [])].filter(Boolean)));
  const [activeImage, setActiveImage] = useState(galleryImages[0] || product.image);

  // Pricing
  const baseMRP = Number(product.price || 0);
  const globalSalePrice = product.salePrice !== undefined && product.salePrice !== null ? Number(product.salePrice) : baseMRP;
  const unitMRP = activeVariantOption ? Number(activeVariantOption.price || 0) : baseMRP;
  const baseSalePrice = activeVariantOption
    ? Number(activeVariantOption.salePrice ?? activeVariantOption.price ?? 0)
    : globalSalePrice;
  const unitDiscountPct = activeVariantOption ? Number(activeVariantOption.discount || 0) : Number(product.discount || 0);

  let unitSalePrice = baseSalePrice;
  if (hasEgglessOption && isEggless && product.egglessExtraCost) {
    unitSalePrice += Number(product.egglessExtraCost);
  }

  const savingsAmount = unitMRP > unitSalePrice ? unitMRP - unitSalePrice : 0;
  const savingsPercent = unitMRP > 0 && savingsAmount > 0 ? Math.round((savingsAmount / unitMRP) * 100) : 0;
  const displayDiscountPercent = unitDiscountPct > 0 ? unitDiscountPct : savingsPercent;

  const { top, stickyFooterPadding } = useLayoutInsets();
  const wishlisted = isWishlisted(product._id);
  const inCart = cart.some((item) => item.product === product._id);

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
    fetchSimilarProducts();
  }, [product._id]);

  const fetchProductDetails = async () => {
    try {
      const res = await productService.getProductById(product._id);
      const fullProd = res?.data || res?.product || res;
      if (fullProd && fullProd._id) {
        setProduct(fullProd);
        if (fullProd.weightOptions?.length > 0 && !selectedWeightOption) {
          setSelectedWeightOption(fullProd.weightOptions[0]);
        }
        if (fullProd.flowerCountOptions?.length > 0 && !selectedFlowerCountOption) {
          setSelectedFlowerCountOption(fullProd.flowerCountOptions[0]);
        }
      }
    } catch (err) {
      console.warn('API error fetching product by ID:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await getProductReviews(product._id);
      const reviewsArray = res.data || (Array.isArray(res) ? res : res.reviews || []);
      setReviews(reviewsArray);
    } catch (err) {
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const categoryId = typeof product.category === 'object' ? product.category?._id : product.category;
      const resp = await productService.getProducts(categoryId ? { category: categoryId, limit: 10 } : { limit: 10 });
      const list = Array.isArray(resp) ? resp : resp?.data || resp?.products || [];
      setSimilarProducts(list.filter((p) => p._id !== product._id));
    } catch (e) {}
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast('Please login to use wishlist', 'warning');
      return;
    }
    setWishlistBusy(true);
    try {
      const added = await toggleWishlist(product._id);
      showToast(added ? 'Added to wishlist ❤️' : 'Removed from wishlist', 'success');
    } catch {
      showToast('Could not update wishlist', 'error');
    } finally {
      setWishlistBusy(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${product.name} on GiftFestive! 🎁\nhttps://giftfestive.com/product/${product._id}`,
      });
    } catch (e) {}
  };

  const addToCart = async (proceedToCheckout = false) => {
    if (isOrderBlocked) {
      Alert.alert(
        '🌙 Night Delivery Paused',
        deliveryHours.message || `Orders are currently paused during night hours. Deliveries resume after ${deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const activeVariant = {
      ...(activeVariantOption ? (typeof activeVariantOption === 'object' ? activeVariantOption : { name: activeVariantOption }) : {}),
      isEggless: hasEgglessOption ? isEggless : false,
    };

    await addToCartContext(product, quantity, activeVariant);
    showToast(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart! 🛍️`, 'success');

    if (proceedToCheckout) {
      if (!user) {
        navigation.navigate('Login', { redirectTo: 'Checkout' });
      } else {
        navigation.navigate('Cart');
      }
    }
  };

  const ratingValue = product.ratings || product.rating || 0;
  const ratingText = ratingValue > 0 ? ratingValue.toFixed(1) : 'New';

  const specChips = [
    product.deliveryTime && { icon: 'truck', label: `Delivers in ${product.deliveryTime}` },
    product.expectedDeliveryDate && { icon: 'clock', label: `Arrives ${product.expectedDeliveryDate}` },
    product.isCodAvailable && { icon: 'check-circle', label: 'COD available' },
    hasEgglessOption && { icon: 'check-circle', label: 'Eggless available' },
  ].filter(Boolean);

  return (
    <SafeScreen style={styles.container}>
      {/* ── Top Floating Header ── */}
      <View style={[styles.floatingHeader, { top: top + 6 }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="chevron-left" size={22} color={colors.brandBerry} />
        </TouchableOpacity>

        <View style={styles.headerRightRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare} activeOpacity={0.8}>
            <Feather name="share-2" size={18} color={colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleToggleWishlist}
            disabled={wishlistBusy}
            activeOpacity={0.8}
          >
            {wishlistBusy ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name={wishlisted ? 'heart' : 'heart-outline'}
                size={20}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.8}
          >
            <Feather name="shopping-bag" size={18} color={colors.brandBerry} />
            {cart.length > 0 && (
              <View style={styles.headerCartBadge}>
                <Text style={styles.headerCartBadgeText}>
                  {cart.length > 99 ? '99+' : cart.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 + stickyFooterPadding }}
      >
        {/* Night Delivery Restriction Banner */}
        {deliveryHours.isCurrentlyRestricted && (
          <View style={styles.nightBanner}>
            <Text style={{ fontSize: 20 }}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.nightBannerTitle}>
                Night Delivery Paused — Resumes {deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}
              </Text>
              <Text style={styles.nightBannerDesc}>
                Orders are temporarily paused during night operating hours. Deliveries resume after {deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}. Catalog browsing is open.
              </Text>
            </View>
          </View>
        )}
        {/* ── Main Gallery Image ── */}
        <TouchableOpacity
          style={styles.imageStage}
          activeOpacity={0.95}
          onPress={() => {
            setSelectedImage(activeImage);
            setIsModalVisible(true);
          }}
        >
          <Image source={{ uri: activeImage }} style={styles.mainImage} resizeMode="cover" />

          {displayDiscountPercent > 0 && (
            <View style={styles.discountPill}>
              <Text style={styles.discountPillText}>{displayDiscountPercent}% OFF</Text>
            </View>
          )}

          {deliveryHours.isCurrentlyRestricted && (
            <View style={styles.restrictedBanner}>
              <Text style={styles.restrictedBannerText}>
                🌙 Delivery Paused • Resumes {deliveryHours.formattedEnd || '7:00 AM'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Thumbnails Row ── */}
        {galleryImages.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsScroll}>
            {galleryImages.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.thumbBox, activeImage === img && styles.thumbBoxActive]}
                onPress={() => setActiveImage(img)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: img }} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Product Content Card ── */}
        <View style={styles.contentCard}>
          {/* Category & Rating */}
          <View style={styles.badgeRow}>
            {Boolean(product.category?.name || product.category) && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{typeof product.category === 'object' ? product.category?.name : product.category}</Text>
              </View>
            )}

            <View style={styles.ratingPill}>
              <Ionicons name="star" size={12} color="#FBBF24" />
              <Text style={styles.ratingPillText}>{ratingText}</Text>
              <Text style={styles.reviewCountText}>({reviews.length} reviews)</Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={styles.title}>{product.name}</Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{unitSalePrice}</Text>
            {unitMRP > unitSalePrice && (
              <Text style={styles.mrpPrice}>₹{unitMRP}</Text>
            )}
            {displayDiscountPercent > 0 && (
              <View style={styles.savingsPill}>
                <Text style={styles.savingsPillText}>{displayDiscountPercent}% off</Text>
              </View>
            )}
          </View>

          {/* Service / Specs Chips */}
          {specChips.length > 0 && (
            <View style={styles.specsRow}>
              {specChips.map((chip, idx) => (
                <View key={idx} style={styles.specChip}>
                  <Feather name={chip.icon} size={12} color={colors.primary} />
                  <Text style={styles.specChipText}>{chip.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Select Weight Variants */}
          {weightOptions.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantSectionTitle}>Select Weight</Text>
              <View style={styles.variantChipsRow}>
                {weightOptions.map((w, idx) => {
                  const isSelected = selectedWeightOption?._id === w._id;
                  const vPrice = w.salePrice ?? w.price;
                  return (
                    <TouchableOpacity
                      key={w._id || idx}
                      style={[styles.variantChip, isSelected && styles.variantChipActive]}
                      onPress={() => setSelectedWeightOption(w)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.variantChipLabel, isSelected && styles.variantChipLabelActive]}>
                        {w.weight}
                      </Text>
                      <Text style={[styles.variantChipPrice, isSelected && styles.variantChipPriceActive]}>
                        ₹{vPrice}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Select Flower Count Variants */}
          {flowerCountOptions.length > 0 && (
            <View style={styles.variantSection}>
              <Text style={styles.variantSectionTitle}>Select Flower Count</Text>
              <View style={styles.variantChipsRow}>
                {flowerCountOptions.map((f, idx) => {
                  const isSelected = selectedFlowerCountOption?._id === f._id;
                  const vPrice = f.salePrice ?? f.price;
                  return (
                    <TouchableOpacity
                      key={f._id || idx}
                      style={[styles.variantChip, isSelected && styles.variantChipActive]}
                      onPress={() => setSelectedFlowerCountOption(f)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.variantChipLabel, isSelected && styles.variantChipLabelActive]}>
                        {f.flowerCount}
                      </Text>
                      <Text style={[styles.variantChipPrice, isSelected && styles.variantChipPriceActive]}>
                        ₹{vPrice}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Egg Preference Selector */}
          {hasEgglessOption && (
            <View style={styles.eggSection}>
              <View style={styles.eggSectionHeader}>
                <Text style={styles.variantSectionTitle}>Select Egg Preference</Text>
                <Text style={styles.eggSelectedLabel}>
                  {isEggless ? 'Eggless (100% Veg)' : 'With Egg'}
                </Text>
              </View>
              <View style={styles.eggOptionsRow}>
                <TouchableOpacity
                  style={[styles.eggCard, isEggless && styles.eggCardActiveVeg]}
                  onPress={() => setIsEggless(true)}
                  activeOpacity={0.85}
                >
                  <View style={styles.vegDotBox}>
                    <View style={styles.vegDot} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eggOptionTitle}>Eggless</Text>
                    <Text style={styles.eggOptionDesc}>100% Vegetarian</Text>
                  </View>
                  {isEggless && <Ionicons name="checkmark-circle" size={18} color="#16a34a" />}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.eggCard, !isEggless && styles.eggCardActiveNonVeg]}
                  onPress={() => setIsEggless(false)}
                  activeOpacity={0.85}
                >
                  <View style={styles.nonVegDotBox}>
                    <View style={styles.nonVegDot} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eggOptionTitle}>With Egg</Text>
                    <Text style={styles.eggOptionDesc}>Regular Recipe</Text>
                  </View>
                  {!isEggless && <Ionicons name="checkmark-circle" size={18} color="#B45309" />}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.qtyCard}>
            <View>
              <Text style={styles.qtyCardTitle}>Quantity</Text>
              <Text style={styles.qtyCardSubtitle}>Select number of units</Text>
            </View>
            <View style={styles.stepperBox}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Feather name="minus" size={14} color={colors.brandBerry} />
              </TouchableOpacity>
              <Text style={styles.stepperText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity((q) => q + 1)}
              >
                <Feather name="plus" size={14} color={colors.brandBerry} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.descSection}>
              <Text style={styles.variantSectionTitle}>Product Details</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Customer Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.variantSectionTitle}>Customer Reviews ({reviews.length})</Text>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => navigation.navigate('AddReview', { product })}
                activeOpacity={0.8}
              >
                <Feather name="edit-3" size={12} color={colors.primary} />
                <Text style={styles.writeReviewText}>Write a Review</Text>
              </TouchableOpacity>
            </View>

            {loadingReviews ? (
              <ActivityIndicator color={colors.brandBerry} style={{ marginVertical: 14 }} />
            ) : reviews.length > 0 ? (
              reviews.slice(0, 3).map((rev) => (
                <View key={rev._id} style={styles.reviewItem}>
                  <View style={styles.reviewTopRow}>
                    <Text style={styles.reviewerName}>{rev.user?.name || 'Festive Shopper'}</Text>
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= (rev.rating || 5) ? 'star' : 'star-outline'}
                          size={12}
                          color="#FBBF24"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>Be the first to review this gift! ✨</Text>
            )}
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.variantSectionTitle}>You May Also Like</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarScroll}>
                {similarProducts.slice(0, 6).map((item) => (
                  <ProductCard
                    key={item._id}
                    product={item}
                    cardWidth={160}
                    onPress={() => navigation.push('ProductDetail', { product: item })}
                    onAddToCart={() => addToCartContext(item)}
                    deliveryStatus={deliveryHours}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Action Bar ── */}
      <StickyBottomBar absolute contentStyle={styles.stickyFooter}>
        <View style={styles.footerPriceCol}>
          <Text style={styles.footerTotalLabel}>Total Price</Text>
          <Text style={styles.footerPriceVal}>₹{unitSalePrice * quantity}</Text>
        </View>

        <View style={styles.footerButtonsRow}>
          <TouchableOpacity
            style={[
              styles.addToCartBtn,
              inCart && styles.inCartBtn,
              isOrderBlocked && styles.btnPaused,
            ]}
            onPress={() => {
              if (inCart) {
                navigation.navigate('Cart');
              } else {
                addToCart(false);
              }
            }}
            disabled={isOrderBlocked}
            activeOpacity={0.85}
          >
            <Feather
              name={isOrderBlocked ? 'lock' : (inCart ? 'arrow-right' : 'shopping-bag')}
              size={15}
              color={isOrderBlocked ? '#FFD166' : (inCart ? colors.brandBerry : '#FFF')}
            />
            <Text style={[styles.addToCartText, inCart && styles.inCartText, isOrderBlocked && styles.btnPausedText]}>
              {isOrderBlocked ? 'Orders Paused' : (inCart ? 'Go to Cart' : 'Add to Cart')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.buyNowBtn,
              isOrderBlocked && styles.buyNowBtnPaused,
            ]}
            onPress={() => {
              if (inCart) {
                navigation.navigate('Cart');
              } else {
                addToCart(true);
              }
            }}
            disabled={isOrderBlocked}
            activeOpacity={0.85}
          >
            <Text style={[styles.buyNowText, isOrderBlocked && styles.buyNowTextPaused]}>
              {isOrderBlocked ? 'Delivery Paused' : 'Buy Now'}
            </Text>
            <Feather name={isOrderBlocked ? 'lock' : 'arrow-right'} size={14} color={isOrderBlocked ? '#FFD166' : colors.brandGold} />
          </TouchableOpacity>
        </View>
      </StickyBottomBar>

      {/* ── Fullscreen Image Modal ── */}
      <Modal visible={isModalVisible} transparent onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.fullscreenModal}>
          <TouchableOpacity
            style={[styles.modalCloseBtn, { top: top + 14 }]}
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  floatingHeader: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerRightRow: {
    flexDirection: 'row',
    gap: 8,
  },
  headerCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  imageStage: {
    width: width,
    height: ITEM_HEIGHT,
    backgroundColor: '#FAF5F7',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  discountPill: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  discountPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  restrictedBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(33, 9, 26, 0.92)',
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 209, 102, 0.3)',
  },
  restrictedBannerText: {
    color: colors.brandGold,
    fontSize: 11,
    fontWeight: '800',
  },
  thumbsScroll: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  thumbBox: {
    width: 54,
    height: 54,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  thumbBoxActive: {
    borderColor: colors.brandBerry,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: colors.brandCreamAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#92400E',
  },
  reviewCountText: {
    fontSize: 10,
    color: '#78350F',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textDark,
    lineHeight: 28,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 14,
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.brandBerry,
  },
  mrpPrice: {
    fontSize: 15,
    color: colors.textLight,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  savingsPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandCream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.brandBerry,
  },
  variantSection: {
    marginBottom: 16,
  },
  variantSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 8,
  },
  variantChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 70,
  },
  variantChipActive: {
    backgroundColor: colors.brandBerry,
    borderColor: colors.brandBerry,
    ...shadows.button,
  },
  variantChipLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textDark,
  },
  variantChipLabelActive: {
    color: '#FFF',
  },
  variantChipPrice: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  variantChipPriceActive: {
    color: colors.brandGold,
  },
  eggSection: {
    marginBottom: 16,
  },
  eggSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eggSelectedLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brandBerry,
  },
  eggOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  eggCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    backgroundColor: '#FFFFFF',
  },
  eggCardActiveVeg: {
    borderColor: '#16a34a',
    backgroundColor: '#F0FDF4',
  },
  eggCardActiveNonVeg: {
    borderColor: '#B45309',
    backgroundColor: '#FFFBEB',
  },
  vegDotBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  nonVegDotBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#B45309',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nonVegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B45309',
  },
  eggOptionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textDark,
  },
  eggOptionDesc: {
    fontSize: 9.5,
    color: colors.textMuted,
  },
  qtyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.brandCream,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    marginBottom: 16,
  },
  qtyCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.brandBerry,
  },
  qtyCardSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: 10,
    padding: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textDark,
    paddingHorizontal: 8,
  },
  descSection: {
    marginBottom: 16,
  },
  descText: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
  },
  reviewsSection: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 14,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.brandCreamAlt,
  },
  writeReviewText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.primary,
  },
  reviewItem: {
    backgroundColor: colors.brandCream,
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.textDark,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 15,
  },
  noReviewsText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  similarSection: {
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 14,
  },
  similarScroll: {
    gap: 10,
    paddingTop: 6,
  },
  stickyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
  },
  footerPriceCol: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  footerPriceVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.brandBerry,
  },
  footerButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brandBerry,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    ...shadows.button,
  },
  inCartBtn: {
    backgroundColor: colors.brandCreamAlt,
    borderWidth: 1.5,
    borderColor: colors.borderRose,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  inCartText: {
    color: colors.brandBerry,
  },
  buyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    ...shadows.button,
  },
  buyNowText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    right: 18,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: width,
    height: width,
  },
  nightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21091a',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 4,
    gap: 12,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  nightBannerTitle: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#FFD166',
  },
  nightBannerDesc: {
    fontSize: 10.5,
    color: '#F3F4F6',
    marginTop: 2,
    lineHeight: 15,
  },
  btnPaused: {
    backgroundColor: '#3d0f2b',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  btnPausedText: {
    color: '#FFD166',
  },
  buyNowBtnPaused: {
    backgroundColor: '#21091a',
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.35)',
  },
  buyNowTextPaused: {
    color: '#FFD166',
  },
});
