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
  Linking,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../../components/layout';
import { trackDecorationBooking } from '../../services/decorationService';

const { width } = Dimensions.get('window');

export default function DecorationTrackScreen({ route, navigation }) {
  const initialId = route?.params?.bookingId || '';
  const [bookingId, setBookingId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (idToSearch) => {
    const id = (idToSearch || bookingId).trim();
    if (!id) {
      setErrorMessage('Please enter your Booking ID (e.g. DEC-261010-4821)');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const data = await trackDecorationBooking(id);
      if (data) {
        setTrackingData(data);
      } else {
        setErrorMessage('Booking not found. Please verify the booking ID.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not fetch booking status.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppSupport = () => {
    const text = encodeURIComponent(
      `Hi GiftCart Support, I need assistance regarding my Decoration Booking #${trackingData?.bookingId || bookingId}`
    );
    Linking.openURL(`https://wa.me/918400787712?text=${text}`).catch(() => {});
  };

  return (
    <SafeScreen style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack ? navigation.goBack() : null}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Track Setup Status</Text>
          <Text style={styles.headerSub}>Live venue decoration telemetry</Text>
        </View>
        <TouchableOpacity onPress={openWhatsAppSupport} style={styles.supportBtn}>
          <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Search Input Box */}
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Enter Booking ID</Text>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. DEC-261010-4821"
              placeholderTextColor="#94A3B8"
              value={bookingId}
              onChangeText={(text) => {
                setBookingId(text);
                setErrorMessage('');
              }}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => handleSearch(bookingId)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.trackBtnText}>Track</Text>
              )}
            </TouchableOpacity>
          </View>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>

        {/* Tracking Details View */}
        {trackingData && (
          <View style={styles.resultContainer}>
            {/* Status Highlight Banner */}
            <View style={styles.statusBanner}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusBadgeText}>{trackingData.statusLabel}</Text>
              </View>
              <Text style={styles.bookingIdText}>#{trackingData.bookingId}</Text>
              <Text style={styles.statusDesc}>{trackingData.statusDescription}</Text>
            </View>

            {/* Visual Step Progress Timeline */}
            <View style={styles.timelineCard}>
              <Text style={styles.cardHeading}>Live Progress Timeline</Text>
              <View style={styles.timelineList}>
                {(trackingData.timeline || []).map((step, idx) => {
                  const isCurrent =
                    trackingData.stepIndex === idx ||
                    (trackingData.status === step.key);
                  return (
                    <View key={step.key} style={styles.timelineRow}>
                      <View style={styles.timelineLeft}>
                        <View
                          style={[
                            styles.stepCircle,
                            step.done && styles.stepCircleDone,
                            isCurrent && styles.stepCircleActive,
                          ]}
                        >
                          {step.done ? (
                            <Ionicons name="checkmark" size={12} color="#FFF" />
                          ) : (
                            <Text style={styles.stepNum}>{idx + 1}</Text>
                          )}
                        </View>
                        {idx < trackingData.timeline.length - 1 && (
                          <View
                            style={[
                              styles.stepLine,
                              step.done && styles.stepLineDone,
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineRight}>
                        <Text
                          style={[
                            styles.stepTitle,
                            step.done && styles.stepTitleDone,
                            isCurrent && styles.stepTitleActive,
                          ]}
                        >
                          {step.label}
                        </Text>
                        <Text style={styles.stepSubtitle}>
                          {step.key === 'Pending' && 'Booking registered on system'}
                          {step.key === 'Confirmed' && 'Slot confirmed with florist hub'}
                          {step.key === 'Decorator Assigned' &&
                            (trackingData.assignedPartnerName
                              ? `Assigned: ${trackingData.assignedPartnerName}`
                              : 'Local decorator scheduled')}
                          {step.key === 'In Setup' && 'Balloons & lights inflating at venue'}
                          {step.key === 'Decorated & Ready' && 'Setup complete & ready for surprise'}
                          {step.key === 'Completed' && 'Delivered with joy'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Venue & Booking Summary Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeading}>Venue & Setup Schedule</Text>

              <View style={styles.infoRow}>
                <Ionicons name="business" size={18} color="#EC4899" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.infoLabel}>Venue Type</Text>
                  <Text style={styles.infoVal}>
                    {trackingData.hotelName
                      ? `Hotel: ${trackingData.hotelName} (Room ${trackingData.roomNumber || 'N/A'})`
                      : trackingData.venueType || 'Venue'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location" size={18} color="#EC4899" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.infoLabel}>Address / Location</Text>
                  <Text style={styles.infoVal}>
                    {trackingData.venueAddress}, {trackingData.city}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={18} color="#EC4899" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.infoLabel}>Date & Time Slot</Text>
                  <Text style={styles.infoVal}>
                    📅 {trackingData.setupDate} • ⏱️ {trackingData.setupTimeSlot}
                  </Text>
                </View>
              </View>

              {trackingData.colorTheme && (
                <View style={styles.infoRow}>
                  <Ionicons name="color-palette" size={18} color="#EC4899" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.infoLabel}>Color Theme & Occasion</Text>
                    <Text style={styles.infoVal}>
                      {trackingData.colorTheme} ({trackingData.occasion})
                    </Text>
                  </View>
                </View>
              )}

              {trackingData.customMessage ? (
                <View style={styles.infoRow}>
                  <Ionicons name="chatbubble-ellipses" size={18} color="#EC4899" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.infoLabel}>Custom Neon/Letter Message</Text>
                    <Text style={styles.infoVal}>"{trackingData.customMessage}"</Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Satisfaction & Support Callout */}
            <View style={styles.supportCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.supportCardTitle}>Need Instant Assistance?</Text>
                <Text style={styles.supportCardSub}>
                  Our Faridabad operation desk is active 24/7 for live changes.
                </Text>
              </View>
              <TouchableOpacity onPress={openWhatsAppSupport} style={styles.supportCardBtn}>
                <Ionicons name="logo-whatsapp" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.supportCardBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 6, borderRadius: 10, backgroundColor: '#F1F5F9' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  supportBtn: { padding: 8, borderRadius: 12, backgroundColor: '#ECFDF5' },
  scrollBody: { padding: 16, paddingBottom: 40 },

  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  searchLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 8 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 13, color: '#0F172A' },
  trackBtn: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 4,
  },
  trackBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  errorText: { color: '#EF4444', fontSize: 11, fontWeight: '600', marginTop: 8, marginLeft: 4 },

  resultContainer: { spaceY: 16 },
  statusBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(236,72,153,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EC4899', marginRight: 6 },
  statusBadgeText: { color: '#F472B6', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  bookingIdText: { fontSize: 20, fontWeight: '900', color: '#FFFFFF', marginBottom: 6 },
  statusDesc: { fontSize: 12, color: '#CBD5E1', lineHeight: 18 },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeading: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
  timelineList: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', minHeight: 48 },
  timelineLeft: { alignItems: 'center', width: 24 },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: '#10B981' },
  stepCircleActive: { backgroundColor: '#EC4899', transform: [{ scale: 1.15 }] },
  stepNum: { fontSize: 9, fontWeight: '800', color: '#64748B' },
  stepLine: { flex: 1, width: 2, backgroundColor: '#E2E8F0', marginVertical: 2 },
  stepLineDone: { backgroundColor: '#10B981' },
  timelineRight: { flex: 1, marginLeft: 12, paddingBottom: 16 },
  stepTitle: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  stepTitleDone: { color: '#0F172A' },
  stepTitleActive: { color: '#EC4899', fontWeight: '800' },
  stepSubtitle: { fontSize: 10, color: '#94A3B8', marginTop: 2 },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
  infoVal: { fontSize: 12, color: '#0F172A', fontWeight: '700', marginTop: 1 },

  supportCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  supportCardTitle: { fontSize: 12, fontWeight: '800', color: '#065F46' },
  supportCardSub: { fontSize: 10, color: '#047857', marginTop: 2 },
  supportCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  supportCardBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
});
