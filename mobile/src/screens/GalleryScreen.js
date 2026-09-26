import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import galleryService from '../services/galleryService';
import { colors, shadows } from '../constants/theme';
import { SafeScreen } from '../components/layout';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 36) / 2;

export default function GalleryScreen() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [settings, setSettings] = useState(null);
  const [layoutMode, setLayoutMode] = useState('masonry'); // 'masonry' | 'grid' | 'feed' | 'carousel'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Lightbox Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [likedMap, setLikedMap] = useState({});

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [galleryRes, catsRes, settingsRes] = await Promise.all([
        galleryService.getGallery({
          category: activeCategory !== 'all' ? activeCategory : undefined,
          limit: 30,
        }),
        galleryService.getCategories(),
        galleryService.getSettings(),
      ]);

      if (galleryRes && galleryRes.data) {
        setItems(galleryRes.data);
      }
      if (Array.isArray(catsRes) && catsRes.length > 0) {
        setCategories(catsRes);
      }
      if (settingsRes) {
        setSettings(settingsRes);
        if (settingsRes.mobileLayout) {
          setLayoutMode(settingsRes.mobileLayout);
        }
      }
    } catch (err) {
      console.warn('GalleryScreen loadData error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLike = async (id, currentLikes, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (likedMap[id]) return; // already liked

    setLikedMap((prev) => ({ ...prev, [id]: true }));
    setItems((prev) =>
      prev.map((it) => (it._id === id ? { ...it, likes: (it.likes || 0) + 1 } : it))
    );

    if (selectedItem && selectedItem._id === id) {
      setSelectedItem((prev) => ({ ...prev, likes: (prev.likes || 0) + 1 }));
    }

    try {
      await galleryService.likeItem(id);
    } catch (err) {
      console.warn('Failed to like item:', err);
    }
  };

  const handleShopLook = (product) => {
    if (!product) return;
    setSelectedItem(null);
    navigation.navigate('ProductDetail', {
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      },
    });
  };

  // Split into 2 columns for a masonry look
  const col1 = items.filter((_, idx) => idx % 2 === 0);
  const col2 = items.filter((_, idx) => idx % 2 === 1);

  const renderMasonryCard = (item, isCol2 = false) => {
    const isLiked = Boolean(likedMap[item._id]);
    // Stagger heights slightly for a Pinterest masonry aesthetic
    const cardHeight = isCol2 ? 240 : 210;

    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.88}
        onPress={() => setSelectedItem(item)}
        style={[styles.card, { height: cardHeight }]}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
          style={styles.cardGradient}
        />

        {/* Top Badges */}
        <View style={styles.cardTopRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category || 'Celebration'}</Text>
          </View>

          <View style={styles.topRightIcons}>
            {item.mediaType === 'video' && (
              <View style={styles.videoBadge}>
                <Ionicons name="play" size={10} color="#FFF" />
              </View>
            )}
            {item.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="sparkles" size={10} color="#741343" />
              </View>
            )}
          </View>
        </View>

        {/* Bottom Details */}
        <View style={styles.cardBottom}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.cardBottomRow}>
            {settings?.enableLikes !== false && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => handleLike(item._id, item.likes, e)}
                style={styles.likePill}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={14}
                  color={isLiked ? '#FF3B30' : '#FFF'}
                />
                <Text style={styles.likeCount}>{item.likes || 0}</Text>
              </TouchableOpacity>
            )}

            {settings?.enableShopLook !== false && item.linkedProduct && (
              <View style={styles.shopPill}>
                <Feather name="shopping-bag" size={11} color="#FFD166" />
                <Text style={styles.shopPillText}>Shop</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGridCard = (item) => {
    const isLiked = Boolean(likedMap[item._id]);
    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.85}
        onPress={() => setSelectedItem(item)}
        style={styles.gridCard}
      >
        <Image source={{ uri: item.image }} style={styles.gridImage} resizeMode="cover" />

        {item.mediaType === 'video' && (
          <View style={styles.gridVideoBadge}>
            <Ionicons name="play" size={10} color="#FFF" />
          </View>
        )}
        {item.isFeatured && (
          <View style={styles.gridFeaturedBadge}>
            <Ionicons name="sparkles" size={9} color="#741343" />
          </View>
        )}
        {settings?.enableLikes !== false && (item.likes > 0 || isLiked) && (
          <View style={styles.gridLikeBadge}>
            <Ionicons name="heart" size={10} color={isLiked ? '#FF3B30' : '#FFF'} />
            <Text style={styles.gridLikeText}>{item.likes || 0}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFeedCard = (item) => {
    const isLiked = Boolean(likedMap[item._id]);
    return (
      <View key={item._id} style={styles.feedCard}>
        {/* Header */}
        <View style={styles.feedHeader}>
          <View style={styles.feedAuthorRow}>
            <View style={styles.feedAvatar}>
              <Text style={styles.feedAvatarText}>
                {item.title ? item.title.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
            <View>
              <Text style={styles.feedAuthorName} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.feedCategoryTag}>
                {item.category || 'Celebration Story'}
              </Text>
            </View>
          </View>
          {item.isFeatured && (
            <View style={styles.feedFeaturedBadge}>
              <Ionicons name="sparkles" size={10} color="#B45309" />
              <Text style={styles.feedFeaturedText}>FEATURED</Text>
            </View>
          )}
        </View>

        {/* Media */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => setSelectedItem(item)}
          style={styles.feedMediaContainer}
        >
          <Image source={{ uri: item.image }} style={styles.feedMediaImage} resizeMode="cover" />
          {item.mediaType === 'video' && (
            <View style={styles.feedVideoOverlay}>
              <Ionicons name="play" size={24} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Actions Bar */}
        <View style={styles.feedActionBar}>
          <View style={styles.feedActionLeft}>
            {settings?.enableLikes !== false && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => handleLike(item._id, item.likes, e)}
                style={styles.feedLikeBtn}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isLiked ? '#FF3B30' : '#1F2937'}
                />
                <Text style={styles.feedLikeCount}>{item.likes || 0} likes</Text>
              </TouchableOpacity>
            )}
          </View>

          {settings?.enableShopLook !== false && item.linkedProduct && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleShopLook(item.linkedProduct)}
              style={styles.feedShopBtn}
            >
              <Feather name="shopping-bag" size={12} color="#FFF" />
              <Text style={styles.feedShopBtnText}>Shop This Item</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Caption */}
        <View style={styles.feedCaptionBox}>
          {item.caption ? (
            <Text style={styles.feedCaption}>
              <Text style={styles.feedCaptionTitle}>{item.title} </Text>
              {item.caption}
            </Text>
          ) : null}

          {item.tags && item.tags.length > 0 && (
            <Text style={styles.feedTagsText}>
              {item.tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ')}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderCarouselCard = (item, idx) => {
    const isLiked = Boolean(likedMap[item._id]);
    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.9}
        onPress={() => setSelectedItem(item)}
        style={styles.carouselCard}
      >
        <Image source={{ uri: item.image }} style={styles.carouselImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.92)']}
          style={styles.carouselGradient}
        />

        {/* Top Badges */}
        <View style={styles.carouselTopRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category || 'Celebration'}</Text>
          </View>
          <View style={styles.carouselIndexBadge}>
            <Text style={styles.carouselIndexText}>
              {idx + 1} / {items.length}
            </Text>
          </View>
        </View>

        {/* Bottom Details */}
        <View style={styles.carouselBottomContent}>
          <Text style={styles.carouselTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.caption ? (
            <Text style={styles.carouselCaption} numberOfLines={2}>
              {item.caption}
            </Text>
          ) : null}

          <View style={styles.carouselActionsRow}>
            {settings?.enableLikes !== false && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => handleLike(item._id, item.likes, e)}
                style={styles.carouselLikeBtn}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={16}
                  color={isLiked ? '#FF3B30' : '#FFF'}
                />
                <Text style={styles.carouselLikeText}>{item.likes || 0}</Text>
              </TouchableOpacity>
            )}

            {settings?.enableShopLook !== false && item.linkedProduct && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleShopLook(item.linkedProduct)}
                style={styles.carouselShopBtn}
              >
                <Feather name="shopping-bag" size={12} color="#741343" />
                <Text style={styles.carouselShopText}>Shop Look</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textBerry} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.headerTag}>
            <Text style={styles.headerTagText}>REAL DELIVERIES</Text>
          </View>
          <Text style={styles.headerTitle}>{settings?.title || 'Moments of Joy 📸'}</Text>
        </View>

        {/* Layout Switcher Pill */}
        <TouchableOpacity
          onPress={() => {
            const modes = ['masonry', 'grid', 'feed', 'carousel'];
            const nextIdx = (modes.indexOf(layoutMode) + 1) % modes.length;
            setLayoutMode(modes[nextIdx]);
          }}
          activeOpacity={0.7}
          style={styles.layoutTogglePill}
        >
          <MaterialCommunityIcons
            name={
              layoutMode === 'masonry'
                ? 'view-dashboard-outline'
                : layoutMode === 'grid'
                ? 'grid'
                : layoutMode === 'feed'
                ? 'view-agenda-outline'
                : 'view-carousel-outline'
            }
            size={15}
            color="#741343"
          />
          <Text style={styles.layoutPillText}>{layoutMode.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Pills */}
      <View style={styles.categoryScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity
            onPress={() => setActiveCategory('all')}
            style={[
              styles.catChip,
              activeCategory === 'all' && styles.catChipActive,
            ]}
          >
            <Text
              style={[
                styles.catChipText,
                activeCategory === 'all' && styles.catChipTextActive,
              ]}
            >
              All Moments
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.catChip, isActive && styles.catChipActive]}
              >
                <Text style={[styles.catChipText, isActive && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading beautiful moments...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="image-outline" size={54} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Moments Found</Text>
          <Text style={styles.emptySubtitle}>
            Check back soon for new celebration photos and customer stories!
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              colors={[colors.primary]}
            />
          }
        >
          {/* Subtitle Banner */}
          {/* Subtitle Banner */}
          <View style={styles.subBanner}>
            <Text style={styles.subBannerTitle}>
              {settings?.title || 'Real Celebrations by Giftcart Customers ✨'}
            </Text>
            <Text style={styles.subBannerSubtitle}>
              {settings?.subtitle || 'Tap any photo to read the story or order the featured bouquet & cake.'}
            </Text>
          </View>

          {/* DYNAMIC MULTI-LAYOUT RENDERING */}
          {layoutMode === 'masonry' && (
            <View style={styles.columnsWrapper}>
              <View style={styles.column}>{col1.map((it) => renderMasonryCard(it, false))}</View>
              <View style={styles.column}>{col2.map((it) => renderMasonryCard(it, true))}</View>
            </View>
          )}

          {layoutMode === 'grid' && (
            <View style={styles.gridWrapper}>
              {items.map((it) => renderGridCard(it))}
            </View>
          )}

          {layoutMode === 'feed' && (
            <View style={styles.feedWrapper}>
              {items.map((it) => renderFeedCard(it))}
            </View>
          )}

          {layoutMode === 'carousel' && (
            <View style={styles.carouselContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={width * 0.82 + 14}
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContent}
              >
                {items.map((it, idx) => renderCarouselCard(it, idx))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Lightbox / Detail Modal */}
      {selectedItem && (
        <Modal
          visible={Boolean(selectedItem)}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {/* Modal Image Header */}
              <View style={styles.modalImageWrap}>
                <Image
                  source={{ uri: selectedItem.image }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />

                <TouchableOpacity
                  onPress={() => setSelectedItem(null)}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.modalCategoryBadge}>
                  <Text style={styles.modalCategoryText}>
                    {selectedItem.category || 'Celebration'}
                  </Text>
                </View>
              </View>

              {/* Modal Info Body */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <TouchableOpacity
                    onPress={() => handleLike(selectedItem._id, selectedItem.likes)}
                    style={styles.modalLikeBtn}
                  >
                    <Ionicons
                      name={likedMap[selectedItem._id] ? 'heart' : 'heart-outline'}
                      size={20}
                      color={likedMap[selectedItem._id] ? '#FF3B30' : colors.textMuted}
                    />
                    <Text style={styles.modalLikeText}>{selectedItem.likes || 0}</Text>
                  </TouchableOpacity>
                </View>

                {selectedItem.caption ? (
                  <Text style={styles.modalCaption}>{selectedItem.caption}</Text>
                ) : null}

                {/* Hashtags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <View style={styles.modalTagsRow}>
                    {selectedItem.tags.map((tag, i) => (
                      <View key={i} style={styles.modalTagChip}>
                        <Text style={styles.modalTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Linked Product Bar (Shop Look) */}
                {selectedItem.linkedProduct && (
                  <View style={styles.linkedProductCard}>
                    <Image
                      source={{ uri: selectedItem.linkedProduct.image }}
                      style={styles.linkedProductImage}
                      resizeMode="cover"
                    />
                    <View style={styles.linkedProductInfo}>
                      <Text style={styles.linkedProductLabel}>FEATURED IN THIS MOMENT</Text>
                      <Text style={styles.linkedProductName} numberOfLines={1}>
                        {selectedItem.linkedProduct.name}
                      </Text>
                      <Text style={styles.linkedProductPrice}>
                        ₹{selectedItem.linkedProduct.price}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleShopLook(selectedItem.linkedProduct)}
                      style={styles.linkedProductBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.linkedProductBtnText}>Order Now</Text>
                      <Ionicons name="arrow-forward" size={13} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTag: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 2,
  },
  headerTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D82B76',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textBerry,
  },
  categoryScrollWrap: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  catChipActive: {
    backgroundColor: colors.brandBerry,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  catChipTextActive: {
    color: '#FFF',
  },
  scrollContent: {
    padding: 14,
  },
  subBanner: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  subBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 3,
  },
  subBannerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  columnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    ...shadows.sm,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  videoBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(216, 43, 118, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottom: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 16,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  likeCount: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  shopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(116, 19, 67, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  shopPillText: {
    color: '#FFD166',
    fontSize: 10,
    fontWeight: '800',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textBerry,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFF',
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalImageWrap: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: '#000',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCategoryBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modalCategoryText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  modalBody: {
    padding: 18,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
    color: '#1F2937',
  },
  modalLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
  },
  modalLikeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BE123C',
  },
  modalCaption: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 12,
  },
  modalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  modalTagChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modalTagText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  linkedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F8',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 12,
  },
  linkedProductImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  linkedProductInfo: {
    flex: 1,
    marginLeft: 10,
  },
  linkedProductLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  linkedProductName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 1,
  },
  linkedProductPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textBerry,
    marginTop: 2,
  },
  linkedProductBtn: {
    backgroundColor: colors.brandBerry,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  linkedProductBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Layout Switcher Pill
  layoutTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3E8EE',
  },
  layoutPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#741343',
    letterSpacing: 0.5,
  },

  // Layout 2: Square Grid Styles
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
  },
  gridCard: {
    width: (width - 36) / 3,
    height: (width - 36) / 3,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridVideoBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridFeaturedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLikeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gridLikeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },

  // Layout 3: Immersive Feed Styles
  feedWrapper: {
    paddingHorizontal: 16,
    gap: 18,
  },
  feedCard: {
    borderRadius: 24,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.sm,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedAvatarText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
  feedAuthorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  feedCategoryTag: {
    fontSize: 10,
    color: colors.textBerry,
    fontWeight: '700',
  },
  feedFeaturedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  feedFeaturedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#B45309',
  },
  feedMediaContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#111',
    position: 'relative',
  },
  feedMediaImage: {
    width: '100%',
    height: '100%',
  },
  feedVideoOverlay: {
    position: 'absolute',
    top: '44%',
    left: '44%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  feedLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedLikeCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
  },
  feedShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brandBerry,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  feedShopBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  feedCaptionBox: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  feedCaptionTitle: {
    fontWeight: '800',
    color: '#111827',
  },
  feedCaption: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  feedTagsText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },

  // Layout 4: Snap Carousel Styles
  carouselContainer: {
    paddingVertical: 10,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  carouselCard: {
    width: width * 0.82,
    height: 480,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    ...shadows.md,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  carouselTopRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carouselIndexBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  carouselIndexText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  carouselBottomContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
  },
  carouselTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  carouselCaption: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  carouselActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  carouselLikeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  carouselShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  carouselShopText: {
    color: '#741343',
    fontSize: 11,
    fontWeight: '900',
  },
});
