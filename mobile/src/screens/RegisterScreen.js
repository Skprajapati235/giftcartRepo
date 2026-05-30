import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SafeScreen } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useContext(AuthContext);
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { bottom } = useLayoutInsets();

  const onRegister = async () => {
    if (!name || !email || !password) {
      showToast('Enter name, email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      showToast('Registration successful! Please login.', 'success');
      navigation.replace('Login');
    } catch {
      // error displayed by AuthContext
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
            <Text style={styles.title}>Join Giftora 🌸</Text>
          </View>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>Every gift tells a story of love, care & happiness 🎂</Text>
          </View>
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
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

            <TouchableOpacity style={styles.button} onPress={onRegister} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Register'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Login</Text>
              </TouchableOpacity>
            </View>
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
    padding: 24,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    boxShadow: "0 0 10px #f13687ff"
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ef0f87ff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitleContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#f86eaeff',
    fontSize: 15,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#000',
    marginBottom: 8,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#f13687ff',
    boxShadow: "0 0 10px #f885b7ff"
  },
  button: {
    backgroundColor: '#ff5ea0',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
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
