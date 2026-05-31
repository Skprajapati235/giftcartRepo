import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeScreen } from '../components/layout';
import { ScreenHeader } from '../components/layout';

export default function TermsPolicyScreen({ navigation }) {
  return (
    <SafeScreen>
      <ScreenHeader title="Terms & Policy" onBack={() => navigation.goBack()} border />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.text}>
            Welcome to GiftCart. By using this app, you agree to follow these terms and conditions.
          </Text>
          <Text style={styles.bullet}>• Use of Service: GiftCart is provided for lawful personal and business orders. Do not use the app for illegal products, fraud, or any activity that violates local laws.</Text>
          <Text style={styles.bullet}>• Account Security: Keep your account credentials private, and inform us immediately if you suspect unauthorized access.</Text>
          <Text style={styles.bullet}>• Orders and Payments: All orders are subject to product availability and payment verification. Delivery times may vary.</Text>
          <Text style={styles.bullet}>• Cancellations and Refunds: Refunds are handled according to our refund policy and may require order verification.</Text>
          <Text style={styles.bullet}>• Changes to Terms: We may update these terms from time to time. Continued use after changes means you accept them.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.text}>
            GiftCart respects your privacy. This policy explains how we collect, use, and protect your personal information.
          </Text>
          <Text style={styles.bullet}>• Data Collection: We collect information such as name, email, address, order details, and payment status to process orders and improve your experience.</Text>
          <Text style={styles.bullet}>• Data Use: Your data is used to fulfill orders, send updates, personalize the app experience, and provide support.</Text>
          <Text style={styles.bullet}>• Data Protection: We use security practices to protect your information from unauthorized access.</Text>
          <Text style={styles.bullet}>• Third Party Services: We may share necessary order data with payment processors, shipping partners, and analytics providers.</Text>
          <Text style={styles.bullet}>• Your Rights: You can request access, correction, or removal of your personal data by contacting our support team.
          </Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    marginBottom: 8,
    paddingLeft: 5,
  },
});
