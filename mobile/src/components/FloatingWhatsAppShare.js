import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FloatingWhatsAppShare({ navigationRef }) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    title: 'GiftFestive — Premier Cakes & Gifts',
    url: 'https://giftfestive.com',
    screenName: 'Home',
  });

  // Pulse & Scale Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Breathing scale animation
    const scaleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.09,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    // Ripple pulse ring animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    scaleLoop.start();
    pulseLoop.start();

    return () => {
      scaleLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const resolveCurrentPage = () => {
    try {
      const currentRoute = navigationRef?.getCurrentRoute?.();
      const routeName = currentRoute?.name || 'Home';
      const params = currentRoute?.params || {};

      let title = 'GiftFestive — Online Cake & Gift Delivery';
      let url = 'https://giftfestive.com';
      let screenLabel = routeName;

      if (routeName === 'ProductDetail' && params?.product) {
        const p = params.product;
        title = `${p.name || 'Delicious Cake'} on GiftFestive`;
        url = `https://giftfestive.com/product/${p._id || ''}`;
        screenLabel = p.name || 'Product Detail';
      } else if (routeName === 'Collections') {
        title = 'Explore Collections & Categories on GiftFestive';
        url = 'https://giftfestive.com/categories';
        screenLabel = 'Collections';
      } else if (routeName === 'Offers') {
        title = 'Festive Discounts & Coupons on GiftFestive';
        url = 'https://giftfestive.com/offers';
        screenLabel = 'Special Offers';
      } else if (routeName === 'Cart') {
        title = 'GiftCart Shopping Bag';
        url = 'https://giftfestive.com/cart';
        screenLabel = 'Cart';
      } else if (routeName === 'Wishlist') {
        title = 'My Wishlist on GiftFestive';
        url = 'https://giftfestive.com/profile';
        screenLabel = 'Wishlist';
      }

      setPageInfo({ title, url, screenName: screenLabel });
    } catch {
      setPageInfo({
        title: 'GiftFestive — Online Cake & Gift Delivery',
        url: 'https://giftfestive.com',
        screenName: 'Home',
      });
    }
  };

  const handleOpenTools = () => {
    resolveCurrentPage();
    setModalVisible(true);
  };

  const getShareMessage = () => {
    return `Hey! Check this out on GiftFestive:\n*${pageInfo.title}*\n${pageInfo.url}`;
  };

  // 1. Direct WhatsApp Share
  const handleWhatsAppShare = async () => {
    const text = encodeURIComponent(getShareMessage());
    const whatsappUrl = `whatsapp://send?text=${text}`;
    const webFallback = `https://api.whatsapp.com/send?text=${text}`;

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(webFallback);
      }
    } catch {
      await Linking.openURL(webFallback);
    }
    setModalVisible(false);
  };

  // 2. Native System Share Sheet
  const handleNativeShare = async () => {
    try {
      await Share.share({
        title: pageInfo.title,
        message: getShareMessage(),
        url: pageInfo.url,
      });
      setModalVisible(false);
    } catch (err) {
      console.warn('Share error', err);
    }
  };

  // 3. Chat with Support on WhatsApp
  const handleSupportChat = async () => {
    const msg = encodeURIComponent(`Hi GiftFestive! I need assistance with this page: ${pageInfo.url}`);
    const supportUrl = `https://wa.me/918400787712?text=${msg}`;
    try {
      await Linking.openURL(supportUrl);
    } catch (err) {
      console.warn('Chat error', err);
    }
    setModalVisible(false);
  };

  // Calculate bottom offset: sits cleanly above bottom tab bar and screen safe area
  const bottomOffset = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 12) + 75;

  // Don't render floating button over full-screen booking wizards that have bottom action buttons
  const activeRouteName = navigationRef?.isReady?.() ? navigationRef?.getCurrentRoute?.()?.name : null;
  if (activeRouteName === 'DecorationBooking') {
    return null;
  }

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.6, 0.2, 0],
  });

  return (
    <>
      {/* ── Floating WhatsApp Action Button ── */}
      <View
        pointerEvents="box-none"
        style={[styles.floatingContainer, { bottom: bottomOffset }]}
      >
        {/* Animated Ripple Pulse Ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={handleOpenTools}
            activeOpacity={0.85}
            accessibilityLabel="Share this page via WhatsApp"
          >
            {/* WhatsApp Icon */}
            <Ionicons name="logo-whatsapp" size={32} color="#FFFFFF" />

            {/* Share Indicator Badge */}
            <View style={styles.shareBadge}>
              <Feather name="share-2" size={9} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── Share Tools Modal / Action Sheet ── */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Indicator */}
            <View style={styles.dragHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.headerIconBox}>
                  <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Share This Page</Text>
                  <Text style={styles.modalSubtitle}>Instant WhatsApp & Sharing Tools</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                accessibilityLabel="Close share sheet"
              >
                <Feather name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Current Page Preview Box */}
            <View style={styles.previewBox}>
              <View style={styles.previewBadgeRow}>
                <View style={styles.pageBadge}>
                  <Text style={styles.pageBadgeText}>Current Screen</Text>
                </View>
                <Text style={styles.screenNameText}>{pageInfo.screenName}</Text>
              </View>
              <Text style={styles.previewTitle} numberOfLines={2}>
                {pageInfo.title}
              </Text>
              <Text style={styles.previewUrl} numberOfLines={1}>
                {pageInfo.url}
              </Text>
            </View>

            {/* Share Actions */}
            <View style={styles.actionButtonsContainer}>
              {/* 1. Share via WhatsApp */}
              <TouchableOpacity
                style={styles.whatsappActionBtn}
                onPress={handleWhatsAppShare}
                activeOpacity={0.88}
              >
                <View style={styles.actionBtnLeft}>
                  <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
                  <Text style={styles.whatsappActionText}>Share via WhatsApp</Text>
                </View>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* 2. More Share Options (Native Sheet) */}
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={handleNativeShare}
                activeOpacity={0.85}
              >
                <View style={styles.actionBtnLeft}>
                  <Feather name="share" size={20} color="#741343" />
                  <Text style={styles.secondaryActionText}>More Sharing Apps (Instagram, SMS...)</Text>
                </View>
                <Feather name="external-link" size={16} color="#741343" />
              </TouchableOpacity>

              {/* 3. Support Chat */}
              <TouchableOpacity
                style={styles.supportActionBtn}
                onPress={handleSupportChat}
                activeOpacity={0.85}
              >
                <View style={styles.actionBtnLeft}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#059669" />
                  <Text style={styles.supportActionText}>Have questions? Chat on WhatsApp</Text>
                </View>
                <View style={styles.onlineBadge}>
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    right: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366',
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  shareBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#741343',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBox: {
    marginTop: 14,
    backgroundColor: '#FFFAF3',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1D6B8',
  },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pageBadge: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pageBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#741343',
    textTransform: 'uppercase',
  },
  screenNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 18,
    marginBottom: 4,
  },
  previewUrl: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionButtonsContainer: {
    marginTop: 14,
    gap: 10,
  },
  whatsappActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#25D366',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  whatsappActionText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF1F5',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#741343',
  },
  supportActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  supportActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  onlineBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
});
