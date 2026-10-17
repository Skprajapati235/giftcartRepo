import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen, ScreenHeader } from '../../components/layout';
import RazorpayPaymentModal from '../../components/RazorpayPaymentModal';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getMyDecorationBookings,
  createDecorationPaymentOrder,
  verifyDecorationPayment,
  cancelMyDecorationBooking,
} from '../../services/decorationService';

const BRAND = '#D82B76';

const STATUS = {
  Pending: { label: 'Awaiting payment', bg: '#FFFBEB', text: '#B45309' },
  Confirmed: { label: 'Confirmed', bg: '#ECFDF5', text: '#047857' },
  'Decorator Assigned': { label: 'Decorator assigned', bg: '#EEF2FF', text: '#4338CA' },
  'In Setup': { label: 'Setup in progress', bg: '#FFF7ED', text: '#C2410C' },
  'Decorated & Ready': { label: 'Ready for surprise', bg: '#F0FDFA', text: '#0F766E' },
  Completed: { label: 'Completed', bg: '#F1F5F9', text: '#475569' },
  Cancelled: { label: 'Cancelled', bg: '#FEF2F2', text: '#B91C1C' },
};
const ACTIVE = ['Pending', 'Confirmed', 'Decorator Assigned', 'In Setup', 'Decorated & Ready'];
const CANCEL_REASONS = ['Plans changed', 'Booked by mistake', 'Need a different date or time', 'Found another option', 'Other'];

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const formatDate = (d) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''));
  if (!m) return d;
  const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export default function MyDecorationBookingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [payment, setPayment] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(async ({ silent = false } = {}) => {
    try {
      const rows = await getMyDecorationBookings();
      if (!alive.current) return;
      setBookings(rows);
      setLoadError('');
    } catch (err) {
      if (!alive.current) return;
      if (!silent) setLoadError(err.message || 'Could not load your bookings.');
    } finally {
      if (alive.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Refresh whenever the screen comes into view, and every 30 s while something is still active.
  const hasActive = useMemo(() => bookings.some((b) => ACTIVE.includes(b.status)), [bookings]);
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return undefined;
      }
      load({ silent: bookings.length > 0 });
      const timer = hasActive ? setInterval(() => load({ silent: true }), 30000) : null;
      return () => timer && clearInterval(timer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, hasActive, load])
  );

  const startPayment = async (booking) => {
    setBusyId(booking.bookingId);
    try {
      const order = await createDecorationPaymentOrder(booking.bookingId);
      if (!order?.keyId) throw new Error('Online payment is not available right now. Please try again later.');
      setPayment({
        bookingId: booking.bookingId,
        key: order.keyId,
        amount: Math.round(order.amountToCharge * 100),
        orderId: order.razorpayOrderId,
        name: 'GiftFestive Surprise Decor',
        description:
          order.advanceAmount > 0 && order.balanceAmount > 0
            ? `Advance Token (₹${order.advanceAmount}) for ${order.packageTitle}`
            : `Full Online Payment for ${order.packageTitle}`,
        user: { name: user?.name || '', email: user?.email || '', phone: user?.mobileNumber || user?.phone || '' },
      });
    } catch (err) {
      Alert.alert('Payment', err.message || 'Could not start the payment.');
      setBusyId(null);
      load({ silent: true });
    }
  };

  const onPaymentSuccess = async (data) => {
    const bookingId = payment?.bookingId;
    setPayment(null);
    try {
      await verifyDecorationPayment({
        bookingId,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
      showToast('Payment received — your booking is confirmed! 🎉', 'success');
    } catch (err) {
      Alert.alert(
        'Confirming your payment',
        `${err.message || 'We could not confirm your payment yet.'}\n\nIf money was deducted, please do not pay again — booking ${bookingId} is confirmed automatically within a few minutes.`
      );
    } finally {
      setBusyId(null);
      load({ silent: true });
    }
  };

  const closePaymentUnpaid = (message) => {
    setPayment(null);
    setBusyId(null);
    showToast(message, 'warning');
    load({ silent: true });
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const reason =
        cancelReason === 'Other'
          ? cancelNote.trim() || 'Other'
          : `${cancelReason}${cancelNote.trim() ? ` — ${cancelNote.trim()}` : ''}`;
      await cancelMyDecorationBooking(cancelTarget.bookingId, reason);
      showToast('Booking cancelled.', 'success');
      setCancelTarget(null);
      setCancelNote('');
      setCancelReason(CANCEL_REASONS[0]);
      await load({ silent: true });
    } catch (err) {
      Alert.alert('Could not cancel', err.message || 'Please try again or contact support.');
    } finally {
      setCancelling(false);
    }
  };

  const openSupport = (b) =>
    Linking.openURL(
      `https://wa.me/${b.supportWhatsapp || '918400787712'}?text=${encodeURIComponent(
        `Hi GiftFestive, I need help with my decoration booking ${b.bookingId}`
      )}`
    ).catch(() => {});

  // ── render ────────────────────────────────────────────────────────────────
  const renderBooking = ({ item: b }) => {
    const st = STATUS[b.status] || { label: b.status, bg: '#F1F5F9', text: '#475569' };
    const busy = busyId === b.bookingId;
    const due =
      b.paymentDueBy && !Number.isNaN(new Date(b.paymentDueBy).getTime())
        ? new Date(b.paymentDueBy).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {b.packageImage ? (
            <Image source={{ uri: b.packageImage }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbEmpty]}>
              <Text style={{ fontSize: 28 }}>🎈</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={styles.chipsRow}>
              <View style={[styles.chip, { backgroundColor: st.bg }]}>
                <Text style={[styles.chipText, { color: st.text }]}>{st.label}</Text>
              </View>
              {b.status !== 'Cancelled' && b.paymentType !== 'Full COD' && !b.canPay && (
                <View style={[styles.chip, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={[styles.chipText, { color: '#047857' }]}>
                    {b.paymentStatus === 'Paid' ? 'Paid in full' : 'Advance paid'}
                  </Text>
                </View>
              )}
              {b.paymentType === 'Full COD' && b.status !== 'Cancelled' && (
                <View style={[styles.chip, { backgroundColor: '#F8FAFC' }]}>
                  <Text style={[styles.chipText, { color: '#475569' }]}>Pay on setup</Text>
                </View>
              )}
            </View>
            <Text style={styles.title} numberOfLines={2}>{b.packageTitle}</Text>
            <Text style={styles.bookingCode}>{b.bookingId}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={15} color={BRAND} />
          <Text style={styles.infoText}>{formatDate(b.setupDate)}</Text>
          <Ionicons name="time-outline" size={15} color={BRAND} style={{ marginLeft: 12 }} />
          <Text style={[styles.infoText, { flex: 1 }]} numberOfLines={1}>{b.setupTimeSlot}</Text>
        </View>
        {b.isCustomTimeSlot && b.status !== 'Cancelled' && b.status !== 'Completed' && (
          <Text style={styles.customNote}>⏰ Custom time — our team will confirm it with you on WhatsApp.</Text>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={15} color={BRAND} />
          <Text style={[styles.infoText, { flex: 1 }]} numberOfLines={2}>
            {b.hotelName ? `${b.hotelName}${b.roomNumber ? ` · Room ${b.roomNumber}` : ''} — ` : ''}
            {b.venueAddress}, {b.city}
          </Text>
        </View>

        <View style={styles.amounts}>
          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>TOTAL</Text>
            <Text style={styles.amountValue}>{inr(b.totalAmount)}</Text>
          </View>
          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>ADVANCE</Text>
            <Text style={styles.amountValue}>{b.paymentType === 'Full COD' ? '—' : inr(b.advanceAmount)}</Text>
          </View>
          <View style={styles.amountCol}>
            <Text style={styles.amountLabel}>ON SETUP</Text>
            <Text style={styles.amountValue}>{inr(b.balanceAmount)}</Text>
          </View>
        </View>

        {!!b.assignedPartnerName && b.status !== 'Cancelled' && (
          <Text style={styles.partner}>🤝 Your decorator: <Text style={{ fontWeight: '800', color: '#0F172A' }}>{b.assignedPartnerName}</Text></Text>
        )}

        {b.status === 'Cancelled' && (
          <View style={styles.cancelledBox}>
            <Text style={styles.cancelledText}>
              {b.cancelledBy === 'system'
                ? 'Released because the payment was not completed in time.'
                : b.cancelledBy === 'customer'
                ? 'You cancelled this booking.'
                : 'This booking was cancelled by our team.'}
              {b.cancelledReason && b.cancelledBy !== 'system' ? ` Reason: ${b.cancelledReason}` : ''}
            </Text>
          </View>
        )}

        {b.canPay && (
          <View style={styles.payBox}>
            <Text style={styles.payText}>
              Pay <Text style={{ fontWeight: '900' }}>{inr(b.payAmount)}</Text> to confirm your setup
              {due ? ` — slot held until ${due}.` : '.'}
            </Text>
            <TouchableOpacity style={styles.payBtn} disabled={busy} onPress={() => startPayment(b)} activeOpacity={0.85}>
              {busy ? <ActivityIndicator color="#FFF" /> : <Text style={styles.payBtnText}>Pay {inr(b.payAmount)}</Text>}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actions}>
          {b.status !== 'Cancelled' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: BRAND }]}
              onPress={() => navigation.navigate('DecorationTrack', { bookingId: b.bookingId })}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate-circle-outline" size={16} color="#FFF" />
              <Text style={[styles.actionText, { color: '#FFF' }]}>Track live</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#16A34A' }]} onPress={() => openSupport(b)} activeOpacity={0.85}>
            <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
            <Text style={[styles.actionText, { color: '#FFF' }]}>Help</Text>
          </TouchableOpacity>
          {b.canCancel && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionOutline]}
              onPress={() => setCancelTarget(b)}
              activeOpacity={0.85}
            >
              <Text style={[styles.actionText, { color: '#DC2626' }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const body = () => {
    if (!user) {
      return (
        <View style={styles.center}>
          <View style={styles.iconCircle}><Ionicons name="lock-closed" size={28} color={BRAND} /></View>
          <Text style={styles.centerTitle}>Login to see your bookings</Text>
          <Text style={styles.centerSub}>Your decoration bookings and payments are tied to your mobile number.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Login with mobile OTP</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      );
    }
    if (loadError) {
      return (
        <View style={styles.center}>
          <Text style={styles.centerTitle}>Something went wrong</Text>
          <Text style={styles.centerSub}>{loadError}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => { setLoading(true); load(); }} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <FlatList
        data={bookings}
        keyExtractor={(b) => b._id}
        renderItem={renderBooking}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load({ silent: true });
            }}
            tintColor={BRAND}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ fontSize: 54 }}>🎈</Text>
            <Text style={styles.centerTitle}>No decoration bookings yet</Text>
            <Text style={styles.centerSub}>Plan a hotel-room surprise, birthday or anniversary setup in a few taps.</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Decorations')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Browse decorations</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <SafeScreen style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScreenHeader title="My Decoration Bookings" onBack={() => navigation.goBack()} border />
      {body()}

      <RazorpayPaymentModal
        visible={!!payment}
        payment={payment}
        onSuccess={onPaymentSuccess}
        onFailed={(msg) => closePaymentUnpaid(msg || 'The payment failed. You can try again.')}
        onCancel={() => closePaymentUnpaid('Payment not completed. Pay before the slot is released to keep your booking.')}
      />

      <Modal visible={!!cancelTarget} transparent animationType="slide" onRequestClose={() => !cancelling && setCancelTarget(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 18 }]}>
            <Text style={styles.modalTitle}>Cancel this booking?</Text>
            <Text style={styles.modalSub} numberOfLines={1}>
              {cancelTarget?.packageTitle} · {cancelTarget?.bookingId}
            </Text>

            <View style={styles.reasonWrap}>
              {CANCEL_REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setCancelReason(r)}
                  style={[styles.reasonChip, cancelReason === r && styles.reasonChipActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.reasonText, cancelReason === r && { color: '#FFF' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.noteInput}
              placeholder="Anything we should know? (optional)"
              placeholderTextColor="#94A3B8"
              value={cancelNote}
              onChangeText={(t) => setCancelNote(t.slice(0, 200))}
              multiline
            />

            <Text style={styles.policy}>
              Online cancellation is available until {cancelTarget?.cancelWindowHours} hours before the setup.{' '}
              {cancelTarget && (cancelTarget.paymentStatus === 'Advance Paid' || cancelTarget.paymentStatus === 'Paid')
                ? 'You have already paid — our team will contact you about the refund as per the cancellation policy.'
                : 'You have not been charged.'}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} disabled={cancelling} onPress={() => setCancelTarget(null)}>
                <Text style={{ fontWeight: '800', color: '#334155' }}>Keep booking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#DC2626' }]} disabled={cancelling} onPress={confirmCancel}>
                {cancelling ? <ActivityIndicator color="#FFF" /> : <Text style={{ fontWeight: '900', color: '#FFF' }}>Yes, cancel</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, minHeight: 320 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  centerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginTop: 10 },
  centerSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 19 },
  primaryBtn: { marginTop: 18, backgroundColor: BRAND, paddingHorizontal: 26, paddingVertical: 13, borderRadius: 14 },
  primaryBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#F1E4D8' },
  cardTop: { flexDirection: 'row', gap: 12 },
  thumb: { width: 66, height: 66, borderRadius: 14, backgroundColor: '#F1F5F9' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F5' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  chipText: { fontSize: 11, fontWeight: '800' },
  title: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 6 },
  bookingCode: { fontSize: 11, fontWeight: '700', color: BRAND, marginTop: 2 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  infoText: { fontSize: 12, color: '#475569', fontWeight: '600' },

  amounts: { flexDirection: 'row', backgroundColor: '#FFFAF3', borderRadius: 14, borderWidth: 1, borderColor: '#EAD6C5', paddingVertical: 10, marginTop: 12 },
  amountCol: { flex: 1, alignItems: 'center' },
  amountLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },
  amountValue: { fontSize: 14, fontWeight: '900', color: '#0F172A', marginTop: 2 },

  partner: { fontSize: 12, color: '#475569', marginTop: 10 },
  customNote: { fontSize: 11, fontWeight: '700', color: '#B45309', backgroundColor: '#FFFBEB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 8 },
  cancelledBox: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 10, marginTop: 10 },
  cancelledText: { fontSize: 12, color: '#B91C1C', lineHeight: 17 },

  payBox: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 14, padding: 12, marginTop: 12, gap: 10 },
  payText: { fontSize: 12, color: '#92400E', fontWeight: '600', lineHeight: 18 },
  payBtn: { backgroundColor: BRAND, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  payBtnText: { color: '#FFF', fontWeight: '900', fontSize: 14 },

  actions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  actionOutline: { borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FFF' },
  actionText: { fontSize: 12, fontWeight: '800' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  modalSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  reasonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  reasonChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F1F5F9' },
  reasonChipActive: { backgroundColor: BRAND },
  reasonText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  noteInput: { marginTop: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, minHeight: 60, fontSize: 13, color: '#0F172A', textAlignVertical: 'top' },
  policy: { fontSize: 11, color: '#64748B', lineHeight: 16, marginTop: 10, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  modalBtnGhost: { backgroundColor: '#F1F5F9' },
});
