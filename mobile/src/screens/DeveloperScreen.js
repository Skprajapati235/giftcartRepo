import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

const developerImage = require('../assets/images/gallery5.jpg');

const stats = [
  { label: 'Platform', value: 'GiftFestive' },
  { label: 'Experience', value: 'Web + App' },
  { label: 'Specialty', value: 'Festive Gifting' },
];

const whatsappNumber = '+918400787712';
const emailAddress = 'prajapatisonu7897@gmail.com';

export default function DeveloperScreen({ navigation }) {
  const { bottom } = useLayoutInsets();

  const openWhatsApp = async () => {
    const url = `https://wa.me/918400787712?text=${encodeURIComponent(
      'Hello Sonu, I am interested in GiftFestive and want to know more.'
    )}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('Unable to open WhatsApp', error);
    }
  };

  const openEmail = async () => {
    const url = `mailto:${emailAddress}?subject=${encodeURIComponent('GiftFestive inquiry')}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('Unable to open email', error);
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <ScreenHeader
        title="Developer & Platform"
        subtitle="Creator & platform overview"
        onBack={() => navigation.goBack()}
        border
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom + 30 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image source={developerImage} style={styles.heroImage} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Platform Architect</Text>
          </View>
          <Text style={styles.heroTitle}>Sonu Kumar Prajapati</Text>
          <Text style={styles.heroSubtitle}>
            Creator of GiftFestive — a complete festive gifting ecosystem designed for handcrafted cakes, fresh flowers, and midnight delivery.
          </Text>

          <View style={styles.contactBadges}>
            <TouchableOpacity style={styles.contactBadge} onPress={openWhatsApp} activeOpacity={0.8}>
              <FontAwesome5 name="whatsapp" size={18} color="#16A34A" style={{ marginBottom: 6 }} />
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>{whatsappNumber}</Text>
              <Text style={styles.contactAction}>Tap to message →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactBadge} onPress={openEmail} activeOpacity={0.8}>
              <Feather name="mail" size={18} color={colors.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{emailAddress}</Text>
              <Text style={styles.contactAction}>Tap to email →</Text>
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
          <Text style={styles.sectionTitle}>Why GiftFestive Exists</Text>
          <Text style={styles.aboutText}>
            GiftFestive is engineered to deliver a luxury festive shopping experience matching the flagship website across both Android and iOS devices.
          </Text>
          <Text style={styles.aboutText}>
            Customers can effortlessly explore city-based gifts, customize cake weights and flower counts, choose eggless preparations, apply promo codes, and enjoy live order tracking with midnight delivery support.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
        >
          <Text style={styles.contactButtonText}>Back to Profile</Text>
        </TouchableOpacity>
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
  heroCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    marginBottom: 14,
  },
  badge: {
    position: 'absolute',
    top: 28,
    left: 28,
    backgroundColor: colors.brandBerry,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
  },
  contactBadges: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  contactBadge: {
    flex: 1,
    backgroundColor: colors.backgroundCream,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  contactAction: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.brandBerry,
    textAlign: 'center',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.brandBerry,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 8,
  },
  contactButton: {
    backgroundColor: colors.brandBerry,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.brandBerry,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
});

