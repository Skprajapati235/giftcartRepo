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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen } from '../../components/layout';
import { createDecorationBooking } from '../../services/decorationService';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 1, title: 'Venue', icon: 'business-outline' },
  { id: 2, title: 'Date & Slot', icon: 'calendar-outline' },
  { id: 3, title: 'Theme', icon: 'color-palette-outline' },
  { id: 4, title: 'Review', icon: 'checkmark-circle-outline' },
];

const VENUE_OPTIONS = [
  { type: 'Hotel Room', label: 'Hotel / Resort Room', sub: 'Anniversary, OYO, or luxury suite', icon: 'business' },
  { type: 'Home / Flat', label: 'Home / Apartment', sub: 'Bedroom, living hall, or balcony', icon: 'home' },
  { type: 'Cafe / Restaurant', label: 'Cafe / Dining', sub: 'Private table or celebration cabana', icon: 'restaurant' },
  { type: 'Outdoor / Terrace', label: 'Terrace / Rooftop', sub: 'Open air candle & fairy light setup', icon: 'partly-sunny' },
];

const POPULAR_HOTELS = [
  'Radisson Blu, Sec 20',
  'Lemon Tree Hotel, NIT',
  'Park Plaza, Sec 21',
  'Ginger Hotel, Mathura Rd',
  'OYO Townhouse / Collection O',
  'Courtyard by Marriott',
];

const TIME_SLOTS = [
  '11:00 AM - 1:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
  '8:00 PM - 10:00 PM (Late Setup)',
];

const COLOR_THEMES = [
  { name: 'Red & Gold', preview: '#DC2626', secondary: '#F59E0B', desc: 'Romantic & Anniversary special' },
  { name: 'Rose Gold & White', preview: '#E11D48', secondary: '#FCE7F3', desc: 'Aesthetic chic & Birthday' },
  { name: 'Blue & Silver', preview: '#2563EB', secondary: '#E2E8F0', desc: 'Classy milestone celebration' },
  { name: 'Black & Gold', preview: '#1E293B', secondary: '#FBBF24', desc: 'Luxury midnight vibe' },
  { name: 'Pastel Pink & White', preview: '#F472B6', secondary: '#FFFFFF', desc: 'Gentle surprise aesthetic' },
];

export default function DecorationBookingScreen({ route, navigation }) {
  const pkg = route?.params?.pkg || {
    _id: 'default_package',
    title: 'Surprise Room Decoration',
    price: 1999,
    salePrice: 1699,
    category: 'Hotel Room Decor',
    coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600',
    estimatedSetupTime: '1.5 - 2 Hours',
  };

  const finalPrice = pkg.salePrice || pkg.price;
  const insets = useSafeAreaInsets();

  // Solid safe bottom padding ensuring buttons sit completely above Android on-screen navigation buttons (48dp height)
  const safeBottomPadding = Platform.OS === 'android'
    ? Math.max(insets.bottom, 36) + 12
    : Math.max(insets.bottom, 16) + 10;

  // Step Tracker State
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Payment Selection
  const [paymentType, setPaymentType] = useState('Advance Downpayment');

  // Form Fields
  const [venueType, setVenueType] = useState('Hotel Room');
  const [hotelName, setHotelName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bookingHolderName, setBookingHolderName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city] = useState('Faridabad');

  const [setupDate, setSetupDate] = useState('');
  const [setupTimeSlot, setSetupTimeSlot] = useState('4:00 PM - 6:00 PM');
  const [surpriseEntryTime, setSurpriseEntryTime] = useState('');

  const [colorTheme, setColorTheme] = useState('Red & Gold');
  const [customMessage, setCustomMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Authoritative downpayment calculations (20% advance token, minimum 299, rounded to 50)
  const advanceDownpaymentAmount = Math.max(299, Math.round((finalPrice * 0.2) / 50) * 50);
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

  const HELPLINE_PHONE = '+918400787712';
  const WHATSAPP_NUMBER = '918400787712';

  // Quick dates initialization
  const today = new Date();
  const dTomorrow = new Date(today);
  dTomorrow.setDate(today.getDate() + 1);
  const dAfter = new Date(today);
  dAfter.setDate(today.getDate() + 2);

  const fmtDate = (d) => d.toISOString().slice(0, 10);
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
      if (venueType === 'Hotel Room' && !hotelName.trim()) {
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
      if (!setupTimeSlot) {
        Alert.alert('Time Slot Required', 'Please select a setup time window.');
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

  // Final Submit Handler
  const handleFinalSubmit = async () => {
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
      const payload = {
        packageId: pkg._id,
        venueType,
        hotelName: venueType === 'Hotel Room' ? hotelName : '',
        roomNumber: venueType === 'Hotel Room' ? roomNumber : '',
        bookingHolderName,
        venueAddress,
        city: 'Faridabad',
        setupDate,
        setupTimeSlot,
        surpriseEntryTime,
        colorTheme,
        customMessage,
        specialInstructions,
        customerName,
        customerPhone,
        customerWhatsapp: waNumber,
        paymentMethod: paymentType === 'Full COD' ? 'COD' : 'Online',
        paymentType,
        advanceAmount: amountToPayNow,
        balanceAmount: balanceToPayOnSetup,
        totalAmount: finalPrice,
      };

      const res = await createDecorationBooking(payload);
      const bId = res?.booking?.bookingId || res?.bookingId || `DEC-${Date.now().toString().slice(-6)}`;
      setSuccessData({
        bookingId: bId,
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
        paymentType,
        advanceAmount: amountToPayNow,
        balanceAmount: balanceToPayOnSetup,
        totalAmount: finalPrice,
      });
      setCurrentStep(5);
    } catch (err) {
      Alert.alert('Booking Error', err.message || 'Could not complete booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

              {/* Venue Type Pills */}
              <View style={styles.venueGrid}>
                {VENUE_OPTIONS.map((vt) => {
                  const isSelected = venueType === vt.type;
                  return (
                    <TouchableOpacity
                      key={vt.type}
                      onPress={() => setVenueType(vt.type)}
                      style={[styles.venueCard, isSelected && styles.venueCardSelected]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.venueIconWrap, isSelected && styles.venueIconWrapSelected]}>
                        <Ionicons
                          name={vt.icon}
                          size={22}
                          color={isSelected ? '#FFF' : '#D82B76'}
                        />
                      </View>
                      <View style={{ flex: 1, paddingLeft: 10 }}>
                        <Text style={[styles.venueCardTitle, isSelected && styles.venueCardTitleSelected]}>
                          {vt.label}
                        </Text>
                        <Text style={styles.venueCardSub}>{vt.sub}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#D82B76" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Hotel-Specific Details */}
              {venueType === 'Hotel Room' && (
                <View style={styles.hotelBox}>
                  <Text style={styles.hotelBoxTitle}>Popular Partner Hotels (Quick Tap):</Text>
                  <View style={styles.hotelChipsRow}>
                    {POPULAR_HOTELS.map((h) => {
                      const isHot = hotelName === h;
                      return (
                        <TouchableOpacity
                          key={h}
                          onPress={() => setHotelName(h)}
                          style={[styles.hotelChip, isHot && styles.hotelChipSelected]}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.hotelChipText, isHot && styles.hotelChipTextSelected]}>
                            {h}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

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

              {/* Time Slots */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Setup Arrival Slot (Decorator Work Window) *</Text>
                <View style={styles.slotsCol}>
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = setupTimeSlot === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        onPress={() => setSetupTimeSlot(slot)}
                        style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isSelected ? 'time' : 'time-outline'}
                          size={18}
                          color={isSelected ? '#D82B76' : '#64748B'}
                        />
                        <Text style={[styles.slotCardText, isSelected && styles.slotCardTextSelected]}>
                          {slot}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={18} color="#D82B76" style={{ marginLeft: 'auto' }} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
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

              {/* Color Themes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Choose Balloon Theme *</Text>
                <View style={styles.themeList}>
                  {COLOR_THEMES.map((theme) => {
                    const isSelected = colorTheme === theme.name;
                    return (
                      <TouchableOpacity
                        key={theme.name}
                        onPress={() => setColorTheme(theme.name)}
                        style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                        activeOpacity={0.85}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={[styles.colorDot, { backgroundColor: theme.preview }]} />
                          <View style={[styles.colorDot, { backgroundColor: theme.secondary, borderWidth: 1, borderColor: '#E2E8F0' }]} />
                        </View>
                        <View style={{ flex: 1, paddingLeft: 12 }}>
                          <Text style={[styles.themeCardName, isSelected && styles.themeCardNameSelected]}>
                            {theme.name}
                          </Text>
                          <Text style={styles.themeCardDesc}>{theme.desc}</Text>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color="#D82B76" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

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
                    onPress={() => setPaymentType('Advance Downpayment')}
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
                    onPress={() => setPaymentType('Full Online')}
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
                    onPress={() => setPaymentType('Full COD')}
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
                    ? '20% advance token locks your decorator schedule & venue slot with guaranteed on-time arrival.'
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
              paddingTop: 12,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.bottomBackBtn}
            onPress={handlePrevStep}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color="#475569" />
            <Text style={styles.bottomBackText}>
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>

          {currentStep < 4 ? (
            <TouchableOpacity
              style={styles.bottomNextBtn}
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
                  <Text style={styles.bottomNextText}>
                    {paymentType === 'Advance Downpayment'
                      ? `Pay ₹${advanceDownpaymentAmount} Advance & Lock Slot`
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
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  bottomBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  bottomNextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D82B76',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#D82B76',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomConfirmBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  bottomNextText: {
    fontSize: 13,
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
