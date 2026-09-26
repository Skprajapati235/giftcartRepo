import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { colors, shadows } from '../constants/theme';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80';

export default function ProductCard({
  product,
  onPress,
  onAddToCart,
  onBuyNow,
  deliveryStatus,
  isWishlist = false,
  onRemove,
  removing = false,
  cardWidth,
}) {
  const { user } = useContext(AuthContext);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToCart: addToCartContext } = useCart();
  const { showToast } = useToast();
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [cartBusy, setCartBusy] = useState(false);

  if (!product) return null;

  const wishlisted = isWishlisted(product._id);
  const isRestricted = Boolean(deliveryStatus?.isCurrentlyRestricted);
  const resumeTime = deliveryStatus?.resumeTimeLabel || deliveryStatus?.formattedEnd || deliveryStatus?.nextAvailableTime || '7:00 AM';

  // Pricing calculations (matching giftfestive web)
  const basePrice = Number(product.price || 0);
  const salePrice = product.salePrice !== undefined && product.salePrice !== null ? Number(product.salePrice) : basePrice;
  const hasDiscount = Boolean(product.salePrice && product.price > product.salePrice);
  const discountPercent = hasDiscount
    ? Math.round(100 - (Number(product.salePrice) / Number(product.price)) * 100)
    : 0;

  const ratingValue = product.ratings ?? product.rating ?? 0;
  const ratingText = typeof ratingValue === 'number' && ratingValue > 0 ? ratingValue.toFixed(1) : '4.8';
  const deliveryTime = product.deliveryTime || product.expectedDeliveryDate;

  const getVariantName = (variant) => {
    if (!variant) return null;
    if (typeof variant === 'object') return variant.name || variant.title || variant.weight || variant.flowerCount || '';
    return String(variant);
  };

  const flavorName = getVariantName(product.flavor);
  const weightName = getVariantName(product.weight) || (product.weightOptions?.length > 0 ? getVariantName(product.weightOptions[0]) : null);
  const flowerCount = product.flowerCount || (product.flowerCountOptions?.length > 0 ? getVariantName(product.flowerCountOptions[0]?.flowerCount || product.flowerCountOptions[0]) : null);
  const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'Gift');

  const subtitle =
    product.tagLine ||
    (flowerCount ? `${flowerCount} flowers` : null) ||
    weightName ||
    (typeof product.category === 'object' ? product.category?.name : null);

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast('Please login to use your wishlist', 'warning');
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

  const handleCartPress = async () => {
    if (isRestricted) {
      Alert.alert(
        '🌙 Night Delivery Paused',
        deliveryStatus?.message || `Orders are currently paused during night hours. Delivery resumes after ${resumeTime}.`,
        [{ text: 'OK' }]
      );
      return;
    }
    setCartBusy(true);
    try {
      if (onAddToCart) {
        await onAddToCart();
      } else {
        await addToCartContext(product);
      }
    } catch (err) {
      console.warn('Cart action failed:', err);
    } finally {
      setCartBusy(false);
    }
  };

  const imageUri = imgError || !product.image ? DEFAULT_IMAGE : product.image;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={[styles.card, cardWidth ? { width: cardWidth } : null]}
      onPress={onPress}
    >
      {/* ── Image Container (matching giftfestive web aspect ratio) ── */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />

        {/* Wishlist Heart or Remove Button — Top Right */}
        {isWishlist && onRemove ? (
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={onRemove}
            disabled={removing}
            activeOpacity={0.7}
          >
            {removing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name="trash-2" size={13} color="#DC2626" />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={handleToggleWishlist}
            disabled={wishlistBusy}
            activeOpacity={0.7}
          >
            {wishlistBusy ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name={wishlisted ? 'heart' : 'heart-outline'}
                size={15}
                color={wishlisted ? '#D82B76' : '#6B7280'}
              />
            )}
          </TouchableOpacity>
        )}

        {/* Discount Badge — Top Left */}
        {hasDiscount && discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Rating Badge — Top Right below Wishlist */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={9.5} color="#FBBF24" />
          <Text style={styles.ratingText}>{ratingText}</Text>
        </View>

        {/* Night Restriction Overlay Bar */}
        {isRestricted && (
          <View style={styles.restrictedBadge}>
            <Text style={styles.restrictedText} numberOfLines={1}>
              🌙 Delivery resumes {resumeTime}
            </Text>
          </View>
        )}
      </View>

      {/* ── Content Container ── */}
      <View style={styles.infoContainer}>
        {/* Title + Delivery Time Row */}
        <View style={styles.titleDeliveryRow}>
          <View style={styles.titleWrap}>
            {product.hasEgglessOption && (
              <View style={styles.vegIconBox}>
                <View style={styles.vegIconDot} />
              </View>
            )}
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
          </View>
          {deliveryTime ? (
            <View style={styles.deliveryBadge}>
              <Feather name="truck" size={9} color="#16A34A" />
              <Text style={styles.deliveryText} numberOfLines={1}>
                {deliveryTime}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Variants Block (Dynamic data matching giftfestive web) */}
        <View style={styles.variantRow}>
          {flavorName ? (
            <View style={styles.flavorPill}>
              <Text style={styles.flavorPillText} numberOfLines={1}>🌸 {flavorName}</Text>
            </View>
          ) : null}
          {weightName ? (
            <View style={styles.weightPill}>
              <Text style={styles.weightPillText} numberOfLines={1}>⚖️ {weightName}</Text>
            </View>
          ) : null}
          {flowerCount ? (
            <View style={styles.flowerPill}>
              <Text style={styles.flowerPillText} numberOfLines={1}>💐 {flowerCount}</Text>
            </View>
          ) : null}
          {product.isCodAvailable ? (
            <View style={styles.codPill}>
              <Text style={styles.codPillText} numberOfLines={1}>✓ COD</Text>
            </View>
          ) : null}
          {!flavorName && !weightName && !flowerCount && (
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText} numberOfLines={1}>
                Gift · {categoryName}
              </Text>
            </View>
          )}
        </View>

        {/* Price + Subtitle & Cart Button Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.salePriceText}>₹{salePrice}</Text>
              {hasDiscount && (
                <Text style={styles.mrpText}>₹{basePrice}</Text>
              )}
            </View>
            {subtitle ? (
              <Text style={styles.subtitleText} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          {/* Cart Button with GiftFestive berry bg & gold cart icon / lock */}
          <TouchableOpacity
            style={[
              styles.cartBtn,
              isRestricted && styles.cartBtnRestricted,
            ]}
            onPress={handleCartPress}
            disabled={cartBusy}
            activeOpacity={0.85}
          >
            {cartBusy ? (
              <ActivityIndicator size="small" color="#FFD166" />
            ) : isRestricted ? (
              <Feather name="lock" size={13} color="#FFD166" />
            ) : (
              <Ionicons name="cart" size={16} color="#FFD166" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ead6c5',
    overflow: 'hidden',
    marginBottom: 12,
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...shadows.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: '#D82B76',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    zIndex: 10,
    ...shadows.sm,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ratingBadge: {
    position: 'absolute',
    top: 39,
    right: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    zIndex: 10,
    ...shadows.sm,
  },
  ratingText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1F2937',
  },
  restrictedBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: 'rgba(33, 9, 26, 0.95)',
    borderRadius: 8,
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 209, 102, 0.3)',
    zIndex: 10,
  },
  restrictedText: {
    color: '#FFD166',
    fontSize: 9,
    fontWeight: '800',
  },
  infoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  titleDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 5,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vegIconBox: {
    width: 11,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.2,
    borderColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
  },
  vegIconDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  productName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.8,
    borderColor: '#DCFCE7',
    flexShrink: 0,
  },
  deliveryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  flavorPill: {
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 5.5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  flavorPillText: {
    color: '#D82B76',
    fontSize: 9,
    fontWeight: '700',
  },
  weightPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5.5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  weightPillText: {
    color: '#059669',
    fontSize: 9,
    fontWeight: '700',
  },
  flowerPill: {
    backgroundColor: '#FFF1F6',
    paddingHorizontal: 5.5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  flowerPillText: {
    color: '#D82B76',
    fontSize: 9,
    fontWeight: '700',
  },
  codPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5.5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  codPillText: {
    color: '#2563EB',
    fontSize: 9,
    fontWeight: '700',
  },
  categoryPill: {
    backgroundColor: '#fff1d6',
    paddingHorizontal: 5.5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  categoryPillText: {
    color: '#741343',
    fontSize: 9,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 1,
  },
  priceContainer: {
    flex: 1,
    marginRight: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  salePriceText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  mrpText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  subtitleText: {
    fontSize: 9.5,
    color: '#6B7280',
    marginTop: 2,
  },
  cartBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#D82B76',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  cartBtnRestricted: {
    backgroundColor: '#3d0f2b',
    borderColor: 'rgba(255, 209, 102, 0.3)',
    borderWidth: 0.8,
  },
});
