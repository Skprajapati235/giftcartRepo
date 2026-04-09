import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import couponService from '../services/couponService';
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

export default function OffersScreen({ navigation }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await couponService.getActiveCoupons();
      setCoupons(data || []);
    } catch (err) {
      showToast('Could not load offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    // In real app use Clipboard from react-native or expo-clipboard
    showToast(`Code ${code} copied to clipboard!`, 'success');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D82B76" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hot Offers & Coupons</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.promoHeader}>
            <Ionicons name="gift" size={40} color="#D82B76" />
            <Text style={styles.promoMainText}>Exclusive Deals Just for You!</Text>
            <Text style={styles.promoSubText}>Apply these codes at checkout to save big on your favorite gifts.</Text>
        </View>

        {coupons.length > 0 ? coupons.map((item) => (
          <View key={item._id} style={styles.couponCard}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.couponImg} />
            )}
            <View style={styles.couponInfo}>
              <View style={styles.row}>
                <View style={styles.discountBadge}>
                   <Text style={styles.discountText}>
                     {item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `₹${item.discountValue} OFF`}
                   </Text>
                </View>
                <Text style={styles.expiryText}>Exp: {new Date(item.expiryDate).toLocaleDateString()}</Text>
              </View>

              <Text style={styles.minOrderText}>Valid on orders above ₹{item.minOrderAmount}</Text>
              
              <View style={styles.codeContainer}>
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>COUPON CODE</Text>
                  <Text style={styles.codeValue}>{item.code}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard(item.code)}>
                   <Feather name="copy" size={18} color="#FFF" />
                   <Text style={styles.copyBtnText}>COPY</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )) : (
          <View style={styles.emptyBox}>
            <Ionicons name="ticket-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>No active offers at the moment.</Text>
            <Text style={styles.emptySub}>Check back later for fresh deals!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111' },
  scrollContent: { padding: 15, paddingBottom: 40 },
  promoHeader: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  promoMainText: { fontSize: 22, fontWeight: '900', color: '#111', marginTop: 10, textAlign: 'center' },
  promoSubText: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 5, paddingHorizontal: 20 },
  couponCard: {
    backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, overflow: 'hidden',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, borderDivider: 1, borderColor: '#EEE'
  },
  couponImg: { width: '100%', height: 160, resizeMode: 'cover' },
  couponInfo: { padding: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  discountBadge: { backgroundColor: '#FFEEF5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  discountText: { color: '#D82B76', fontSize: 14, fontWeight: '900' },
  expiryText: { fontSize: 11, color: '#999', fontWeight: '700' },
  minOrderText: { fontSize: 13, color: '#444', fontWeight: '600', marginBottom: 20 },
  codeContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', 
    borderRadius: 15, padding: 4, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' 
  },
  codeBox: { flex: 1, paddingLeft: 15 },
  codeLabel: { fontSize: 9, fontWeight: '800', color: '#999', marginBottom: 2 },
  codeValue: { fontSize: 16, fontWeight: '900', color: '#111', letterSpacing: 1 },
  copyBtn: { 
    backgroundColor: '#D82B76', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 
  },
  copyBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#999', marginTop: 20 },
  emptySub: { fontSize: 14, color: '#BBB', marginTop: 5 },
});
