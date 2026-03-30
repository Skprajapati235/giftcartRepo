import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Required', 'Enter name, email and password.');
      return;
    }

    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      Alert.alert('Success', 'Registration completed. Please login to continue.');
      navigation.replace('Login');
    } catch {
      // error displayed by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Register and shop with your backend data</Text>

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
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ff8dc3',
    fontSize: 16,
    marginBottom: 30,
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
