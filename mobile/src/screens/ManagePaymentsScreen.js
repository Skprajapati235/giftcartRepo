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
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

const PAYMENT_STORAGE_KEY = '@giftcart_payment_methods';

export default function ManagePaymentsScreen({ navigation }) {
  const [methods, setMethods] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { bottom } = useLayoutInsets();
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
      Alert.alert('Incomplete details', 'Please enter a valid cardholder name, card number, and expiry date.');
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
    <SafeScreen style={styles.container}>
      <ScreenHeader
        title="Manage Payments"
        subtitle="Saved payment methods for faster checkout"
        onBack={() => navigation.goBack()}
        border
      />
      <View style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Saved Cards</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalOpen(true)}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={16} color="#FFF" />
            <Text style={styles.addButtonText}>Add Card</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottom + 24 }]} showsVerticalScrollIndicator={false}>
          {methods.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconBox}>
                <Feather name="credit-card" size={32} color={colors.brandBerry} />
              </View>
              <Text style={styles.emptyTitle}>No saved cards</Text>
              <Text style={styles.emptyText}>Add your card details for smooth one-tap checkouts.</Text>
            </View>
          ) : (
            methods.map((method) => (
              <View key={method.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardIconBox}>
                    <FontAwesome5
                      name={method.type === 'Visa' ? 'cc-visa' : method.type === 'Mastercard' ? 'cc-mastercard' : 'credit-card'}
                      size={24}
                      color={colors.brandBerry}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{method.type} •••• {method.last4}</Text>
                    <Text style={styles.cardText}>{method.cardHolder}</Text>
                    <Text style={styles.cardExp}>Expires: {method.expiryDate}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(method.id)}
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
            <Text style={styles.modalTitle}>Add Payment Card</Text>
            <ScrollView contentContainerStyle={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Cardholder Name *"
                placeholderTextColor="#94A3B8"
                value={form.cardHolder}
                onChangeText={(value) => setForm((prev) => ({ ...prev, cardHolder: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="16-digit Card Number *"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={19}
                value={form.cardNumber}
                onChangeText={(value) => setForm((prev) => ({ ...prev, cardNumber: value.replace(/\s+/g, '') }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Expiry Date (MM/YY) *"
                placeholderTextColor="#94A3B8"
                maxLength={5}
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundRose,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  cardText: {
    fontSize: 13,
    color: '#64748B',
  },
  cardExp: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
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

