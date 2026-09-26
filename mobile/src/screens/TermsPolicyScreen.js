import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

export default function TermsPolicyScreen({ navigation }) {
  const { bottom } = useLayoutInsets();

  return (
    <SafeScreen style={styles.container}>
      <ScreenHeader
        title="Terms & Privacy"
        subtitle="Policies and customer agreement"
        onBack={() => navigation.goBack()}
        border
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom + 30 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.text}>
            Welcome to GiftFestive. By using this app, you agree to follow these terms and conditions.
          </Text>
          <Text style={styles.bullet}>• <Text style={styles.bulletBold}>Use of Service:</Text> GiftFestive is provided for lawful personal and business gifting. Do not use the app for illegal products, fraud, or activities violating local laws.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bulletBold}>Account Security:</Text> Keep your OTP and login credentials private, and notify us immediately if you suspect unauthorized access.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bulletBold}>Orders and Delivery:</Text> All orders are subject to fresh preparation and slot availability. Same-day orders and midnight deliveries follow operational hours.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bulletBold}>Cancellations & Refunds:</Text> Handcrafted and perishable products (such as fresh flowers and custom cakes) cannot be cancelled once preparation begins.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.text}>
            GiftFestive is committed to protecting your privacy and personal data.
          </Text>
          <Text style={styles.bullet}>• <Text style={styles.bulletBold}>Information Collected:</Text> We collect your name, phone number, delivery addresses, and order history to fulfill your gifting requests.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bulletBold}>Data Protection:</Text> All payment and checkout information is processed securely through encrypted gateways.</Text>
          <Text style={styles.bullet}>• <Text style={styles.bulletBold}>Communication:</Text> We use SMS / WhatsApp only for critical order status updates, delivery PINs, and festive offers.</Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.brandBerry,
    marginBottom: 12,
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 10,
  },
  bulletBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
});

