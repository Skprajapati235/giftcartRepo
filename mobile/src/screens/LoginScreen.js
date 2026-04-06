import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Enter email and password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      // handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
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

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
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
    marginBottom: 32,
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
