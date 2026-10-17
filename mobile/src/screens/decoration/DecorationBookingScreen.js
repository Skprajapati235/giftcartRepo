import React, { useState, useEffect, useContext } from 'react';
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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StatusBar,
  BackHandler,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen } from '../../components/layout';
import {
  createDecorationBooking,
  createDecorationPaymentOrder,
  verifyDecorationPayment,
  getDecorationOptions,
} from '../../services/decorationService';
import { AuthContext } from '../../context/AuthContext';
import RazorpayPaymentModal from '../../components/RazorpayPaymentModal';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 1, title: 'Venue', icon: 'business-outline' },
  { id: 2, title: 'Date & Slot', icon: 'calendar-outline' },
  { id: 3, title: 'Theme', icon: 'color-palette-outline' },
  { id: 4, title: 'Review', icon: 'checkmark-circle-outline' },
];

// HH:MM helpers for the "choose my own time" option
const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
};
const fromMinutes = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
const fmt12 = (hhmm) => {
  if (!/^\d{2}:\d{2}$/.test(hhmm || '')) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function DecorationBookingScreen({ route, navigation }) {
  // The package always comes from the catalog screen (real data from the backend) — never a built-in sample.
  const pkg = route?.params?.pkg || null;

  const finalPrice = pkg ? pkg.salePrice || pkg.price : 0;
  const insets = useSafeAreaInsets();

  // Generous safe bottom padding ensuring buttons sit completely above Android on-screen navigation buttons (48-56dp)
  const safeBottomPadding = Platform.OS === 'android'
    ? Math.max(insets.bottom, 48) + 16
    : Math.max(insets.bottom, 16) + 12;

  // Handle Android hardware/system back button:
  // Step 4 -> 3 -> 2 -> 1 -> navigation.goBack()
  useEffect(() => {
    const onBackPress = () => {
      if (currentStep > 1) {
        handlePrevStep();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [currentStep]);

  // Step Tracker State
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Payment Selection
  const [paymentType, setPaymentType] = useState('Advance Downpayment');

  // Form Fields
  // What the customer can choose comes from the backend — the admin manages it.
  const [options, setOptions] = useState(null);
  const [optionsError, setOptionsError] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [venueTypeId, setVenueTypeId] = useState('');
  const [timeSlotId, setTimeSlotId] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customDuration, setCustomDuration] = useState(0);

  const [hotelName, setHotelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bookingHolderName, setBookingHolderName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city] = useState('Faridabad');

  const [setupDate, setSetupDate] = useState('');
  const [surpriseEntryTime, setSurpriseEntryTime] = useState('');

  const [colorTheme, setColorTheme] = useState(pkg?.colorThemes?.[0] || '');
  const [customMessage, setCustomMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Booking needs a login. Online bookings are saved first, then paid right after.
  const { user } = useContext(AuthContext);
  const [payment, setPayment] = useState(null);           // data for the Razorpay modal
  const [pendingBooking, setPendingBooking] = useState(null); // saved booking that still needs its payment

  useEffect(() => {
    if (!user) return;
    setCustomerName((prev) => prev || user.name || '');
    setCustomerPhone((prev) => prev || user.mobileNumber || user.phone || '');
  }, [user]);

  // Once a booking has been saved the payment plan is fixed (changing it would not change that booking).
  const choosePayment = (type) => {
    if (pendingBooking) {
      Alert.alert('Payment plan locked', 'Your booking is already saved. Complete its payment, or cancel it from My Bookings to choose a different plan.');
      return;
    }
    setPaymentType(type);
  };

  // Advance token follows the admin's rule (percent / minimum / rounding); the server recalculates it independently
  const rules = options?.settings;
  const advanceDownpaymentAmount = rules
    ? Math.min(
        finalPrice,
        Math.max(rules.minAdvanceAmount, Math.round((finalPrice * (rules.advancePercent / 100)) / rules.advanceRoundTo) * rules.advanceRoundTo)
      )
    : 0;
  const balanceDueAmount = Math.max(0, finalPrice - advanceDownpaymentAmount);

  const amountToPayNow =
    paymentType === 'Advance Downpayment'
      ? advanceDownpaymentAmount
      : paymentType === 'Full Online'
      ? finalPrice
      : 0;

  const balanceToPayOnSetup =
    paymentType === 'Advance Downpayment'
      ? balanceDueAmount
      : paymentType === 'Full COD'
      ? finalPrice
      : 0;

  const HELPLINE_PHONE = options?.settings?.supportPhone || '+918400787712';
  const WHATSAPP_NUMBER = options?.settings?.supportWhatsapp || '918400787712';

  // Quick dates initialization
  const today = new Date();

  // Local calendar date (toISOString() is UTC and shows the previous day before 5:30 AM in India)
  const fmtDate = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // Options from the backend — fetched again when the date changes so slots show "Fully booked" / "Too soon".
  useEffect(() => {
    let cancelled = false;
    setSlotsLoading(true);
    getDecorationOptions(/^\d{4}-\d{2}-\d{2}$/.test(setupDate) ? setupDate : undefined)
      .then((data) => {
        if (cancelled) return;
        setOptions(data);
        setOptionsError('');
        setVenueTypeId((prev) => (prev && data.venueTypes.some((v) => v._id === prev) ? prev : data.venueTypes[0]?._id || ''));
        setTimeSlotId((prev) => {
          const slot = data.timeSlots.find((t) => t._id === prev);
          return slot && slot.available !== false ? prev : '';
        });
        setColorTheme((prev) => prev || pkg?.colorThemes?.[0] || data.colorThemes[0]?.name || '');
        setCustomDuration((prev) => prev || data.settings.customSlot.defaultDurationMinutes);
      })
      .catch((err) => {
        if (!cancelled) setOptionsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupDate, reloadKey]);

  const selectedVenue = options?.venueTypes.find((v) => v._id === venueTypeId) || null;
  const venueType = selectedVenue?.name || '';
  const selectedSlot = options?.timeSlots.find((t) => t._id === timeSlotId) || null;

  // The customer's own time (only when the admin allows it)
  const customRule = options?.settings.customSlot;
  const customEnd = customStart && customRule ? fromMinutes(toMinutes(customStart) + (customDuration || customRule.defaultDurationMinutes)) : '';
  const customTimeError = (() => {
    if (!useCustomTime || !customRule) return '';
    if (!customStart) return 'Choose your preferred start time.';
    const start = toMinutes(customStart);
    const end = start + (customDuration || customRule.defaultDurationMinutes);
    if (end > toMinutes(customRule.latest)) return `The setup must finish by ${fmt12(customRule.latest)}. Pick an earlier start or a shorter window.`;
    return '';
  })();
  const setupTimeSlot = useCustomTime
    ? customStart && !customTimeError
      ? `${fmt12(customStart)} - ${fmt12(customEnd)} (Custom)`
      : ''
    : selectedSlot?.label || '';

  // Start times offered for a custom slot (hides ones too close to now when booking for today)
  const customStartChoices = (() => {
    if (!customRule) return [];
    const out = [];
    const nowMin = today.getHours() * 60 + today.getMinutes();
    const isToday = setupDate === fmtDate(today);
    for (let m = toMinutes(customRule.earliest); m + customRule.minDurationMinutes <= toMinutes(customRule.latest); m += customRule.stepMinutes) {
      const tooSoon = isToday && m < nowMin + (options?.settings.minLeadHours || 0) * 60;
      out.push({ value: fromMinutes(m), disabled: tooSoon });
    }
    return out;
  })();
  const customDurationChoices = (() => {
    if (!customRule) return [];
    const base = [customRule.minDurationMinutes, customRule.defaultDurationMinutes, customRule.defaultDurationMinutes + 60, customRule.defaultDurationMinutes + 120];
    return Array.from(new Set(base)).filter((d) => d % customRule.stepMinutes === 0).sort((x, y) => x - y);
  })();
  const dTomorrow = new Date(today);
  dTomorrow.setDate(today.getDate() + 1);
  const dAfter = new Date(today);
  dAfter.setDate(today.getDate() + 2);

  const tomorrowStr = fmtDate(dTomorrow);
  const dayAfterStr = fmtDate(dAfter);

  useEffect(() => {
    setSetupDate(tomorrowStr);
  }, []);

  const openWhatsApp = (msg) => {
    const text = encodeURIComponent(msg);
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`);
  };

  const callHelpline = () => {
    Linking.openURL(`tel:${HELPLINE_PHONE}`);
  };

  // Step Navigation & Validation
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!options || !selectedVenue) {
        Alert.alert('Venue Required', 'Please choose where the setup should happen.');
        return;
      }
      if (selectedVenue.askHotelDetails && !hotelName.trim()) {
        Alert.alert('Hotel Name Required', 'Please enter or select the hotel name for the decorator.');
        return;
      }
      if (!venueAddress.trim()) {
        Alert.alert('Address Required', 'Please enter the room number, flat, or street address.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!setupDate.trim()) {
        Alert.alert('Setup Date Required', 'Please choose or enter a setup date.');
        return;
      }
      const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(setupDate.trim());
      const parsed = dateMatch ? new Date(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3])) : null;
      if (!parsed || parsed.getMonth() !== Number(dateMatch[2]) - 1) {
        Alert.alert('Check the date', 'Please enter the date as YYYY-MM-DD, for example 2026-10-18.');
        return;
      }
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (parsed < startOfToday) {
        Alert.alert('Date is in the past', 'Please choose today or a future date for the setup.');
        return;
      }
      if (useCustomTime && customTimeError) {
        Alert.alert('Check your time', customTimeError);
        return;
      }
      if (!setupTimeSlot) {
        Alert.alert('Time Slot Required', 'Please select a setup time window (or choose your own time).');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  // ── Payment (step 2 of an online booking) ─────────────────────────────────
  const showSuccess = (booking) => {
    setPendingBooking(null);
    setPayment(null);
    setSuccessData({
      bookingId: booking.bookingId,
      packageTitle: pkg.title,
      venueType,
      hotelName,
      roomNumber,
      venueAddress,
      setupDate,
      setupTimeSlot,
      surpriseEntryTime,
      colorTheme,
      customMessage,
      customerName,
      customerPhone,
      paymentType: booking.paymentType || paymentType,
      advanceAmount: booking.paymentType === 'Full COD' ? 0 : booking.advanceAmount ?? amountToPayNow,
      balanceAmount: booking.balanceAmount ?? balanceToPayOnSetup,
      totalAmount: booking.totalAmount ?? finalPrice,
    });
    setCurrentStep(5);
  };

  // The amount comes from the server (saved booking); the server verifies the result before confirming.
  const startPayment = async (bookingId) => {
    setSubmitting(true);
    try {
      const order = await createDecorationPaymentOrder(bookingId);
      if (!order?.keyId) {
        throw new Error('Online payment is not available right now. Please try again later or choose Pay on Setup.');
      }
      setPayment({
        bookingId,
        key: order.keyId,
        amount: Math.round(order.amountToCharge * 100),
        orderId: order.razorpayOrderId,
        name: 'GiftFestive Surprise Decor',
        description:
          order.advanceAmount > 0 && order.balanceAmount > 0
            ? `Advance Token (₹${order.advanceAmount}) for ${order.packageTitle}`
            : `Full Online Payment for ${order.packageTitle}`,
        user: {
          name: customerName || user?.name || '',
          email: user?.email || '',
          phone: customerPhone || user?.mobileNumber || user?.phone || '',
        },
      });
    } catch (err) {
      Alert.alert('Payment', err.message || 'Could not start the payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentPendingAlert = (message) => {
    setPayment(null);
    Alert.alert('Payment not completed', message, [
      { text: 'Try again', onPress: () => pendingBooking && startPayment(pendingBooking.bookingId) },
      { text: 'My Bookings', onPress: () => navigation.navigate('MyDecorationBookings') },
    ]);
  };

  const onPaymentSuccess = async (data) => {
    const bookingId = payment?.bookingId || pendingBooking?.bookingId;
    setPayment(null);
    setSubmitting(true);
    try {
      const confirmed = await verifyDecorationPayment({
        bookingId,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
      showSuccess(confirmed);
    } catch (err) {
      // Money may already have left the account. The gateway also informs our server directly, so the
      // booking gets confirmed automatically — the customer must not pay twice.
      Alert.alert(
        'Confirming your payment',
        `${err.message || 'We could not confirm your payment yet.'}\n\nIf money was deducted, please do not pay again — booking ${bookingId} is confirmed automatically within a few minutes. You can check it in My Bookings.`,
        [{ text: 'My Bookings', onPress: () => navigation.navigate('MyDecorationBookings') }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Final Submit Handler
  const handleFinalSubmit = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    // A booking was already saved and only its payment is missing → just pay it (never create a duplicate)
    if (pendingBooking) {
      await startPayment(pendingBooking.bookingId);
      return;
    }

    if (!options || !selectedVenue || !setupTimeSlot) {
      Alert.alert('Almost there', 'Please complete the venue and time slot first.');
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Contact Name', 'Please enter your name for booking dispatch.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      Alert.alert('Valid Phone Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const waNumber = sameAsPhone ? customerPhone : (customerWhatsapp || customerPhone);
      // Prices are only shown on screen; the server recalculates everything from its own catalogue.
      const payload = {
        packageId: pkg._id,
        venueTypeId,
        venueType,
        hotelName: selectedVenue?.askHotelDetails ? hotelName : '',
        roomNumber: selectedVenue?.askHotelDetails ? roomNumber : '',
        bookingHolderName,
        venueAddress,
        city: 'Faridabad',
        setupDate: setupDate.trim(),
        ...(useCustomTime
          ? { customTime: { startTime: customStart, endTime: customEnd } }
          : { timeSlotId, setupTimeSlot }),
        surpriseEntryTime,
        colorTheme,
        customMessage,
        specialInstructions,
        customerName,
        customerPhone,
        customerWhatsapp: waNumber,
        customerEmail: user?.email || '',
        paymentMethod: paymentType === 'Full COD' ? 'COD' : 'Online',
        paymentType,
        totalAmount: finalPrice,
      };

      // 1. Save the booking first, so a payment problem can never lose it
      const res = await createDecorationBooking(payload);
      const booking = res?.booking || res?.data;
      if (!booking?.bookingId) throw new Error('The booking could not be created. Please try again.');

      if (paymentType === 'Full COD') {
        showSuccess(booking);
        return;
      }

      // 2. Online: pay for that booking
      setPendingBooking({ bookingId: booking.bookingId });
      await startPayment(booking.bookingId);
    } catch (err) {
      Alert.alert('Booking Error', err.message || 'Could not complete booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // LOGIN REQUIRED
  // ----------------------------------------------------
  if (!user) {
    return (
      <SafeScreen edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: '#FFF' }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF0F5', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <Ionicons name="lock-closed" size={30} color="#D82B76" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>Login to book your surprise</Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            We verify your mobile number with a quick OTP so your booking, payment and live status stay safe and in one place.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 22, backgroundColor: '#D82B76', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 14 }}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 15 }}>Login with mobile OTP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 14 }} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#64748B', fontWeight: '700' }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  if (!pkg) {
    return (
      <SafeScreen edges={['top', 'left', 'right']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: '#FFF' }}>
          <Text style={{ fontSize: 44 }}>🎈</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 10, textAlign: 'center' }}>Choose a decoration package first</Text>
          <TouchableOpacity
            style={{ marginTop: 18, backgroundColor: '#D82B76', paddingHorizontal: 26, paddingVertical: 13, borderRadius: 14 }}
            onPress={() => navigation.navigate('Decorations')}
          >
            <Text style={{ color: '#FFF', fontWeight: '800' }}>Browse decorations</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  // ----------------------------------------------------
  // STEP 5: SUCCESS / CONFIRMED SCREEN (NO MODALS!)
  // ----------------------------------------------------
  if (currentStep === 5 && successData) {
    const waBookingSlip =
      `🎉 *GIFTFESTIVE DECORATION BOOKING CONFIRMATION*\n\n` +
      `*Booking ID:* ${successData.bookingId}\n` +
      `*Package:* ${successData.packageTitle}\n` +
      `*Setup Date:* ${successData.setupDate}\n` +
      `*Arrival Window:* ${successData.setupTimeSlot}\n` +
      (successData.surpriseEntryTime ? `*Surprise Entry Time:* ${successData.surpriseEntryTime}\n` : '') +
      `*Venue:* ${successData.venueType}${successData.hotelName ? ` - ${successData.hotelName}` : ''}${successData.roomNumber ? ` (Room ${successData.roomNumber})` : ''}\n` +
      `*Address:* ${successData.venueAddress}, Faridabad\n` +
      `*Theme:* ${successData.colorTheme}\n` +
      (successData.customMessage ? `*Foil Text:* "${successData.customMessage}"\n` : '') +
      `*Payment Plan:* ${successData.paymentType}\n` +
      `*Advance Paid:* ₹${successData.advanceAmount}\n` +
      `*Payable on Setup:* ₹${successData.balanceAmount} (Cash or UPI after inspection)\n` +
      `*Total Price:* ₹${successData.totalAmount}\n` +
      `*Client:* ${successData.customerName} (${successData.customerPhone})\n\n` +
      `Please confirm decorator dispatch and keep removable glue dots ready. Thank you!`;

    return (
      <SafeScreen edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.successScroll,
            { paddingBottom: Math.max(80, insets.bottom + (Platform.OS === 'android' ? 50 : 30)) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Big Success Header */}
          <View style={styles.successCard}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-sharp" size={44} color="#FFF" />
            </View>
            <Text style={styles.successHeading}>Booking Confirmed!</Text>
            <Text style={styles.successSub}>
              Our Faridabad decorator team has reserved your setup slot.
            </Text>

            <View style={styles.bookingIdBox}>
              <Text style={styles.bookingIdLabel}>OFFICIAL BOOKING ID</Text>
              <Text style={styles.bookingIdVal}>{successData.bookingId}</Text>
            </View>
          </View>

          {/* Quick Summary Pill Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Setup Overview</Text>

            <View style={styles.summaryItem}>
              <Ionicons name="gift-outline" size={18} color="#D82B76" />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Package</Text>
                <Text style={styles.summaryValue}>{successData.packageTitle}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons name="calendar-outline" size={18} color="#D82B76" />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Scheduled Time</Text>
                <Text style={styles.summaryValue}>
                  {successData.setupDate} • {successData.setupTimeSlot}
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons name="location-outline" size={18} color="#D82B76" />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>
                  {successData.hotelName ? `${successData.hotelName}, ` : ''}
                  {successData.venueAddress}
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons name="card-outline" size={18} color="#D82B76" />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Payment Plan</Text>
                <Text style={styles.summaryValue}>{successData.paymentType}</Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Advance Paid</Text>
                <Text style={[styles.summaryValue, { color: '#059669', fontWeight: '800' }]}>
                  ₹{successData.advanceAmount} {successData.advanceAmount > 0 ? '(Locked & Confirmed)' : '(Zero Advance)'}
                </Text>
              </View>
            </View>

            <View style={styles.summaryItem}>
              <Ionicons name="wallet-outline" size={18} color="#D82B76" />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>Balance Payable on Setup</Text>
                <Text style={[styles.summaryValue, { color: '#DC2626', fontWeight: '800' }]}>
                  ₹{successData.balanceAmount} (Pay after room inspection)
                </Text>
              </View>
            </View>
          </View>

          {/* Wall Protection Guarantee */}
          <View style={styles.damageNotice}>
            <Ionicons name="shield-checkmark" size={24} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={styles.damageNoticeTitle}>100% Zero Wall Damage Guarantee</Text>
              <Text style={styles.damageNoticeDesc}>
                Decorator will use non-marking removable dots only. Perfectly safe for OYO & hotel walls!
              </Text>
            </View>
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.whatsAppSlipBtn}
              onPress={() => openWhatsApp(waBookingSlip)}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={styles.whatsAppSlipText}>Get Booking Slip on WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trackSetupBtn}
              onPress={() => navigation.navigate('DecorationTrack', { bookingId: successData.bookingId })}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate-circle-outline" size={20} color="#D82B76" />
              <Text style={styles.trackSetupText}>Track Decorator Live Status 📍</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.returnHomeBtn}
              onPress={() => navigation.navigate('MyDecorationBookings')}
              activeOpacity={0.85}
            >
              <Text style={styles.returnHomeText}>My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.returnHomeBtn}
              onPress={() => navigation.navigate('Decorations')}
              activeOpacity={0.85}
            >
              <Text style={styles.returnHomeText}>Explore More Packages</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeScreen>
    );
  }

  // ----------------------------------------------------
  // STANDARD STEP-BY-STEP PAGE FLOW
  // ----------------------------------------------------
  return (
    <SafeScreen edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <RazorpayPaymentModal
        visible={!!payment}
        payment={payment}
        onSuccess={onPaymentSuccess}
        onFailed={(msg) => paymentPendingAlert(msg || 'The payment failed. You can try again.')}
        onCancel={() =>
          paymentPendingAlert('Your booking is saved. Finish the payment to confirm it — your slot is held for a short time.')
        }
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={handlePrevStep}
            style={styles.backBtn}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text style={styles.navTitle} numberOfLines={1}>
              Booking {pkg.title}
            </Text>
            <Text style={styles.navSub}>Step {currentStep} of 4 • Faridabad Express</Text>
          </View>
          <TouchableOpacity
            onPress={() => openWhatsApp(`Hi GiftFestive, I need help booking ${pkg.title}`)}
            style={styles.navHelpBtn}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Stepper Wizard Progress Bar */}
        <View style={styles.stepperContainer}>
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <TouchableOpacity
                key={step.id}
                disabled={step.id > currentStep}
                onPress={() => setCurrentStep(step.id)}
                style={styles.stepItem}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.stepCircle,
                    isDone && styles.stepCircleDone,
                    isCurrent && styles.stepCircleCurrent,
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepCircleText,
                        isCurrent && styles.stepCircleTextCurrent,
                      ]}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelCurrent,
                    isDone && styles.stepLabelDone,
                  ]}
                  numberOfLines={1}
                >
                  {step.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(160, 110 + insets.bottom + (Platform.OS === 'android' ? 36 : 16)) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Package Snapshot Banner */}
          <View style={styles.packageBanner}>
            <Image
              source={{ uri: pkg.coverImage || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600' }}
              style={styles.packageBannerImg}
            />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.packageBannerCat}>{pkg.category?.toUpperCase()}</Text>
              <Text style={styles.packageBannerTitle} numberOfLines={1}>{pkg.title}</Text>
              <View style={styles.packageBannerPriceRow}>
                <Text style={styles.packageBannerPrice}>₹{finalPrice}</Text>
                {pkg.salePrice && pkg.price > pkg.salePrice && (
                  <Text style={styles.packageBannerMrp}>₹{pkg.price}</Text>
                )}
                <View style={styles.codBadge}>
                  <Text style={styles.codBadgeText}>Pay on Setup</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ==================================================== */}
          {/* STEP 1: VENUE & HOTEL DETAILS */}
          {/* ==================================================== */}
          {currentStep === 1 && (
            <View style={styles.stepSection}>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionHeading}>Step 1: Where is the setup?</Text>
                <Text style={styles.sectionSub}>Select hotel room, flat, or cafe in Faridabad</Text>
              </View>

              {/* Options still loading / failed (never replaced by dummy data) */}
              {!options && (
                <View style={styles.optionsState}>
                  {optionsError ? (
                    <>
                      <Text style={styles.optionsStateTitle}>We couldn't load the booking options</Text>
                      <Text style={styles.optionsStateSub}>{optionsError}</Text>
                      <TouchableOpacity
                        style={styles.optionsRetryBtn}
                        onPress={() => {
                          setOptionsError('');
                          setReloadKey((k) => k + 1);
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.optionsRetryText}>Try again</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <ActivityIndicator color="#D82B76" />
                  )}
                </View>
              )}

              {/* Venue types (managed by the admin) */}
              <View style={styles.venueGrid}>
                {options?.venueTypes.map((vt) => {
                  const isSelected = venueTypeId === vt._id;
                  return (
                    <TouchableOpacity
                      key={vt._id}
                      onPress={() => setVenueTypeId(vt._id)}
                      style={[styles.venueCard, isSelected && styles.venueCardSelected]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.venueIconWrap, isSelected && styles.venueIconWrapSelected]}>
                        <Text style={{ fontSize: 22 }}>{vt.icon || '📍'}</Text>
                      </View>
                      <View style={{ flex: 1, paddingLeft: 10 }}>
                        <Text style={[styles.venueCardTitle, isSelected && styles.venueCardTitleSelected]}>{vt.name}</Text>
                        {!!vt.description && <Text style={styles.venueCardSub}>{vt.description}</Text>}
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={18} color="#D82B76" />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Hotel-specific details — only for venue types the admin marked "ask hotel details" */}
              {selectedVenue?.askHotelDetails && (
                <View style={styles.hotelBox}>
                  {(options?.settings.popularHotels.length || 0) > 0 && (
                    <>
                      <Text style={styles.hotelBoxTitle}>Popular hotels (quick tap):</Text>
                      <View style={styles.hotelChipsRow}>
                        {options.settings.popularHotels.map((h) => {
                          const isHot = hotelName === h;
                          return (
                            <TouchableOpacity
                              key={h}
                              onPress={() => setHotelName(h)}
                              style={[styles.hotelChip, isHot && styles.hotelChipSelected]}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.hotelChipText, isHot && styles.hotelChipTextSelected]}>{h}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Hotel / Resort Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Radisson Blu, Lemon Tree, OYO 821"
                      placeholderTextColor="#94A3B8"
                      value={hotelName}
                      onChangeText={setHotelName}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.inputLabel}>Room No. (Optional)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. 402"
                        placeholderTextColor="#94A3B8"
                        value={roomNumber}
                        onChangeText={setRoomNumber}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1.3 }]}>
                      <Text style={styles.inputLabel}>Booking Holder Name</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Name on check-in ID"
                        placeholderTextColor="#94A3B8"
                        value={bookingHolderName}
                        onChangeText={setBookingHolderName}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Address Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Complete Venue Address *</Text>
                <TextInput
                  style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Tower / Street, Landmark, Sector (e.g. Sector 15 / NIT Faridabad)"
                  placeholderTextColor="#94A3B8"
                  value={venueAddress}
                  onChangeText={setVenueAddress}
                />
              </View>

              {/* City Badge */}
              <View style={styles.cityBadge}>
                <Ionicons name="location" size={16} color="#D82B76" />
                <Text style={styles.cityBadgeText}>Serving Faridabad & Delhi NCR Hubs</Text>
              </View>
            </View>
          )}

          {/* ==================================================== */}
          {/* STEP 2: DATE & TIME SLOTS */}
          {/* ==================================================== */}
          {currentStep === 2 && (
            <View style={styles.stepSection}>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionHeading}>Step 2: Choose Setup Date & Slot</Text>
                <Text style={styles.sectionSub}>Decorator arrives within this 2-hour window</Text>
              </View>

              {/* Quick Date Chips */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Setup Date *</Text>
                <View style={styles.quickDateRow}>
                  <TouchableOpacity
                    style={[styles.dateChip, setupDate === fmtDate(today) && styles.dateChipSelected]}
                    onPress={() => setSetupDate(fmtDate(today))}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateChipDay, setupDate === fmtDate(today) && styles.dateChipDaySelected]}>Today</Text>
                    <Text style={styles.dateChipDate}>{today.getDate()} {today.toLocaleString('default', { month: 'short' })}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateChip, setupDate === tomorrowStr && styles.dateChipSelected]}
                    onPress={() => setSetupDate(tomorrowStr)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateChipDay, setupDate === tomorrowStr && styles.dateChipDaySelected]}>Tomorrow</Text>
                    <Text style={styles.dateChipDate}>{dTomorrow.getDate()} {dTomorrow.toLocaleString('default', { month: 'short' })}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateChip, setupDate === dayAfterStr && styles.dateChipSelected]}
                    onPress={() => setSetupDate(dayAfterStr)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateChipDay, setupDate === dayAfterStr && styles.dateChipDaySelected]}>In 2 Days</Text>
                    <Text style={styles.dateChipDate}>{dAfter.getDate()} {dAfter.toLocaleString('default', { month: 'short' })}</Text>
                  </TouchableOpacity>
                </View>

                {/* Custom Date Input */}
                <View style={{ marginTop: 10 }}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD (e.g. 2026-10-18)"
                    placeholderTextColor="#94A3B8"
                    value={setupDate}
                    onChangeText={setSetupDate}
                  />
                </View>
              </View>

              {/* Time slots (managed by the admin) + optional custom time */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Setup Arrival Slot (Decorator Work Window) *{slotsLoading ? '  · checking availability…' : ''}
                </Text>
                <View style={styles.slotsCol}>
                  {options?.timeSlots.map((slot) => {
                    const isSelected = !useCustomTime && timeSlotId === slot._id;
                    const unavailable = slot.available === false;
                    return (
                      <TouchableOpacity
                        key={slot._id}
                        disabled={unavailable}
                        onPress={() => {
                          setUseCustomTime(false);
                          setTimeSlotId(slot._id);
                        }}
                        style={[styles.slotCard, isSelected && styles.slotCardSelected, unavailable && { opacity: 0.5 }]}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={isSelected ? 'time' : 'time-outline'} size={18} color={isSelected ? '#D82B76' : '#64748B'} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.slotCardText, isSelected && styles.slotCardTextSelected]}>{slot.label}</Text>
                          {(unavailable || slot.tag || (typeof slot.spotsLeft === 'number' && slot.spotsLeft <= 2)) && (
                            <Text style={[styles.slotSub, unavailable && { color: '#DC2626', fontWeight: '800' }]}>
                              {unavailable
                                ? slot.reason || 'Unavailable'
                                : [slot.tag, typeof slot.spotsLeft === 'number' && slot.spotsLeft <= 2 ? `Only ${slot.spotsLeft} left` : '']
                                    .filter(Boolean)
                                    .join(' • ')}
                            </Text>
                          )}
                        </View>
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color="#D82B76" />}
                      </TouchableOpacity>
                    );
                  })}

                  {options?.settings.allowCustomTimeSlot && (
                    <TouchableOpacity
                      onPress={() => setUseCustomTime(true)}
                      style={[styles.slotCard, styles.slotCardCustom, useCustomTime && styles.slotCardSelected]}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 16 }}>⏰</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.slotCardText, { color: '#741343' }]}>Choose my own time</Text>
                        <Text style={styles.slotSub}>
                          Between {fmt12(options.settings.customSlot.earliest)} and {fmt12(options.settings.customSlot.latest)}
                        </Text>
                      </View>
                      {useCustomTime && <Ionicons name="checkmark-circle" size={18} color="#D82B76" />}
                    </TouchableOpacity>
                  )}
                </View>

                {useCustomTime && options && (
                  <View style={styles.customTimeBox}>
                    <Text style={styles.customTimeLabel}>Decorator arrives from *</Text>
                    <View style={styles.timeChipsWrap}>
                      {customStartChoices.map((c) => {
                        const on = customStart === c.value;
                        return (
                          <TouchableOpacity
                            key={c.value}
                            disabled={c.disabled}
                            onPress={() => setCustomStart(c.value)}
                            style={[styles.timeChip, on && styles.timeChipSelected, c.disabled && { opacity: 0.35 }]}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.timeChipText, on && styles.timeChipTextSelected]}>{fmt12(c.value)}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={[styles.customTimeLabel, { marginTop: 12 }]}>Setup window</Text>
                    <View style={styles.timeChipsWrap}>
                      {customDurationChoices.map((d) => {
                        const on = (customDuration || customRule.defaultDurationMinutes) === d;
                        return (
                          <TouchableOpacity key={d} onPress={() => setCustomDuration(d)} style={[styles.timeChip, on && styles.timeChipSelected]} activeOpacity={0.8}>
                            <Text style={[styles.timeChipText, on && styles.timeChipTextSelected]}>
                              {d % 60 === 0 ? `${d / 60} hr` : `${Math.floor(d / 60)}h ${d % 60}m`}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <Text style={[styles.inputHint, { marginTop: 10 }, !!customStart && !!customTimeError && { color: '#DC2626', fontWeight: '700' }]}>
                      {customStart && customTimeError
                        ? `⚠️ ${customTimeError}`
                        : setupTimeSlot
                        ? `Your window: ${setupTimeSlot}. Our team will confirm it with you on WhatsApp.`
                        : 'Pick a start time. Our team confirms custom times on WhatsApp.'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Surprise Entry Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Surprise Entry Time (When customer/partner enters)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 7:30 PM (Cake cutting time)"
                  placeholderTextColor="#94A3B8"
                  value={surpriseEntryTime}
                  onChangeText={setSurpriseEntryTime}
                />
                <Text style={styles.inputHint}>
                  💡 We ensure the room is completely ready, fairy lights switched on, and petals laid out before this time.
                </Text>
              </View>
            </View>
          )}

          {/* ==================================================== */}
          {/* STEP 3: CUSTOMIZATION & THEME */}
          {/* ==================================================== */}
          {currentStep === 3 && (
            <View style={styles.stepSection}>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionHeading}>Step 3: Personalize Your Setup</Text>
                <Text style={styles.sectionSub}>Choose colors and custom foil balloon messages</Text>
              </View>

              {/* Colour themes: this package's own list, otherwise the admin's global themes */}
              {(() => {
                const themes =
                  pkg.colorThemes && pkg.colorThemes.length > 0
                    ? pkg.colorThemes.map((name) => {
                        const g = options?.colorThemes.find((t) => t.name.toLowerCase() === String(name).toLowerCase());
                        return { name, primary: g?.primaryColor, secondary: g?.secondaryColor, desc: g?.description };
                      })
                    : (options?.colorThemes || []).map((t) => ({ name: t.name, primary: t.primaryColor, secondary: t.secondaryColor, desc: t.description }));
                if (themes.length === 0) return null;
                return (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Choose Balloon Theme</Text>
                    <View style={styles.themeList}>
                      {themes.map((theme) => {
                        const isSelected = colorTheme === theme.name;
                        return (
                          <TouchableOpacity
                            key={theme.name}
                            onPress={() => setColorTheme(theme.name)}
                            style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                            activeOpacity={0.85}
                          >
                            {theme.primary && theme.secondary ? (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <View style={[styles.colorDot, { backgroundColor: theme.primary }]} />
                                <View style={[styles.colorDot, { backgroundColor: theme.secondary, borderWidth: 1, borderColor: '#E2E8F0' }]} />
                              </View>
                            ) : null}
                            <View style={{ flex: 1, paddingLeft: theme.primary ? 12 : 0 }}>
                              <Text style={[styles.themeCardName, isSelected && styles.themeCardNameSelected]}>{theme.name}</Text>
                              {!!theme.desc && <Text style={styles.themeCardDesc}>{theme.desc}</Text>}
                            </View>
                            {isSelected && <Ionicons name="checkmark-circle" size={20} color="#D82B76" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })()}

              {/* Foil Message */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Foil Balloon Name / Text (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. HAPPY 25TH SNEHA or WILL YOU MARRY ME?"
                  placeholderTextColor="#94A3B8"
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  autoCapitalize="characters"
                />
                <Text style={styles.inputHint}>
                  Included in package with shiny golden/rose-gold alphabet balloons.
                </Text>
              </View>

              {/* Special Instructions */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Special Decorator Instructions (Optional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="e.g. Don't ring doorbell, call on arrival, hide flower bouquet inside closet"
                  placeholderTextColor="#94A3B8"
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                />
              </View>
            </View>
          )}

          {/* ==================================================== */}
          {/* STEP 4: CONTACT & FINAL REVIEW */}
          {/* ==================================================== */}
          {currentStep === 4 && (
            <View style={styles.stepSection}>
              <View style={styles.sectionHeadingBox}>
                <Text style={styles.sectionHeading}>Step 4: Contact & Review</Text>
                <Text style={styles.sectionSub}>Decorator will call this number on arrival</Text>
              </View>

              {/* Contact Inputs */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Name of booking contact"
                  placeholderTextColor="#94A3B8"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calling Mobile Number *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>

              {/* WhatsApp Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setSameAsPhone(!sameAsPhone)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={sameAsPhone ? 'checkbox' : 'square-outline'}
                  size={20}
                  color="#D82B76"
                />
                <Text style={styles.checkboxLabel}>Send WhatsApp confirmation to this same number</Text>
              </TouchableOpacity>

              {!sameAsPhone && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>WhatsApp Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="WhatsApp mobile number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={customerWhatsapp}
                    onChangeText={setCustomerWhatsapp}
                  />
                </View>
              )}

              {/* Review Summary Card */}
              <View style={styles.reviewBox}>
                <Text style={styles.reviewBoxTitle}>Booking Summary</Text>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Venue</Text>
                  <Text style={styles.reviewRowVal}>
                    {venueType}{hotelName ? ` (${hotelName})` : ''}
                  </Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Address</Text>
                  <Text style={styles.reviewRowVal} numberOfLines={2}>
                    {venueAddress || 'Faridabad'}
                  </Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Date & Slot</Text>
                  <Text style={styles.reviewRowVal}>{setupDate} ({setupTimeSlot})</Text>
                </View>

                {surpriseEntryTime ? (
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewRowLabel}>Surprise Entry</Text>
                    <Text style={styles.reviewRowVal}>{surpriseEntryTime}</Text>
                  </View>
                ) : null}

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Color Theme</Text>
                  <Text style={styles.reviewRowVal}>{colorTheme}</Text>
                </View>

                {customMessage ? (
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewRowLabel}>Foil Text</Text>
                    <Text style={styles.reviewRowVal}>"{customMessage}"</Text>
                  </View>
                ) : null}

                {/* Payment Option Selection */}
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.inputLabel, { marginBottom: 8 }]}>Select Payment Option *</Text>

                  {/* Option 1: Advance Downpayment (20% Token) */}
                  <TouchableOpacity
                    style={[
                      styles.paymentCard,
                      paymentType === 'Advance Downpayment' && styles.paymentCardSelected,
                    ]}
                    onPress={() => choosePayment('Advance Downpayment')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.paymentCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.paymentBadge}>⭐ Recommended</Text>
                        <Text style={styles.paymentTitle}>Advance Token (20%)</Text>
                      </View>
                      <Text style={styles.paymentAmount}>₹{advanceDownpaymentAmount}</Text>
                    </View>
                    <Text style={styles.paymentDesc}>
                      Pay ₹{advanceDownpaymentAmount} token now to lock slot. Pay remaining ₹{balanceDueAmount} on setup via Cash or UPI after room inspection.
                    </Text>
                  </TouchableOpacity>

                  {/* Option 2: 100% Full Online */}
                  <TouchableOpacity
                    style={[
                      styles.paymentCard,
                      paymentType === 'Full Online' && styles.paymentCardSelected,
                    ]}
                    onPress={() => choosePayment('Full Online')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.paymentCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.paymentBadge, { backgroundColor: '#EDE9FE', color: '#7C3AED' }]}>Fast & Cashless</Text>
                        <Text style={styles.paymentTitle}>Pay 100% Online</Text>
                      </View>
                      <Text style={[styles.paymentAmount, { color: '#7C3AED' }]}>₹{finalPrice}</Text>
                    </View>
                    <Text style={styles.paymentDesc}>
                      Pay full ₹{finalPrice} online now via UPI (GPay, PhonePe, Paytm) or Cards. Completely cashless experience at hotel/venue.
                    </Text>
                  </TouchableOpacity>

                  {/* Option 3: Full COD */}
                  <TouchableOpacity
                    style={[
                      styles.paymentCard,
                      paymentType === 'Full COD' && styles.paymentCardSelected,
                    ]}
                    onPress={() => choosePayment('Full COD')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.paymentCardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.paymentBadge, { backgroundColor: '#D1FAE5', color: '#059669' }]}>Pay on Setup</Text>
                        <Text style={styles.paymentTitle}>Full Cash on Delivery</Text>
                      </View>
                      <Text style={[styles.paymentAmount, { color: '#059669' }]}>₹0</Text>
                    </View>
                    <Text style={styles.paymentDesc}>
                      Zero advance payment today. Pay full ₹{finalPrice} directly to decorator after inspecting completed decoration.
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Price Breakdown */}
                <View style={styles.priceDivider} />

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Setup Package Price</Text>
                  <Text style={styles.reviewRowVal}>₹{finalPrice}</Text>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>Advance Payable Now</Text>
                  <Text style={[styles.reviewRowVal, { color: '#059669', fontWeight: '800' }]}>
                    ₹{amountToPayNow}
                  </Text>
                </View>

                <View style={[styles.reviewRow, { marginTop: 6 }]}>
                  <Text style={styles.totalPriceLabel}>Balance Due on Setup</Text>
                  <Text style={styles.totalPriceVal}>₹{balanceToPayOnSetup}</Text>
                </View>
              </View>

              {/* Zero Advance Guarantee / Slot Lock Note */}
              <View style={styles.codNotice}>
                <Ionicons name="shield-checkmark" size={20} color="#059669" />
                <Text style={styles.codNoticeText}>
                  {paymentType === 'Advance Downpayment'
                    ? `${options?.settings.advancePercent ?? ''}% advance token locks your decorator schedule & venue slot with guaranteed on-time arrival.`
                    : paymentType === 'Full Online'
                    ? '100% cashless payment secured with 256-bit encryption. Zero hassle at venue check-in.'
                    : 'Zero Advance Required. Pay comfortably after inspecting room decoration.'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Floating Action Bar */}
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: safeBottomPadding,
              paddingTop: 14,
            },
          ]}
        >
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.bottomBackBtn}
              onPress={handlePrevStep}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={18} color="#334155" />
              <Text style={styles.bottomBackText}>Back</Text>
            </TouchableOpacity>
          )}

          {currentStep < 4 ? (
            <TouchableOpacity
              style={[
                styles.bottomNextBtn,
                currentStep === 1 && { flex: 1 },
              ]}
              onPress={handleNextStep}
              activeOpacity={0.85}
            >
              <Text style={styles.bottomNextText}>Next: {STEPS[currentStep].title}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.bottomNextBtn, styles.bottomConfirmBtn]}
              onPress={handleFinalSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.bottomNextText} numberOfLines={1}>
                    {paymentType === 'Advance Downpayment'
                      ? `Pay ₹${advanceDownpaymentAmount} Advance & Confirm`
                      : paymentType === 'Full Online'
                      ? `Pay ₹${finalPrice} Online & Confirm`
                      : `Confirm Booking (₹${finalPrice} on Setup)`}
                  </Text>
                  <Ionicons name="checkmark-done" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  optionsState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, gap: 8 },
  optionsStateTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  optionsStateSub: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  optionsRetryBtn: { marginTop: 6, backgroundColor: '#D82B76', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12 },
  optionsRetryText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  slotSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  slotCardCustom: { borderStyle: 'dashed', borderColor: '#D82B76' },
  customTimeBox: { marginTop: 10, backgroundColor: '#FFFAF3', borderRadius: 14, borderWidth: 1, borderColor: '#EAD6C5', padding: 14 },
  customTimeLabel: { fontSize: 12, fontWeight: '800', color: '#334155', marginBottom: 8 },
  timeChipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  timeChipSelected: { backgroundColor: '#D82B76', borderColor: '#D82B76' },
  timeChipText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  timeChipTextSelected: { color: '#FFF' },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Navbar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 58,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  navSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  navHelpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleCurrent: {
    backgroundColor: '#D82B76',
  },
  stepCircleDone: {
    backgroundColor: '#10B981',
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepCircleTextCurrent: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  stepLabelCurrent: {
    color: '#D82B76',
    fontWeight: '800',
  },
  stepLabelDone: {
    color: '#10B981',
  },

  // Banner
  packageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  packageBannerImg: {
    width: 65,
    height: 65,
    borderRadius: 12,
  },
  packageBannerCat: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D82B76',
    letterSpacing: 0.5,
  },
  packageBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 2,
  },
  packageBannerPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packageBannerPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  packageBannerMrp: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  codBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  codBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },

  // Steps common
  stepSection: {
    marginBottom: 20,
  },
  sectionHeadingBox: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  // Venue Types
  venueGrid: {
    gap: 10,
    marginBottom: 16,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  venueCardSelected: {
    borderColor: '#D82B76',
    backgroundColor: '#FFF1F6',
  },
  venueIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueIconWrapSelected: {
    backgroundColor: '#D82B76',
  },
  venueCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  venueCardTitleSelected: {
    color: '#D82B76',
    fontWeight: '800',
  },
  venueCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Hotel Box
  hotelBox: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  hotelBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  hotelChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  hotelChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hotelChipSelected: {
    backgroundColor: '#FCE7F3',
    borderColor: '#D82B76',
  },
  hotelChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  hotelChipTextSelected: {
    color: '#D82B76',
    fontWeight: '700',
  },

  // Input Groups
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  inputHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
    lineHeight: 15,
  },

  // City Badge
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  cityBadgeText: {
    fontSize: 12,
    color: '#9D174D',
    fontWeight: '700',
  },

  // Step 2 Date Chips
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateChip: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dateChipSelected: {
    borderColor: '#D82B76',
    backgroundColor: '#FFF1F6',
  },
  dateChipDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  dateChipDaySelected: {
    color: '#D82B76',
  },
  dateChipDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Slots
  slotsCol: {
    gap: 8,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  slotCardSelected: {
    borderColor: '#D82B76',
    backgroundColor: '#FFF1F6',
  },
  slotCardText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  slotCardTextSelected: {
    color: '#D82B76',
    fontWeight: '800',
  },

  // Step 3 Themes
  themeList: {
    gap: 8,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  themeCardSelected: {
    borderColor: '#D82B76',
    backgroundColor: '#FFF1F6',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  themeCardNameSelected: {
    color: '#D82B76',
    fontWeight: '800',
  },
  themeCardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  // Step 4 Review
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  reviewBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  reviewBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  reviewRowLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  reviewRowVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: '60%',
    textAlign: 'right',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalPriceVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D82B76',
  },
  codNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  codNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
    lineHeight: 16,
  },

  // Payment Option Cards
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  paymentCardSelected: {
    borderColor: '#D82B76',
    backgroundColor: '#FFF1F2',
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentBadge: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#D82B76',
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  paymentDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#D82B76',
  },

  // Bottom Floating Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  bottomBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bottomBackText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#334155',
  },
  bottomNextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D82B76',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#D82B76',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomConfirmBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  bottomNextText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFF',
  },

  // Success Screen Styles
  successScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  successSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  bookingIdBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  bookingIdLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  bookingIdVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D82B76',
    marginTop: 2,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },

  damageNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 20,
  },
  damageNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  damageNoticeDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },

  successActions: {
    gap: 10,
  },
  whatsAppSlipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  whatsAppSlipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  trackSetupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D82B76',
  },
  trackSetupText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D82B76',
  },
  returnHomeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  returnHomeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
