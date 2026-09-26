import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import couponService from '../services/couponService';
import { useToast } from '../context/ToastContext';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

export default function OffersScreen({ navigation }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { bottom } = useLayoutInsets();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await couponService.getActiveCoupons({ limit: 100 });
      const list = res?.data || (Array.isArray(res) ? res : []);
      setCoupons(list);
    } catch (err) {
      showToast('Could not load offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    showToast(`Coupon code ${code} copied! 🎉`, 'success');
  };

  if (loading) {
    return (
      <SafeScreen style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brandBerry} />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#741343" />
      <ScreenHeader
        title="Festive Deals & Offers"
        subtitle="Save big on handcrafted cakes, flowers & gifts"
        onBack={() => navigation.goBack()}
        border
        berry
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundWarm }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Festive Hero Card */}
        <View style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <View style={styles.heroTag}>
              <Text style={styles.heroTagText}>SPECIAL SAVINGS</Text>
            </View>
            <Text style={styles.heroTitle}>Exclusive Festive Offers 🎁</Text>
            <Text style={styles.heroSubtitle}>
              Apply these coupon codes at checkout to unlock instant discounts!
            </Text>
          </View>
          <View style={styles.heroIconBox}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={36} color={colors.brandGold} />
          </View>
        </View>

        {coupons.length > 0 ? (
          coupons.map((item) => (
            <View key={item._id} style={styles.couponCard}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.couponImg} />
              )}
              <View style={styles.couponInfo}>
                <View style={styles.row}>
                  <View style={styles.discountBadge}>
                    <Ionicons name="pricetag" size={13} color={colors.brandBerry} />
                    <Text style={styles.discountText}>
                      {item.discountType === 'percentage'
                        ? `${item.discountValue}% OFF`
                        : `₹${item.discountValue} FLAT OFF`}
                    </Text>
                  </View>
                  {item.expiryDate && (
                    <Text style={styles.expiryText}>
                      Exp: {new Date(item.expiryDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                {item.minOrderAmount > 0 && (
                  <Text style={styles.minOrderText}>
                    Valid on orders above <Text style={{ fontWeight: '800', color: '#1E293B' }}>₹{item.minOrderAmount}</Text>
                  </Text>
                )}

                <View style={styles.codeContainer}>
                  <View style={styles.codeBox}>
                    <Text style={styles.codeLabel}>PROMO CODE</Text>
                    <Text style={styles.codeValue}>{item.code}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={() => copyToClipboard(item.code)}
                    activeOpacity={0.85}
                  >
                    <Feather name="copy" size={14} color="#FFF" />
                    <Text style={styles.copyBtnText}>COPY</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <MaterialCommunityIcons name="ticket-outline" size={44} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyText}>No active offers at the moment</Text>
            <Text style={styles.emptySub}>Check back soon for festive sales and flash discounts!</Text>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#741343',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundWarm,
  },
  scrollContent: {
    padding: 16,
  },
  heroBanner: {
    backgroundColor: colors.brandBerry,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: colors.brandBerry,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroTag: {
    backgroundColor: colors.brandGold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.brandBerry,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  heroIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  couponImg: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  couponInfo: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.backgroundRose,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  discountText: {
    color: colors.brandBerry,
    fontSize: 13,
    fontWeight: '900',
  },
  expiryText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  minOrderText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 14,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCream,
    borderRadius: 14,
    padding: 5,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderStyle: 'dashed',
  },
  codeBox: {
    flex: 1,
    paddingLeft: 12,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.brandBerry,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  copyBtn: {
    backgroundColor: colors.brandBerry,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderWarm,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

