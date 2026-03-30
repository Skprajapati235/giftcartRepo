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
        <Text style={styles.title}>Giftcart</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

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
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#111',
    padding: 24,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ff8dc3',
    fontSize: 18,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1b1b1d',
    borderRadius: 14,
    padding: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2b2b2f',
  },
  button: {
    backgroundColor: '#ff5ea0',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#111',
    fontSize: 16,
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
