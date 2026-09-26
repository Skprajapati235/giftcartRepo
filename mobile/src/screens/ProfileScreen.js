import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const userLocation = user?.state && user?.city ? `${user.city}, ${user.state}` : user?.city || user?.state || null;
  const { bottom } = useLayoutInsets();

  const ProfileItem = ({ icon, label, onPress, color = '#1E293B', iconBg = colors.backgroundCream, iconColor = colors.brandBerry }) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Feather name={icon} size={18} color={iconColor} />
        </View>
        <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#741343" />
      <ScreenHeader
        title="My Profile"
        subtitle="Manage your festive account"
        onBack={() => navigation.goBack()}
        border
        berry
        right={
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.75}
          >
            <Feather name="edit-3" size={13} color="#FFD166" />
            <Text style={styles.editHeaderBtnText}>Edit</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundWarm }}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarTouchable}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.85}
          >
            {user?.image || user?.profilePic ? (
              <Image source={{ uri: user.image || user.profilePic }} style={styles.profileImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            )}
            <View style={styles.avatarCameraBadge}>
              <Feather name="camera" size={13} color="#FFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.name || 'Festive Shopper'}</Text>

          {(user?.mobileNumber || user?.phone) && (
            <View style={styles.metaRow}>
              <Feather name="phone" size={13} color={colors.primary} />
              <Text style={styles.metaText}>+91 {user.mobileNumber || user.phone}</Text>
            </View>
          )}

          {userLocation && (
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={13} color={colors.primary} />
              <Text style={styles.metaText}>{userLocation}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.8}
          >
            <Feather name="edit-3" size={13} color="#D82B76" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Orders & Shopping Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MY ORDERS & ACTIVITY</Text>
          <ProfileItem
            icon="shopping-bag"
            label="My Orders"
            iconBg={colors.backgroundRose}
            iconColor={colors.brandBerry}
            onPress={() => navigation.navigate('MyOrders')}
          />
          <ProfileItem
            icon="heart"
            label="Wishlist"
            iconBg="#FFF0F5"
            iconColor={colors.primary}
            onPress={() => navigation.navigate('Wishlist')}
          />
          <ProfileItem
            icon="tag"
            label="Festive Offers & Coupons"
            iconBg={colors.backgroundCream}
            iconColor={colors.brandGold}
            onPress={() => navigation.navigate('Offers')}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES & ADDRESSES</Text>
          <ProfileItem
            icon="map-pin"
            label="Saved Addresses"
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            onPress={() => navigation.navigate('SavedAddresses')}
          />
          <ProfileItem
            icon="credit-card"
            label="Manage Payments"
            iconBg="#EFF6FF"
            iconColor="#2563EB"
            onPress={() => navigation.navigate('ManagePayments')}
          />
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT & SETTINGS</Text>
          <ProfileItem
            icon="help-circle"
            label="Help & Customer Support"
            iconBg={colors.backgroundRose}
            iconColor={colors.brandBerry}
            onPress={() => navigation.navigate('CustomerSupport')}
          />
          <ProfileItem
            icon="shield"
            label="Terms & Privacy Policy"
            iconBg="#F8FAFC"
            iconColor="#64748B"
            onPress={() => navigation.navigate('TermsPolicy')}
          />
          <ProfileItem
            icon="code"
            label="Developer Info"
            iconBg="#F8FAFC"
            iconColor="#64748B"
            onPress={() => navigation.navigate('Developer')}
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut} activeOpacity={0.85}>
          <Feather name="log-out" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Sign Out of GiftFestive</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#741343',
  },
  scroll: {
    padding: 16,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 102, 0.45)',
  },
  editHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarTouchable: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: colors.borderWarm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.backgroundRose,
    borderWidth: 2.5,
    borderColor: colors.borderRose,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D82B76',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.brandBerry,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  editBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#D82B76',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 6,
    marginLeft: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
  },
});

