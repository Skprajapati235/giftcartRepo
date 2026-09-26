import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import galleryService from '../services/galleryService';
import { colors, shadows } from '../constants/theme';
import { SafeScreen } from '../components/layout';

export default function GalleryScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  // Dynamic responsive widths
  const colWidth = useMemo(() => Math.floor((width - 36) / 2), [width]);
  const gridItemWidth = useMemo(() => Math.floor((width - 36) / 3), [width]);

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

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const [galleryRes, catsRes, settingsRes] = await Promise.all([
          galleryService.getGallery({
            category: activeCategory !== 'all' ? activeCategory : undefined,
            limit: 40,
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
          if (settingsRes.mobileLayout && !isRefresh) {
            setLayoutMode(settingsRes.mobileLayout);
          }
        }
      } catch (err) {
        console.warn('GalleryScreen loadData error:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeCategory]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLike = async (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (likedMap[id]) return;

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

  // Split items for Masonry 2 columns
  const col1 = useMemo(() => items.filter((_, idx) => idx % 2 === 0), [items]);
  const col2 = useMemo(() => items.filter((_, idx) => idx % 2 === 1), [items]);

  // 1. RENDER MASONRY CARD (Pinterest style)
  const renderMasonryCard = (item, isCol2 = false) => {
    const isLiked = Boolean(likedMap[item._id]);
    const cardHeight = isCol2 ? Math.round(colWidth * 1.34) : Math.round(colWidth * 1.15);

    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.9}
        onPress={() => setSelectedItem(item)}
        style={[styles.masonryCard, { width: colWidth, height: cardHeight }]}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
          style={styles.cardGradient}
        />

        {/* Top Badges */}
        <View style={styles.cardTopRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText} numberOfLines={1}>
              {item.category || 'Celebration'}
            </Text>
          </View>

          <View style={styles.topRightIcons}>
            {item.mediaType === 'video' && (
              <View style={styles.videoBadge}>
                <Ionicons name="play" size={10} color="#FFF" />
              </View>
            )}
            {item.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="sparkles" size={9} color="#741343" />
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
                onPress={(e) => handleLike(item._id, e)}
                style={styles.likePill}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={13}
                  color={isLiked ? '#FF3B30' : '#FFF'}
                />
                <Text style={styles.likeCount}>{item.likes || 0}</Text>
              </TouchableOpacity>
            )}

            {settings?.enableShopLook !== false && item.linkedProduct && (
              <View style={styles.shopPill}>
                <Feather name="shopping-bag" size={10} color="#FFD166" />
                <Text style={styles.shopPillText}>Shop</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 2. RENDER SQUARE GRID CARD (Instagram Explore style)
  const renderGridCard = (item) => {
    const isLiked = Boolean(likedMap[item._id]);
    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.88}
        onPress={() => setSelectedItem(item)}
        style={[styles.gridCard, { width: gridItemWidth, height: gridItemWidth }]}
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

  // 3. RENDER REELS / FEED CARD (TikTok / Social Feed style)
  const renderFeedCard = (item) => {
    const isLiked = Boolean(likedMap[item._id]);
    const feedImgHeight = Math.min(Math.round(width - 32), 380);

    return (
      <View key={item._id} style={styles.feedCard}>
        {/* Feed Header */}
        <View style={styles.feedHeader}>
          <View style={styles.feedAuthorRow}>
            <View style={styles.feedAvatar}>
              <Text style={styles.feedAvatarText}>
                {item.title ? item.title.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
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
          style={[styles.feedMediaContainer, { height: feedImgHeight }]}
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
          {settings?.enableLikes !== false && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={(e) => handleLike(item._id, e)}
              style={styles.feedLikeBtn}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? '#FF3B30' : '#1F2937'}
              />
              <Text style={styles.feedLikeCount}>{item.likes || 0} loves</Text>
            </TouchableOpacity>
          )}

          {settings?.enableShopLook !== false && item.linkedProduct && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleShopLook(item.linkedProduct)}
              style={styles.feedShopBtn}
            >
              <Feather name="shopping-bag" size={12} color="#FFF" />
              <Text style={styles.feedShopBtnText}>Shop Item (₹{item.linkedProduct.price})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Caption & Story */}
        <View style={styles.feedCaptionBox}>
          {item.caption ? (
            <Text style={styles.feedCaption}>
              <Text style={styles.feedCaptionTitle}>{item.title} • </Text>
              {item.caption}
            </Text>
          ) : null}

          {item.tags && item.tags.length > 0 && (
            <View style={styles.feedTagsRow}>
              {item.tags.map((tag, i) => (
                <Text key={i} style={styles.feedTagText}>
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  // 4. RENDER SNAP CAROUSEL CARD
  const renderCarouselCard = (item, idx) => {
    const isLiked = Boolean(likedMap[item._id]);
    const cWidth = Math.min(Math.round(width * 0.84), 340);
    const cHeight = Math.min(Math.round(width * 1.15), 450);

    return (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.9}
        onPress={() => setSelectedItem(item)}
        style={[styles.carouselCard, { width: cWidth, height: cHeight }]}
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
                onPress={(e) => handleLike(item._id, e)}
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

      {/* ── Screen Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textBerry} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {settings?.title || 'Moments of Joy 📸'}
          </Text>
          <Text style={styles.headerSubtitle}>Celebration & Delivery Stories</Text>
        </View>

        <TouchableOpacity
          onPress={() => loadData(true)}
          style={styles.refreshBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* ── Category Filter Pills ── */}
      <View style={styles.categoryScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity
            onPress={() => setActiveCategory('all')}
            style={[styles.catChip, activeCategory === 'all' && styles.catChipActive]}
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

      {/* ── Secondary Toolbar (Count + Layout View Selector) ── */}
      <View style={styles.toolbarRow}>
        <Text style={styles.toolbarCountText}>
          {items.length} moments • {layoutMode.toUpperCase()} VIEW
        </Text>

        {/* 4 Interactive Layout Icons */}
        <View style={styles.layoutSegmentedControl}>
          <TouchableOpacity
            onPress={() => setLayoutMode('masonry')}
            style={[
              styles.layoutSegmentBtn,
              layoutMode === 'masonry' && styles.layoutSegmentBtnActive,
            ]}
          >
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={15}
              color={layoutMode === 'masonry' ? '#FFF' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLayoutMode('grid')}
            style={[
              styles.layoutSegmentBtn,
              layoutMode === 'grid' && styles.layoutSegmentBtnActive,
            ]}
          >
            <MaterialCommunityIcons
              name="grid"
              size={15}
              color={layoutMode === 'grid' ? '#FFF' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLayoutMode('feed')}
            style={[
              styles.layoutSegmentBtn,
              layoutMode === 'feed' && styles.layoutSegmentBtnActive,
            ]}
          >
            <MaterialCommunityIcons
              name="view-agenda-outline"
              size={15}
              color={layoutMode === 'feed' ? '#FFF' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLayoutMode('carousel')}
            style={[
              styles.layoutSegmentBtn,
              layoutMode === 'carousel' && styles.layoutSegmentBtnActive,
            ]}
          >
            <MaterialCommunityIcons
              name="view-carousel-outline"
              size={15}
              color={layoutMode === 'carousel' ? '#FFF' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Content Area ── */}
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
                snapToInterval={Math.min(Math.round(width * 0.84), 340) + 14}
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

      {/* ── Lightbox / Detail Modal ── */}
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

              {/* Modal Body */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <TouchableOpacity
                    onPress={() => handleLike(selectedItem._id)}
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
                      <Text style={styles.linkedProductBtnText}>Shop Now</Text>
                      <Feather name="arrow-up-right" size={12} color="#FFF" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category filter scroll
  categoryScrollWrap: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: '#741343',
    borderColor: '#741343',
    ...shadows.sm,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#FFF',
  },

  // Secondary Toolbar Row
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
  },
  toolbarCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  layoutSegmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    padding: 2,
    borderRadius: 12,
    gap: 2,
  },
  layoutSegmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  layoutSegmentBtnActive: {
    backgroundColor: '#741343',
  },

  // Main scroll content
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  // 1. Masonry Styles
  columnsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    gap: 12,
  },
  masonryCard: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    position: 'relative',
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
    maxWidth: '70%',
  },
  categoryBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(216, 43, 118, 0.95)',
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
    textShadowColor: 'rgba(0,0,0,0.7)',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    backgroundColor: 'rgba(116, 19, 67, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  shopPillText: {
    color: '#FFD166',
    fontSize: 10,
    fontWeight: '800',
  },

  // 2. Square Grid Styles
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridCard: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
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
    backgroundColor: 'rgba(0,0,0,0.65)',
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
    bottom: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gridLikeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },

  // 3. Immersive Feed Styles
  feedWrapper: {
    gap: 16,
  },
  feedCard: {
    borderRadius: 24,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    flex: 1,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#741343',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedAvatarText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
  },
  feedAuthorName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  feedCategoryTag: {
    fontSize: 10,
    color: '#D82B76',
    fontWeight: '700',
    marginTop: 1,
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
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  feedMediaImage: {
    width: '100%',
    height: '100%',
  },
  feedVideoOverlay: {
    position: 'absolute',
    top: '42%',
    left: '42%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  feedLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedLikeCount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  feedShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#741343',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
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
  feedCaption: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  feedCaptionTitle: {
    fontWeight: '800',
    color: '#0F172A',
  },
  feedTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  feedTagText: {
    fontSize: 11,
    color: '#741343',
    fontWeight: '700',
  },

  // 4. Snap Carousel Styles
  carouselContainer: {
    paddingVertical: 8,
  },
  carouselContent: {
    gap: 14,
  },
  carouselCard: {
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
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 5,
  },
  carouselCaption: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
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
    backgroundColor: 'rgba(255,255,255,0.25)',
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
    paddingVertical: 7,
    borderRadius: 14,
  },
  carouselShopText: {
    color: '#741343',
    fontSize: 11,
    fontWeight: '900',
  },

  // Modal Lightbox Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFF',
    borderRadius: 28,
    overflow: 'hidden',
  },
  modalImageWrap: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCategoryBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  modalCategoryText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modalBody: {
    padding: 18,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginRight: 10,
  },
  modalLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalLikeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E11D48',
  },
  modalCaption: {
    fontSize: 13,
    color: '#475569',
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  modalTagText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  linkedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F8',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 14,
  },
  linkedProductImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  linkedProductInfo: {
    flex: 1,
    marginLeft: 10,
  },
  linkedProductLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#741343',
    letterSpacing: 0.5,
  },
  linkedProductName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  linkedProductPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D82B76',
    marginTop: 2,
  },
  linkedProductBtn: {
    backgroundColor: '#741343',
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
});
