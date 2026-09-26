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
import { Feather } from '@expo/vector-icons';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

const ADDRESS_STORAGE_KEY = '@giftcart_saved_addresses';
const LEGACY_ADDRESS_KEY = '@giftcart_saved_address';

export default function SavedAddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { bottom } = useLayoutInsets();
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
    const unsubscribe = navigation.addListener('focus', loadAddresses);
    return unsubscribe;
  }, [navigation]);

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
            id: single.id || Date.now().toString() + Math.random().toString(16).slice(2),
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
    <SafeScreen style={styles.container}>
      <ScreenHeader
        title="Saved Addresses"
        subtitle="Manage locations for quick checkout"
        onBack={() => navigation.goBack()}
        border
      />

      <View style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Saved delivery addresses</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalOpen(true)}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={16} color="#FFF" />
            <Text style={styles.addButtonText}>Add Address</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottom + 24 }]} showsVerticalScrollIndicator={false}>
          {addresses.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconBox}>
                <Feather name="map-pin" size={32} color={colors.brandBerry} />
              </View>
              <Text style={styles.emptyTitle}>No saved addresses yet</Text>
              <Text style={styles.emptyText}>Add an address and it will be available during checkout.</Text>
            </View>
          ) : (
            addresses.map((address, index) => (
              <View
                key={address.id ?? `${address.title || 'address'}-${index}`}
                style={styles.addressCard}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{address.title}</Text>
                  <Text style={styles.cardName}>{address.fullName}</Text>
                  <Text style={styles.cardPhone}>📞 {address.phone}</Text>
                  <Text style={styles.cardText}>{address.houseNo}, {address.street}</Text>
                  {address.landmark ? <Text style={styles.cardText}>Landmark: {address.landmark}</Text> : null}
                  <Text style={styles.cardPin}>PIN: {address.pinCode}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(address.id)}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={14} color="#DC2626" />
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
                placeholder="Full name *"
                placeholderTextColor="#94A3B8"
                value={form.fullName}
                onChangeText={(value) => setForm((prev) => ({ ...prev, fullName: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="10-digit Phone number *"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="House / Flat / Building No. *"
                placeholderTextColor="#94A3B8"
                value={form.houseNo}
                onChangeText={(value) => setForm((prev) => ({ ...prev, houseNo: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Street / Area / Locality *"
                placeholderTextColor="#94A3B8"
                value={form.street}
                onChangeText={(value) => setForm((prev) => ({ ...prev, street: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="6-digit PIN Code *"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={form.pinCode}
                onChangeText={(value) => setForm((prev) => ({ ...prev, pinCode: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Landmark (Optional)"
                placeholderTextColor="#94A3B8"
                value={form.landmark}
                onChangeText={(value) => setForm((prev) => ({ ...prev, landmark: value }))}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveAddress} disabled={saving}>
                <Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'Save Address'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },
  page: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brandBerry,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
  list: {
    paddingBottom: 24,
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundRose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.brandBerry,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  cardPhone: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  cardPin: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandBerry,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 16,
  },
  modalForm: {
    paddingBottom: 16,
  },
  input: {
    backgroundColor: '#FFFDFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
    color: '#1E293B',
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '800',
  },
  modalSave: {
    flex: 1.5,
    backgroundColor: colors.brandBerry,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFF',
    fontWeight: '800',
  },
});

