import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeScreen, ScreenHeader } from '../components/layout';

const developerImage = require('../assets/images/gallery5.jpg');

const stats = [
  { label: 'Product', value: 'GiftCart' },
  { label: 'Platform', value: 'Mobile + Admin' },
  { label: 'Goal', value: 'Easy gifting' },
];

const whatsappNumber = '+918400787712';
const emailAddress = 'prajapatisonu7897@gmail.com';

export default function DeveloperScreen({ navigation }) {
  const openWhatsApp = async () => {
    const url = `https://wa.me/918400787712?text=${encodeURIComponent(
      'Hello Sonu, I am interested in GiftCart and want to know more.'
    )}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('Unable to open WhatsApp', error);
    }
  };

  const openEmail = async () => {
    const url = `mailto:${emailAddress}?subject=${encodeURIComponent('GiftCart inquiry')}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('Unable to open email', error);
    }
  };

  return (
    <SafeScreen>
      <ScreenHeader title="Developer" onBack={() => navigation.goBack()} border />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroAccent} />
          <Image source={developerImage} style={styles.heroImage} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Developer</Text>
          </View>
          <Text style={styles.heroTitle}>Sonu Kumar Prajapati</Text>
          <Text style={styles.heroSubtitle}>
            Founder of GiftCart — a complete gift shopping platform built for small businesses, fast city-based discovery, and easy checkout.
          </Text>

          <View style={styles.contactBadges}>
            <TouchableOpacity style={styles.contactBadge} onPress={openWhatsApp}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>{whatsappNumber}</Text>
              <Text style={styles.contactAction}>Tap to message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBadge} onPress={openEmail}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{emailAddress}</Text>
              <Text style={styles.contactAction}>Tap to email</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why GiftCart exists</Text>
          <Text style={styles.aboutText}>
            GiftCart is made to help gift shops and local stores launch a premium shopping experience without building a separate app. It combines a smooth mobile storefront with a strong admin dashboard.
          </Text>
          <Text style={styles.aboutText}>
            Buyers can browse city-based products, save addresses, use coupons, and checkout with Razorpay or COD. Store owners can manage products, cities, coupons, orders, reviews, payments, and customers from one place.
          </Text>
          <Text style={styles.aboutText}>
            The goal is real business readiness: reliable order flow, clean design, easy setup, and fast customer interaction.
          </Text>
        </View>

        <View style={styles.section}> 
          <Text style={styles.sectionTitle}>Key features</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>City-based product browsing with smart filters.</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>Saved addresses, flexible payments, and coupon checkout.</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>Admin panel for inventory, order, coupon, and review management.</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>Mobile and admin in one project for fast launch.</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.contactButtonText}>Back to Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  heroImage: { width: '100%', height: 220, borderRadius: 24, marginBottom: 18 },
  heroAccent: {
    position: 'absolute',
    top: -16,
    right: -16,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8D7FF',
  },
  badge: {
    position: 'absolute',
    top: 22,
    left: 22,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    zIndex: 2,
  },
  badgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 6 },
  heroSubtitle: { fontSize: 14, lineHeight: 22, color: '#4B5563' },
  contactBadges: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactBadge: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F4EEFF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  contactLabel: { fontSize: 11, fontWeight: '700', color: '#7C3AED', textTransform: 'uppercase', marginBottom: 6 },
  contactValue: { fontSize: 14, fontWeight: '800', color: '#111827', lineHeight: 22, marginBottom: 8 },
  contactAction: { fontSize: 12, color: '#6D28D9' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: { fontSize: 15, fontWeight: '800', color: '#111827', textAlign: 'center' },
  statLabel: { marginTop: 6, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 12 },
  bulletList: { marginTop: 4 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bulletPoint: { color: '#7C3AED', fontSize: 16, lineHeight: 22, marginRight: 8, marginTop: 2 },
  bulletText: { flex: 1, color: '#4B5563', fontSize: 14, lineHeight: 22 },
  aboutText: { fontSize: 14, lineHeight: 22, color: '#4B5563', marginBottom: 12 },
  contactButton: { marginTop: 4, backgroundColor: '#7C3AED', borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
  contactButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
