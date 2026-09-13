import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeScreen } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { isValidEmail } from '../utils/authValidation';

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useContext(AuthContext);
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { bottom } = useLayoutInsets();

  const onLogin = async () => {
    if (!isValidEmail(email.trim()) || !password) {
      showToast('Enter a valid email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Browsing as a guest never required login — this screen is only
      // reached when the person tried to do something that does
      // (checkout, profile, ...), or opened it directly from the tab bar.
      const redirectTo = route?.params?.redirectTo;
      if (redirectTo) {
        navigation.replace(redirectTo, route?.params?.redirectParams);
      } else {
        navigation.goBack();
      }
    } catch {
      // handled in AuthContext
    } finally {
      setLoading(false);
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="********"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotButton}>
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Create account</Text>
            </TouchableOpacity>
          </View>
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
  forgotButton: { alignItems: 'center', marginTop: 11 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 19,
  },
  footerText: {
    color: '#888',
    marginRight: 8,
  },
  link: {
    color: '#ff74c3',
    fontWeight: '700',
  },
});
