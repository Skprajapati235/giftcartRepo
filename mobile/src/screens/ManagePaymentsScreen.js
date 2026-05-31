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

const PAYMENT_STORAGE_KEY = '@giftcart_payment_methods';

export default function ManagePaymentsScreen({ navigation }) {
  const [methods, setMethods] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
  });

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const raw = await AsyncStorage.getItem(PAYMENT_STORAGE_KEY);
      setMethods(raw ? JSON.parse(raw) : []);
    } catch (error) {
      console.log('Load payment methods error', error);
    }
  };

  const handleSaveMethod = async () => {
    const { cardHolder, cardNumber, expiryDate } = form;
    if (!cardHolder || !cardNumber || cardNumber.length < 12 || !expiryDate) {
      Alert.alert('Incomplete card details', 'Please enter a valid card name, number, and expiry date.');
      return;
    }

    const next = [
      {
        id: Date.now().toString(),
        cardHolder,
        type: cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Card',
        last4: cardNumber.slice(-4),
        expiryDate,
      },
      ...methods,
    ];

    try {
      setSaving(true);
      await AsyncStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(next));
      setMethods(next);
      setModalOpen(false);
      setForm({ cardHolder: '', cardNumber: '', expiryDate: '' });
    } catch (error) {
      Alert.alert('Unable to save', 'Please try again.');
      console.log('Save payment method error', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const next = methods.filter((item) => item.id !== id);
    try {
      await AsyncStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(next));
      setMethods(next);
    } catch (error) {
      Alert.alert('Unable to delete', 'Please try again.');
      console.log('Delete payment method error', error);
    }
  };

  return (
    <SafeScreen>
      <ScreenHeader title="Manage Payments" onBack={() => navigation.goBack()} border />
      <View style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Save your cards for faster checkout and easy management.</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalOpen(true)}>
            <Text style={styles.addButtonText}>Add Card</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {methods.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No payment methods saved.</Text>
              <Text style={styles.emptyText}>Add a card and use it whenever you checkout.</Text>
            </View>
          ) : (
            methods.map((method) => (
              <View key={method.id} style={styles.card}>
                <View>
                  <Text style={styles.cardTitle}>{method.type} • •••• {method.last4}</Text>
                  <Text style={styles.cardText}>{method.cardHolder}</Text>
                  <Text style={styles.cardText}>Expiry: {method.expiryDate}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(method.id)}>
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Name on card"
                value={form.cardHolder}
                onChangeText={(value) => setForm((prev) => ({ ...prev, cardHolder: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Card number"
                keyboardType="number-pad"
                value={form.cardNumber}
                onChangeText={(value) => setForm((prev) => ({ ...prev, cardNumber: value.replace(/\s+/g, '') }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Expiry date (MM/YY)"
                value={form.expiryDate}
                onChangeText={(value) => setForm((prev) => ({ ...prev, expiryDate: value }))}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveMethod} disabled={saving}>
                <Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'Save Card'}</Text>
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
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 16, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
