import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import wishlistService from '../services/wishlistService';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import useDeliveryHours from '../hooks/useDeliveryHours';
import { colors, shadows } from '../constants/theme';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const GRID_H_PADDING = 14;
const GRID_GAP = 12;

export default function WishlistScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { isWishlisted, refresh: refreshWishlistCtx } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const deliveryHours = useDeliveryHours();
  const { bottom } = useLayoutInsets();
  const productCardWidth = Math.floor((width - GRID_H_PADDING * 2 - GRID_GAP) / 2);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      const list = Array.isArray(data) ? data : data?.data || [];
      const validItems = list.filter((i) => i.product);
      setWishlistItems(validItems);
    } catch (error) {
      console.warn('Fetch wishlist error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    productService
      .getProducts({ limit: 4 })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setRecommendations(list.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, [])
  );

  const handleRemove = async (itemId, productId) => {
    setRemovingId(itemId);
    try {
      if (itemId) {
        await wishlistService.deleteWishlistItem(itemId);
      } else {
        await wishlistService.toggleWishlist(productId);
      }
      setWishlistItems((prev) => prev.filter((i) => i._id !== itemId && i.product?._id !== productId));
      refreshWishlistCtx();
      showToast('Removed from wishlist', 'success');
    } catch (error) {
      showToast('Could not remove item', 'error');
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveAllToCart = () => {
    if (deliveryHours.isCurrentlyRestricted) {
      Alert.alert(
        '🌙 Night Delivery Paused',
        deliveryHours.message || `Orders are currently paused during night hours. Delivery resumes after ${deliveryHours.resumeTimeLabel || deliveryHours.formattedEnd || '7:00 AM'}.`,
        [{ text: 'OK' }]
      );
      return;
    }
    if (wishlistItems.length === 0) return;
    wishlistItems.forEach((item) => {
      if (item.product) addToCart(item.product);
    });
    showToast(`Added all ${wishlistItems.length} gifts to cart! 🛍️`, 'success');
  };

  const renderWishItem = ({ item }) => {
    const product = item.product;
    if (!product) return null;

    return (
      <ProductCard
        product={product}
        cardWidth={productCardWidth}
        onPress={() => navigation.navigate('ProductDetail', { product })}
        onAddToCart={() => {
          addToCart(product);
          showToast(`Added ${product.name} to cart! 🛍️`, 'success');
        }}
        isWishlist={true}
        removing={removingId === item._id}
        onRemove={() => handleRemove(item._id, product._id)}
        deliveryStatus={deliveryHours}
      />
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#741343" />
      <ScreenHeader
        title="My Wishlist"
        onBack={() => navigation.goBack()}
        border
        berry
        subtitle={wishlistItems.length > 0 ? `${wishlistItems.length} items saved` : null}
      />

      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.brandBerry} />
          </View>
        ) : wishlistItems.length > 0 ? (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item._id || item.product?._id}
          renderItem={renderWishItem}
          numColumns={2}
          contentContainerStyle={[styles.list, { paddingBottom: bottom + 24 }]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerActionRow}>
              <View style={styles.countPill}>
                <Ionicons name="heart" size={14} color={colors.primary} />
                <Text style={styles.countText}>{wishlistItems.length} Gifts Saved</Text>
              </View>

              <TouchableOpacity
                style={styles.moveAllBtn}
                onPress={handleMoveAllToCart}
                activeOpacity={0.8}
              >
                <Feather name="shopping-bag" size={13} color="#FFF" />
                <Text style={styles.moveAllText}>Move All to Cart</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              cardWidth={productCardWidth}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
              onAddToCart={() => {
                addToCart(item);
                showToast(`Added ${item.name} to cart! 🛍️`, 'success');
              }}
              deliveryStatus={deliveryHours}
            />
          )}
          numColumns={2}
          contentContainerStyle={[styles.list, { paddingBottom: bottom + 24 }]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-outline" size={38} color={colors.brandBerry} />
              </View>
              <Text style={styles.emptyTitle}>Your wishlist is empty!</Text>
              <Text style={styles.emptySubtitle}>
                Save your favorite flowers, delicious cakes, and personalized gifts so you can easily order them anytime!
              </Text>
              <View style={styles.emptyActionRow}>
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => navigation.navigate('Collections')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.browseBtnText}>Browse All Collections</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.offersBtn}
                  onPress={() => navigation.navigate('Offers')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.offersBtnText}>View Active Offers 🎁</Text>
                </TouchableOpacity>
              </View>

              {recommendations.length > 0 && (
                <View style={styles.recSectionHeader}>
                  <Text style={styles.recTitle}>Trending Gifts You Might Love</Text>
                </View>
              )}
            </View>
          }
        />
      )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#741343',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: GRID_H_PADDING,
    paddingTop: 10,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: GRID_GAP,
  },
  headerActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brandCreamAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brandBerry,
  },
  moveAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brandBerry,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    ...shadows.button,
  },
  moveAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 10,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF1D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textDark,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    maxWidth: 280,
  },
  emptyActionRow: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    maxWidth: 260,
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: colors.brandBerry,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    ...shadows.button,
  },
  browseBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  offersBtn: {
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  offersBtnText: {
    color: colors.brandBerry,
    fontSize: 12,
    fontWeight: '800',
  },
  recSectionHeader: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 18,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.brandBerry,
  },
});
