import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeScreen } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { isValidMobile, isValidOtp } from '../utils/authValidation';

const RESEND_COOLDOWN_SECONDS = 30;

export default function LoginScreen({ navigation, route }) {
  const { sendOtp, verifyOtp } = useContext(AuthContext);
  const { showToast } = useToast();
  const { bottom } = useLayoutInsets();

  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  // Where to land once OTP verification succeeds — a checkout-triggered
  // login sends the person to their Cart (not straight into Checkout, not
  // Home) so they can review the cart and continue from there. Any other
  // protected screen (Profile, Orders, Wishlist, ...) just goes back to
  // where it was requested from.
  const goAfterLogin = () => {
    const redirectTo = route?.params?.redirectTo;
    if (redirectTo && redirectTo !== 'Checkout' && redirectTo !== 'Login' && redirectTo !== 'Register') {
      navigation.replace(redirectTo, route?.params?.redirectParams);
    } else {
      navigation.replace('Cart');
    }
  };

  const requestOtp = async () => {
    if (name.trim().length < 2) {
      showToast('Enter your name.', 'warning');
      return;
    }
    if (!isValidMobile(mobileNumber)) {
      showToast('Enter a valid 10-digit mobile number.', 'warning');
      return;
    }

    setSending(true);
    try {
      await sendOtp(name.trim(), mobileNumber.trim());
      showToast(`OTP sent to +91 ${mobileNumber.trim()}`, 'success');
      setStep('otp');
      setOtp('');
      setResendIn(RESEND_COOLDOWN_SECONDS);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch {
      // handled in AuthContext
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
      showToast('Enter the OTP sent to your mobile.', 'warning');
      return;
    }

    setVerifying(true);
    try {
      await verifyOtp(mobileNumber.trim(), otp.trim());
      showToast('Welcome! 👋', 'success');
      goAfterLogin();
    } catch {
      // handled in AuthContext
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeScreen style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.box}>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome to Giftora ✨</Text>
          </View>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Let’s make someone smile today 💖</Text>
          </View>

          {step === 'details' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#888"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.mobileRow}>
                  <Text style={styles.mobilePrefix}>+91</Text>
                  <TextInput
                    style={styles.mobileInput}
                    placeholder="98765 43210"
                    placeholderTextColor="#888"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={mobileNumber}
                    onChangeText={(t) => setMobileNumber(t.replace(/\D/g, '').slice(0, 10))}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={requestOtp} disabled={sending}>
                {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => { setStep('details'); setOtp(''); }} style={styles.changeNumberBtn}>
                <Text style={styles.link}>‹ Change number</Text>
              </TouchableOpacity>

              <Text style={styles.otpHint}>We’ve sent a one-time code to +91 {mobileNumber}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>OTP</Text>
                <TextInput
                  ref={otpInputRef}
                  style={[styles.input, styles.otpInput]}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#888"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={verifying}>
                {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResend} disabled={resendIn > 0 || sending} style={styles.forgotButton}>
                <Text style={[styles.link, (resendIn > 0 || sending) && styles.linkDisabled]}>
                  {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 18,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 11,
    boxShadow: "0 0 10px #f13687ff"
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ef0f87ff',
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#f86eaeff',
    fontSize: 13,
    marginBottom: 22,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: '#000',
    marginBottom: 5,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    color: '#000',
    borderWidth: 1,
    borderColor: '#f13687ff',
    boxShadow: "0 0 10px #f885b7ff"
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f13687ff',
    paddingHorizontal: 12,
    boxShadow: "0 0 10px #f885b7ff"
  },
  mobilePrefix: {
    color: '#000',
    fontWeight: '700',
    marginRight: 6,
  },
  mobileInput: {
    flex: 1,
    paddingVertical: 11,
    color: '#000',
  },
  otpInput: {
    letterSpacing: 4,
    fontWeight: '800',
    textAlign: 'center',
  },
  otpHint: {
    color: '#555',
    fontSize: 13,
    marginBottom: 16,
  },
  changeNumberBtn: {
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ff5ea0',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  forgotButton: { alignItems: 'center', marginTop: 16 },
  link: {
    color: '#ff74c3',
    fontWeight: '700',
  },
  linkDisabled: {
    opacity: 0.5,
  },
});
