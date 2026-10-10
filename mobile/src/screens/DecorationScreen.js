import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../components/layout';
import {
  fetchDecorationPackages,
  fetchDecorationSamples,
  createDecorationBooking,
} from '../services/decorationService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  'All',
  'Hotel Room Decor',
  'Birthday Party Setup',
  'Romantic Anniversary',
  'Canopy & Cabana',
  'Marry Me / Proposal',
];

const TIME_SLOTS = [
  '11:00 AM - 1:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
  '8:00 PM - 10:00 PM (Late)',
];

const COLOR_THEMES = ['Red & Gold', 'Rose Gold & White', 'Blue & Silver', 'Black & Gold', 'Pastel Pink'];

export default function DecorationScreen({ navigation }) {
  const [packages, setPackages] = useState([]);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Booking Modal State
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields (Defaults to Faridabad)
  const [venueType, setVenueType] = useState('Hotel Room');
  const [hotelName, setHotelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bookingHolderName, setBookingHolderName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city, setCity] = useState('Faridabad');
  const [setupDate, setSetupDate] = useState('');
  const [setupTimeSlot, setSetupTimeSlot] = useState('4:00 PM - 6:00 PM');
  const [surpriseEntryTime, setSurpriseEntryTime] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [colorTheme, setColorTheme] = useState('Red & Gold');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');

  // Success dialog
  const [successBookingId, setSuccessBookingId] = useState(null);

  useEffect(() => {
    loadData();
    // Default tomorrow's date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSetupDate(d.toISOString().slice(0, 10));
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [pkgs, smpls] = await Promise.all([
      fetchDecorationPackages({ city: 'Faridabad' }),
      fetchDecorationSamples(),
    ]);
    setPackages(pkgs);
    setSamples(smpls);
    setLoading(false);
  };

  const filteredPackages = packages.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const openBookingModal = (pkg) => {
    setSelectedPackage(pkg);
    setBookingModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !venueAddress.trim()) {
      Alert.alert('Required Fields', 'Please enter your name, phone, and hotel/venue address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        packageId: selectedPackage._id,
        venueType,
        hotelName,
        roomNumber,
        bookingHolderName,
        venueAddress,
        city: city || 'Faridabad',
        setupDate,
        setupTimeSlot,
        surpriseEntryTime,
        customMessage,
        colorTheme,
        customerName,
        customerPhone,
        customerWhatsapp: customerWhatsapp || customerPhone,
        paymentMethod: 'COD',
        totalAmount: selectedPackage.salePrice || selectedPackage.price,
      };

      const res = await createDecorationBooking(payload);
      setBookingModalVisible(false);
      setSuccessBookingId(res?.booking?.bookingId || 'DEC-SUCCESS');
    } catch (err) {
      Alert.alert('Booking Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack ? navigation.goBack() : null}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Hotel & Venue Decoration
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            Surprise room setup before your entry
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('DecorationTrack')}
          style={styles.trackHeaderBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="radio" size={13} color="#EC4899" style={{ marginRight: 4 }} />
          <Text style={styles.trackHeaderText}>Track Status</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scrollable View */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Faridabad Pilot City Tag */}
        <View style={styles.cityBanner}>
          <Ionicons name="location" size={14} color="#D82B76" />
          <Text style={styles.cityBannerText}>
            Faridabad Hub • NIT, Sec 15/21, Surajkund & Neharpar Setups
          </Text>
        </View>

        {/* Real Setup Showcase Carousel */}
        {samples.length > 0 && (
          <View style={styles.samplesSection}>
            <View style={styles.samplesHeader}>
              <Text style={styles.samplesTitle}>📸 Real Setups by Local Decorators</Text>
              <Text style={styles.samplesSubtitle}>Actual photos from Faridabad hotel rooms & venues</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {samples.map((s) => (
                <View key={s._id} style={styles.sampleCard}>
                  <Image source={{ uri: s.imageUrl }} style={styles.sampleImg} />
                  <View style={styles.sampleInfo}>
                    <Text style={styles.sampleCardTitle} numberOfLines={1}>
                      {s.title}
                    </Text>
                    <Text style={styles.sampleHotel} numberOfLines={1}>
                      📍 {s.hotelOrLocation || s.city || 'Faridabad'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Filter Pills */}
        <View style={styles.catContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Packages List */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={styles.loadingText}>Loading Faridabad decoration packages...</Text>
          </View>
        ) : filteredPackages.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🎈</Text>
            <Text style={styles.emptyTitle}>No Packages in this Category</Text>
            <Text style={styles.emptySub}>Please choose another category to view setups.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredPackages.map((pkg) => (
              <View key={pkg._id} style={styles.card}>
                <Image
                  source={{
                    uri:
                      pkg.coverImage ||
                      (pkg.images && pkg.images[0]) ||
                      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
                  }}
                  style={styles.cardImage}
                />
                <View style={styles.badgeWrap}>
                  <Text style={styles.badgeText}>{pkg.category}</Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{pkg.title}</Text>
                  <Text style={styles.cardSummary} numberOfLines={2}>
                    {pkg.summary || pkg.description}
                  </Text>

                  {/* Inclusions */}
                  {pkg.inclusions && pkg.inclusions.length > 0 && (
                    <View style={styles.inclusionsBox}>
                      <Text style={styles.incHeader}>Inclusions:</Text>
                      {pkg.inclusions.slice(0, 3).map((item, idx) => (
                        <View key={idx} style={styles.incRow}>
                          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                          <Text style={styles.incText} numberOfLines={1}>
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Price and Action Button */}
                  <View style={styles.priceRow}>
                    <View>
                      <Text style={styles.priceLabel}>Setup Package Price</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={styles.price}>₹{pkg.salePrice || pkg.price}</Text>
                        {pkg.salePrice && pkg.price > pkg.salePrice && (
                          <Text style={styles.mrp}>₹{pkg.price}</Text>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.bookBtn}
                      onPress={() => openBookingModal(pkg)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.bookBtnText}>Book Setup</Text>
                      <Feather name="arrow-right" size={15} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ==================================================== */}
      {/* BOOKING MODAL (VENUE & HOTEL DETAILS FORM) */}
      {/* ==================================================== */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.modalTitle}>Book Venue / Room Decor</Text>
                <Text style={styles.modalSub} numberOfLines={1}>{selectedPackage?.title}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setBookingModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. Venue Type Selector */}
              <Text style={styles.sectionTitle}>1. Select Venue Type</Text>
              <View style={styles.venueRow}>
                {['Hotel Room', 'Home', 'Cafe / Restaurant'].map((vt) => (
                  <TouchableOpacity
                    key={vt}
                    onPress={() => setVenueType(vt)}
                    style={[styles.venuePill, venueType === vt && styles.venuePillActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.venueText, venueType === vt && styles.venueTextActive]}>{vt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 2. Hotel Details (If Hotel) */}
              {venueType === 'Hotel Room' && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Hotel Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Lemon Tree Hotel, Radisson Blu, Oyo Townhouse"
                    placeholderTextColor="#94A3B8"
                    value={hotelName}
                    onChangeText={setHotelName}
                  />

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Room Number *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Room 304"
                        placeholderTextColor="#94A3B8"
                        value={roomNumber}
                        onChangeText={setRoomNumber}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Booking Holder Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Name on hotel ID"
                        placeholderTextColor="#94A3B8"
                        value={bookingHolderName}
                        onChangeText={setBookingHolderName}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Venue Address */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Complete Venue / Hotel Address *</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  multiline
                  placeholder="Street address, landmark, Sector (Faridabad)"
                  placeholderTextColor="#94A3B8"
                  value={venueAddress}
                  onChangeText={setVenueAddress}
                />
              </View>

              {/* City */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>City (Pilot Launch)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#F1F5F9', color: '#64748B' }]}
                  editable={false}
                  value="Faridabad (Haryana)"
                />
              </View>

              {/* 3. Date & Time Selection */}
              <Text style={styles.sectionTitle}>2. Date & Time Slots</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Setup Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-10-15"
                  placeholderTextColor="#94A3B8"
                  value={setupDate}
                  onChangeText={setSetupDate}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Setup Time Slot (Decorator arrives in this window) *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {TIME_SLOTS.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => setSetupTimeSlot(slot)}
                      style={[styles.slotPill, setupTimeSlot === slot && styles.slotPillActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.slotText, setupTimeSlot === slot && styles.slotTextActive]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Surprise Entry Time (When customer enters)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 7:30 PM (Cake cutting time)"
                  placeholderTextColor="#94A3B8"
                  value={surpriseEntryTime}
                  onChangeText={setSurpriseEntryTime}
                />
              </View>

              {/* 4. Customization */}
              <Text style={styles.sectionTitle}>3. Customization & Theme</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Choose Balloon Color Theme</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {COLOR_THEMES.map((theme) => (
                    <TouchableOpacity
                      key={theme}
                      onPress={() => setColorTheme(theme)}
                      style={[styles.slotPill, colorTheme === theme && styles.slotPillActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.slotText, colorTheme === theme && styles.slotTextActive]}>
                        {theme}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Custom Message / Foil Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Happy 25th Priya! or Will You Marry Me?"
                  placeholderTextColor="#94A3B8"
                  value={customMessage}
                  onChangeText={setCustomMessage}
                />
              </View>

              {/* 5. Customer Details */}
              <Text style={styles.sectionTitle}>4. Contact Details for Dispatch</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Your Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#94A3B8"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Calling Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="+91 9876543210"
                  placeholderTextColor="#94A3B8"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>WhatsApp Number</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="+91 9876543210"
                  placeholderTextColor="#94A3B8"
                  value={customerWhatsapp}
                  onChangeText={setCustomerWhatsapp}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmBooking}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    Confirm & Book Decor (₹{selectedPackage?.salePrice || selectedPackage?.price})
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================================================== */}
      {/* SUCCESS CONFIRMATION DIALOG */}
      {/* ==================================================== */}
      <Modal visible={!!successBookingId} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-done" size={36} color="#FFF" />
            </View>
            <Text style={styles.successTitle}>Booking Received!</Text>
            <Text style={styles.successId}>ID: {successBookingId}</Text>
            <Text style={styles.successMsg}>
              Our local Faridabad decoration partner will arrive during your setup slot ({setupTimeSlot}). You will receive live updates on WhatsApp!
            </Text>

            <TouchableOpacity
              style={[styles.successDoneBtn, { backgroundColor: '#EC4899', marginBottom: 10 }]}
              onPress={() => {
                const id = successBookingId;
                setSuccessBookingId(null);
                navigation.navigate('DecorationTrack', { bookingId: id });
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.successDoneText}>Track Live Setup Status 📍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.successDoneBtn, { backgroundColor: '#F1F5F9' }]}
              onPress={() => {
                setSuccessBookingId(null);
                navigation.navigate('Home');
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.successDoneText, { color: '#475569' }]}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  trackHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trackHeaderText: { fontSize: 11, fontWeight: '800', color: '#EC4899' },

  scrollContent: { paddingBottom: 60 },

  cityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FCE7F3',
  },
  cityBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D82B76',
    flex: 1,
  },

  samplesSection: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  samplesHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  samplesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  samplesSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  sampleCard: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sampleImg: {
    width: '100%',
    height: 90,
  },
  sampleInfo: {
    padding: 8,
  },
  sampleCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  sampleHotel: {
    fontSize: 10,
    color: '#D82B76',
    fontWeight: '600',
    marginTop: 2,
  },

  catContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  catPillActive: { backgroundColor: '#EC4899' },
  catText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  catTextActive: { color: '#FFF', fontWeight: '800' },

  centerBox: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 13, color: '#64748B', marginTop: 8 },

  emptyBox: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  emptySub: { fontSize: 12, color: '#94A3B8', marginTop: 4 },

  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 180 },
  badgeWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  cardSummary: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  inclusionsBox: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 4 },
  incHeader: { fontSize: 11, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  incRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  incText: { fontSize: 12, color: '#475569', flex: 1 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceLabel: { fontSize: 11, color: '#94A3B8' },
  price: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  mrp: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through', marginLeft: 6 },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EC4899',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bookBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalSub: { fontSize: 12, color: '#EC4899', fontWeight: '600', marginTop: 2 },
  closeBtn: { padding: 6, borderRadius: 12, backgroundColor: '#F1F5F9' },
  modalBody: { padding: 18, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginTop: 14, marginBottom: 8 },
  venueRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  venuePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  venuePillActive: { borderColor: '#EC4899', backgroundColor: '#FDF2F8' },
  venueText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  venueTextActive: { color: '#EC4899', fontWeight: '700' },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 4 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  slotPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  slotPillActive: { borderColor: '#EC4899', backgroundColor: '#FDF2F8' },
  slotText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  slotTextActive: { color: '#EC4899', fontWeight: '700' },
  confirmBtn: {
    backgroundColor: '#EC4899',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  successCard: { backgroundColor: '#FFF', borderRadius: 28, padding: 24, alignItems: 'center', width: '100%' },
  successIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  successTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  successId: { fontSize: 14, color: '#EC4899', fontWeight: '800', marginVertical: 6 },
  successMsg: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  successDoneBtn: { backgroundColor: '#0F172A', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 16, width: '100%', alignItems: 'center' },
  successDoneText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
});
