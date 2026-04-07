import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const userLocation = user?.state && user?.city ? `${user.state}, ${user.city}` : null;

  const ProfileItem = ({ icon, label, onPress, color = '#555' }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Feather name={icon} size={20} color={color} />
        <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#DDD" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Account Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Feather name="edit-3" size={20} color="#D82B76" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
          {user?.profilePic ? (
            <Image source={{ uri: user.profilePic }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
          )}
          <Text style={styles.name}>{user?.name || 'Shopper'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {userLocation ? <Text style={styles.location}>{userLocation}</Text> : null}
          {user?.mobileNumber && <Text style={styles.mobile}>{user.mobileNumber}</Text>}
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <ProfileItem icon="shopping-bag" label="My Orders" onPress={() => navigation.navigate('MyOrders')} />
          <ProfileItem icon="heart" label="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
          <ProfileItem icon="map-pin" label="Saved Addresses" onPress={() => {}} />
          <ProfileItem icon="credit-card" label="Manage Payments" onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Utilities</Text>
          <ProfileItem icon="help-circle" label="Help & Support" onPress={() => {}} />
          <ProfileItem icon="shield" label="Security" onPress={() => {}} />
          <ProfileItem icon="share-2" label="Share GiftCart" onPress={() => {}} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <Feather name="log-out" size={20} color="#FFF" />
          <Text style={styles.logoutText}>Sign Out of GiftCart</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '800', color: '#000' },
  scroll: { padding: 20 },
  profileHeader: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 30, marginBottom: 25, elevation: 3 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFE0EB', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 40, fontWeight: '800', color: '#D82B76' },
  name: { fontSize: 22, fontWeight: '800', color: '#000' },
  email: { fontSize: 14, color: '#888', marginTop: 5 },
  location: { fontSize: 13, color: '#555', marginTop: 5, fontWeight: '600' },
  mobile: { fontSize: 14, color: '#888', marginTop: 3 },
  editBtn: { backgroundColor: '#F0F0F0', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 15 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#555' },
  section: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 20, elevation: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 15, marginLeft: 10 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemLabel: { fontSize: 16, fontWeight: '600', marginLeft: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF6A3D', borderRadius: 15, paddingVertical: 18, marginTop: 10 },
  logoutText: { color: '#FFF', fontSize: 17, fontWeight: '800', marginLeft: 10 },
});
