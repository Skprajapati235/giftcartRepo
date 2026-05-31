import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeScreen, ScreenHeader } from '../components/layout';

const ADDRESS_STORAGE_KEY = '@giftcart_saved_addresses';
const LEGACY_ADDRESS_KEY = '@giftcart_saved_address';

export default function SavedAddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    houseNo: '',
    street: '',
    pinCode: '',
    landmark: '',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const raw = await AsyncStorage.getItem(ADDRESS_STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        setAddresses(
          stored.map((address) => ({
            ...address,
            id: address.id || Date.now().toString() + Math.random().toString(16).slice(2),
          }))
        );
        return;
      }
      const legacy = await AsyncStorage.getItem(LEGACY_ADDRESS_KEY);
      if (legacy) {
        const single = JSON.parse(legacy);
        setAddresses([
          {
            ...single,
            id:
              single.id ||
              Date.now().toString() + Math.random().toString(16).slice(2),
          },
        ]);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.log('Load addresses error', error);
    }
  };

  const handleSaveAddress = async () => {
    const { fullName, phone, houseNo, street, pinCode } = form;
    if (!fullName || !phone || !houseNo || !street || !pinCode) {
      Alert.alert('Missing details', 'Please fill required address fields.');
      return;
    }

    const newAddress = {
      id: Date.now().toString(),
      ...form,
      title: `${form.fullName} • ${form.pinCode}`,
    };
    const next = [newAddress, ...addresses];

    try {
      setSaving(true);
      await AsyncStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
      await AsyncStorage.setItem(LEGACY_ADDRESS_KEY, JSON.stringify(newAddress));
      setAddresses(next);
      setModalOpen(false);
      setForm({ fullName: '', phone: '', houseNo: '', street: '', pinCode: '', landmark: '' });
    } catch (error) {
      Alert.alert('Unable to save', 'Please try again.');
      console.log('Save address error', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const next = addresses.filter((item) => item.id !== id);
    try {
      await AsyncStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(next));
      if (next.length > 0) {
        await AsyncStorage.setItem(LEGACY_ADDRESS_KEY, JSON.stringify(next[0]));
      } else {
        await AsyncStorage.removeItem(LEGACY_ADDRESS_KEY);
      }
      setAddresses(next);
    } catch (error) {
      Alert.alert('Unable to delete', 'Please try again.');
      console.log('Delete address error', error);
    }
  };

  return (
    <SafeScreen>
      <ScreenHeader title="Saved Addresses" onBack={() => navigation.goBack()} border />
      <View style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Manage the addresses you save for faster checkout.</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalOpen(true)}>
            <Text style={styles.addButtonText}>Add Address</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {addresses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No saved addresses yet.</Text>
              <Text style={styles.emptyText}>Add an address and it will be available during checkout.</Text>
            </View>
          ) : (
            addresses.map((address, index) => (
              <View
                key={address.id ?? `${address.title || 'address'}-${index}`}
                style={styles.addressCard}
              >
                <View>
                  <Text style={styles.cardTitle}>{address.title}</Text>
                  <Text style={styles.cardText}>{address.fullName}</Text>
                  <Text style={styles.cardText}>{address.phone}</Text>
                  <Text style={styles.cardText}>{address.houseNo}, {address.street}</Text>
                  {address.landmark ? <Text style={styles.cardText}>Landmark: {address.landmark}</Text> : null}
                  <Text style={styles.cardText}>PIN: {address.pinCode}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(address.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Full name"
                value={form.fullName}
                onChangeText={(value) => setForm((prev) => ({ ...prev, fullName: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="House/Flat Number"
                value={form.houseNo}
                onChangeText={(value) => setForm((prev) => ({ ...prev, houseNo: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Street / Locality"
                value={form.street}
                onChangeText={(value) => setForm((prev) => ({ ...prev, street: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="PIN Code"
                keyboardType="numeric"
                value={form.pinCode}
                onChangeText={(value) => setForm((prev) => ({ ...prev, pinCode: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Landmark (optional)"
                value={form.landmark}
                onChangeText={(value) => setForm((prev) => ({ ...prev, landmark: value }))}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveAddress} disabled={saving}>
                <Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 20 },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  subtitle: { flex: 1, fontSize: 14, color: '#555', marginRight: 12 },
  addButton: { backgroundColor: '#D82B76', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  addButtonText: { color: '#FFF', fontWeight: '700' },
  list: { paddingBottom: 36 },
  emptyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', justifyContent: 'center', marginTop: 20, elevation: 2 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#111', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  addressCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 16, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 6 },
  cardText: { fontSize: 13, lineHeight: 20, color: '#555' },
  deleteButton: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: '#FCE7F3', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  deleteText: { color: '#B91C52', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 16 },
  modalForm: { paddingBottom: 20 },
  input: { backgroundColor: '#F8F8F8', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12, fontSize: 14, color: '#111' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalCancel: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { color: '#374151', fontWeight: '700' },
  modalSave: { flex: 1, backgroundColor: '#D82B76', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  modalSaveText: { color: '#FFF', fontWeight: '700' },
});
