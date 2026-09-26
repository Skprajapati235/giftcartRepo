import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeScreen } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { isValidMobile, isValidOtp } from '../utils/authValidation';
import { colors, shadows } from '../constants/theme';

const RESEND_COOLDOWN_SECONDS = 30;

export default function LoginScreen({ navigation, route }) {
  const { sendOtp, verifyOtp } = useContext(AuthContext);
  const { showToast } = useToast();
  const { bottom, top } = useLayoutInsets();

  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [showNameField, setShowNameField] = useState(false);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const otpInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const goAfterLogin = () => {
    const redirectTo = route?.params?.redirectTo;
    if (redirectTo && redirectTo !== 'Login' && redirectTo !== 'Register') {
      navigation.replace(redirectTo, route?.params?.redirectParams);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Home');
    }
  };

  const requestOtp = async () => {
    if (showNameField && name.trim().length < 2) {
      showToast('Please enter your full name', 'warning');
      return;
    }
    if (!isValidMobile(mobileNumber)) {
      showToast('Enter a valid 10-digit mobile number', 'warning');
      return;
    }

    setSending(true);
    try {
      const response = await sendOtp(showNameField ? name.trim() : '', mobileNumber.trim());

      if (response?.isOldUser) {
        showToast('Welcome back! Logged in successfully 🎉', 'success');
        goAfterLogin();
        return;
      }

      showToast('OTP sent successfully to your mobile 📲', 'success');
      setStep('otp');
      setOtp('');
      setResendIn(RESEND_COOLDOWN_SECONDS);
      setTimeout(() => otpInputRef.current?.focus(), 200);
    } catch (err) {
      if (err?.message === 'Name is required for new users' || err?.message?.includes('Name is required')) {
        showToast('Please enter your name as a new member ✍️', 'info');
        setShowNameField(true);
      } else {
        showToast(err?.message || 'Failed to send OTP', 'error');
      }
    } finally {
      setSending(false);
    }
  };

  const handleResend = () => {
    if (resendIn > 0 || sending) return;
    requestOtp();
  };

  const handleVerify = async () => {
    if (!isValidOtp(otp)) {
      showToast('Enter the 6-digit OTP sent to your phone', 'warning');
      return;
    }

    setVerifying(true);
    try {
      await verifyOtp(mobileNumber.trim(), otp.trim());
      showToast('Login successful! Welcome to GiftFestive 🎉', 'success');
      goAfterLogin();
    } catch (err) {
      showToast(err?.message || 'Invalid OTP. Please try again.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeScreen style={styles.safe} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F6" />

      {/* Top Floating App Bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(top + 8, 20) }]}>
        {navigation.canGoBack() ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backPill}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={20} color="#741343" />
            <Text style={styles.backPillText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}

        <View style={styles.topLogoContainer}>
          <Text style={styles.topLogoEmoji}>🎁</Text>
          <Text style={styles.topLogoText}>GiftFestive</Text>
        </View>

        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 36 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Auth Card — Matching giftfestive-main LoginModal.tsx */}
          <View style={styles.authCard}>
            
            {/* 1. Header with Website Festive Gradient */}
            <LinearGradient
              colors={['#741343', '#D82B76']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardHeader}
            >
              <View style={styles.headerRow}>
                {/* Glowing Icon Box */}
                <View style={styles.iconBox}>
                  {step === 'otp' ? (
                    <Feather name="lock" size={22} color="#FFD166" />
                  ) : (
                    <MaterialCommunityIcons name="gift-open-outline" size={24} color="#FFD166" />
                  )}
                </View>

                <View style={styles.headerTextGroup}>
                  {/* Brand Pill Badge */}
                  <View style={styles.brandPill}>
                    <Text style={styles.brandPillText}>✨ GIFTFESTIVE</Text>
                  </View>

                  <Text style={styles.cardTitle}>
                    {step === 'otp'
                      ? 'Verify OTP'
                      : showNameField
                      ? 'New Member'
                      : 'Welcome Back'}
                  </Text>

                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {step === 'otp'
                      ? `Enter code sent to +91 ${mobileNumber}`
                      : showNameField
                      ? 'Enter your name to complete signup'
                      : 'Login or signup with mobile number'}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* 2. Benefits Strip — Matching giftfestive-main */}
            <View style={styles.benefitsStrip}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>🎁</Text>
                <Text style={styles.benefitText}>Instant Checkout</Text>
              </View>
              <Text style={styles.benefitDot}>•</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>🚚</Text>
                <Text style={styles.benefitText}>Live Orders</Text>
              </View>
              <Text style={styles.benefitDot}>•</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>❤️</Text>
                <Text style={styles.benefitText}>Saved Wishlist</Text>
              </View>
            </View>

            {/* 3. Form Body */}
            <View style={styles.formBody}>
              {step === 'details' ? (
                <>
                  {/* Full Name Input (Revealed if New User) */}
                  {showNameField && (
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>
                        FULL NAME <Text style={styles.requiredStar}>*</Text>
                      </Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          focusedField === 'name' && styles.inputWrapperFocused,
                        ]}
                      >
                        <Feather
                          name="user"
                          size={18}
                          color={focusedField === 'name' ? '#D82B76' : '#94A3B8'}
                          style={styles.fieldIcon}
                        />
                        <TextInput
                          style={styles.inputControl}
                          placeholder="Enter your full name"
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="words"
                          value={name}
                          onChangeText={setName}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                        />
                      </View>
                    </View>
                  )}

                  {/* Mobile Number Input with Attached 🇮🇳 +91 Badge */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>
                      MOBILE NUMBER <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <View
                      style={[
                        styles.compositeInput,
                        focusedField === 'mobile' && styles.compositeInputFocused,
                      ]}
                    >
                      {/* Attached Country Prefix Box */}
                      <View style={styles.prefixContainer}>
                        <Text style={styles.flagEmoji}>🇮🇳</Text>
                        <Text style={styles.prefixText}>+91</Text>
                      </View>

                      {/* Phone Number Input */}
                      <TextInput
                        ref={mobileInputRef}
                        style={styles.compositeTextInput}
                        placeholder="Enter 10-digit number"
                        placeholderTextColor="#94A3B8"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={mobileNumber}
                        onChangeText={(t) => setMobileNumber(t.replace(/\D/g, '').slice(0, 10))}
                        onFocus={() => setFocusedField('mobile')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                    <Text style={styles.fieldHelper}>
                      We'll verify your mobile number with a one-time SMS code
                    </Text>
                  </View>

                  {/* Primary Continue / Send OTP Button */}
                  <TouchableOpacity
                    style={[styles.ctaButton, sending && styles.ctaButtonDisabled]}
                    onPress={requestOtp}
                    disabled={sending}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#741343', '#D82B76']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaGradient}
                    >
                      {sending ? (
                        <View style={styles.ctaLoadingRow}>
                          <ActivityIndicator color="#FFF" size="small" />
                          <Text style={styles.ctaLoadingText}>Sending OTP...</Text>
                        </View>
                      ) : (
                        <View style={styles.ctaContentRow}>
                          <Text style={styles.ctaButtonText}>
                            {showNameField ? 'Send OTP' : 'Continue'}
                          </Text>
                          <Feather name="arrow-right" size={17} color="#FFD166" />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                /* Step 2: OTP Verification */
                <>
                  {/* Change Mobile Number Link */}
                  <TouchableOpacity
                    onPress={() => {
                      setStep('details');
                      setOtp('');
                    }}
                    style={styles.changeMobilePill}
                    activeOpacity={0.7}
                  >
                    <Feather name="arrow-left" size={13} color="#D82B76" />
                    <Text style={styles.changeMobileText}>
                      Change Mobile Number (+91 {mobileNumber})
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.fieldGroup}>
                    <Text style={[styles.fieldLabel, { textAlign: 'center', marginBottom: 12 }]}>
                      ENTER 6-DIGIT OTP <Text style={styles.requiredStar}>*</Text>
                    </Text>

                    {/* Hidden Native TextInput for seamless keyboard handling */}
                    <TextInput
                      ref={otpInputRef}
                      style={styles.hiddenOtpInput}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otp}
                      onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                      onFocus={() => setFocusedField('otp')}
                      onBlur={() => setFocusedField(null)}
                    />

                    {/* 6 Individual Segmented Digits Boxes */}
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => otpInputRef.current?.focus()}
                      style={styles.otpGrid}
                    >
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const digit = otp[idx] || '';
                        const isFocusedCell = focusedField === 'otp' && (otp.length === idx || (idx === 5 && otp.length === 6));
                        const isFilled = digit.length > 0;

                        return (
                          <View
                            key={idx}
                            style={[
                              styles.otpCell,
                              isFilled && styles.otpCellFilled,
                              isFocusedCell && styles.otpCellActive,
                            ]}
                          >
                            <Text style={styles.otpCellDigit}>{digit}</Text>
                          </View>
                        );
                      })}
                    </TouchableOpacity>
                  </View>

                  {/* Verify & Login Button */}
                  <TouchableOpacity
                    style={[styles.ctaButton, (verifying || otp.length < 4) && styles.ctaButtonDisabled]}
                    onPress={handleVerify}
                    disabled={verifying || otp.length < 4}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={['#741343', '#D82B76']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaGradient}
                    >
                      {verifying ? (
                        <View style={styles.ctaLoadingRow}>
                          <ActivityIndicator color="#FFF" size="small" />
                          <Text style={styles.ctaLoadingText}>Verifying...</Text>
                        </View>
                      ) : (
                        <View style={styles.ctaContentRow}>
                          <Ionicons name="checkmark-circle" size={19} color="#FFD166" />
                          <Text style={styles.ctaButtonText}>Verify & Login</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Resend OTP Button */}
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={resendIn > 0 || sending}
                    style={styles.resendContainer}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.resendText, (resendIn > 0 || sending) && styles.resendTextDisabled]}>
                      {resendIn > 0
                        ? `Resend OTP in ${resendIn}s`
                        : 'Did not receive OTP? Resend Now'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* 4. Security Guarantee Note */}
              <View style={styles.securityFooter}>
                <Feather name="shield" size={13} color="#16A34A" />
                <Text style={styles.securityText}>100% Safe & Secure verification</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#FFF8F6',
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAD6C5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    ...shadows.sm,
  },
  backPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#741343',
  },
  topLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topLogoEmoji: {
    fontSize: 18,
  },
  topLogoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#741343',
    letterSpacing: -0.3,
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    justifyContent: 'center',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAD6C5',
    ...shadows.md,
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  brandPill: {
    backgroundColor: '#FFD166',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 4,
  },
  brandPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#741343',
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  cardSubtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 235, 240, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
  benefitsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFAF3',
    borderBottomWidth: 1,
    borderBottomColor: '#EAD6C5',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  benefitEmoji: {
    fontSize: 11,
  },
  benefitText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#741343',
  },
  benefitDot: {
    color: '#D82B76',
    fontSize: 12,
    opacity: 0.6,
  },
  formBody: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#741343',
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  requiredStar: {
    color: '#D82B76',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDFB',
    borderWidth: 1.5,
    borderColor: '#EAD6C5',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperFocused: {
    borderColor: '#D82B76',
    backgroundColor: '#FFFFFF',
    shadowColor: '#D82B76',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldIcon: {
    marginRight: 10,
  },
  inputControl: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    height: '100%',
  },
  compositeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAD6C5',
    borderRadius: 14,
    overflow: 'hidden',
    height: 52,
  },
  compositeInputFocused: {
    borderColor: '#D82B76',
    shadowColor: '#D82B76',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFAF3',
    borderRightWidth: 1.2,
    borderRightColor: '#EAD6C5',
    paddingHorizontal: 12,
    height: '100%',
  },
  flagEmoji: {
    fontSize: 16,
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#741343',
  },
  compositeTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 14,
    height: '100%',
    letterSpacing: 0.6,
  },
  fieldHelper: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    fontWeight: '500',
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
    ...shadows.button,
  },
  ctaButtonDisabled: {
    opacity: 0.55,
  },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  ctaLoadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  changeMobilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F5',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 16,
  },
  changeMobileText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D82B76',
  },
  hiddenOtpInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 4,
  },
  otpCell: {
    flex: 1,
    height: 52,
    borderRadius: 13,
    backgroundColor: '#FFFAF3',
    borderWidth: 1.5,
    borderColor: '#EAD6C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCellFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D82B76',
  },
  otpCellActive: {
    borderColor: '#741343',
    backgroundColor: '#FFF5F8',
    borderWidth: 2,
    shadowColor: '#D82B76',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  otpCellDigit: {
    fontSize: 22,
    fontWeight: '900',
    color: '#741343',
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#D82B76',
  },
  resendTextDisabled: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  securityText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
