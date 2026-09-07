import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useToast } from '../context/ToastContext';
import { SafeScreen } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import authService from '../services/authService';
import { isStrongPassword, isValidEmail } from '../utils/authValidation';

export default function ForgotPasswordScreen({ navigation }) {
  const { showToast } = useToast();
  const { bottom } = useLayoutInsets();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isValidEmail(email.trim())) return showToast('Enter a valid email address.', 'warning');
    if (!sent) {
      setLoading(true);
      try {
        await authService.requestPasswordReset(email.trim());
        setSent(true);
        showToast('If an account exists, an OTP was sent to your email.', 'success');
      } catch (error) {
        showToast(error.response?.data?.message || 'Unable to send OTP.', 'error');
      } finally { setLoading(false); }
      return;
    }
    if (!/^\d{6}$/.test(otp)) return showToast('Enter the 6-digit OTP.', 'warning');
    if (!isStrongPassword(newPassword)) return showToast('Password needs 8+ characters, uppercase, lowercase, digit and symbol.', 'warning');
    if (newPassword !== confirmPassword) return showToast('Passwords do not match.', 'warning');
    setLoading(true);
    try {
      await authService.resetPassword(email.trim(), otp, newPassword);
      showToast('Password reset successfully. Please login.', 'success');
      navigation.replace('Login');
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to reset password.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <SafeScreen style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottom + 24 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.box}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>{sent ? 'Enter the OTP sent to your email.' : 'We will email you a one-time password.'}</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#888" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            {sent && <>
              <Text style={styles.label}>OTP</Text>
              <TextInput style={styles.input} placeholder="6-digit OTP" placeholderTextColor="#888" keyboardType="number-pad" maxLength={6} value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, ''))} />
              <Text style={styles.label}>New password</Text>
              <TextInput style={styles.input} placeholder="Strong password" placeholderTextColor="#888" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
              <Text style={styles.label}>Confirm password</Text>
              <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor="#888" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
            </>}
            <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}><Text style={styles.buttonText}>{loading ? 'Please wait...' : sent ? 'Reset Password' : 'Send OTP'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace('Login')}><Text style={styles.link}>Back to login</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' }, inner: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 18, justifyContent: 'center' },
  box: { backgroundColor: '#fff', padding: 18, borderRadius: 14, boxShadow: '0 0 10px #f13687ff' },
  title: { color: '#ef0f87ff', fontSize: 25, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  subtitle: { color: '#f86eaeff', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  label: { color: '#000', marginBottom: 5, marginTop: 9, fontWeight: '700', fontSize: 13 },
  input: { backgroundColor: '#fff', borderRadius: 11, paddingVertical: 11, paddingHorizontal: 12, color: '#000', borderWidth: 1, borderColor: '#f13687ff' },
  button: { backgroundColor: '#ff5ea0', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 14, marginBottom: 14 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' }, link: { color: '#ff74c3', fontWeight: '700', textAlign: 'center', marginTop: 6 },
});