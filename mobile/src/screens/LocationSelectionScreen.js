import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import locationService from '../services/locationService';
import userService from '../services/userService';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

export default function LocationSelectionScreen({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(user?.state || '');
  const [selectedCity, setSelectedCity] = useState(user?.city || '');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const { bottom } = useLayoutInsets();

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const data = await locationService.getCities();
      setCities(data || []);
      setLoading(false);
    } catch (error) {
      console.log('Failed to fetch cities:', error);
      Alert.alert('Error', 'Failed to fetch locations. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectLocation = async () => {
    if (!selectedState || !selectedCity) {
      Alert.alert('Selection Required', 'Please select both your state and city.');
      return;
    }

    setSubmitting(true);
    try {
      const updatedUser = await userService.updateProfile({
        state: selectedState,
        city: selectedCity,
      });
      await updateUser(updatedUser);
      navigation.replace('Home');
    } catch (error) {
      console.log('Failed to update location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brandBerry} />
      </SafeScreen>
    );
  }

  const selectedStateCities = cities.find(c => c.state === selectedState)?.cities || [];

  const StateItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedState(item.state);
        setSelectedCity('');
        setStateModalVisible(false);
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.dropdownItemText}>{item.state}</Text>
      {selectedState === item.state && (
        <Ionicons name="checkmark-circle" size={18} color={colors.brandBerry} />
      )}
    </TouchableOpacity>
  );

  const CityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedCity(item);
        setCityModalVisible(false);
      }}
      activeOpacity={0.7}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
      {selectedCity === item && (
        <Ionicons name="checkmark-circle" size={18} color={colors.brandBerry} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeScreen style={styles.safe}>
      <ScreenHeader
        title="Delivery City"
        subtitle="Select where you'd like gifts delivered"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        border
      />

      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottom + 30 }]}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Feather name="map-pin" size={32} color={colors.brandBerry} />
          </View>
          <Text style={styles.cardHeading}>Where should we deliver?</Text>
          <Text style={styles.cardSub}>
            Select your city to check delivery availability, same-day delivery slots, and night orders.
          </Text>

          <View style={styles.formSection}>
            <Text style={styles.label}>Select State</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setStateModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectButtonText, !selectedState && styles.selectButtonTextDisabled]}>
                {selectedState || 'Choose your state'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.brandBerry} />
            </TouchableOpacity>

            <Text style={styles.label}>Select City</Text>
            <TouchableOpacity
              style={[styles.selectButton, !selectedState && styles.selectButtonDisabled]}
              onPress={() => selectedState && setCityModalVisible(true)}
              disabled={!selectedState}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedCity && styles.selectButtonTextDisabled,
                ]}
              >
                {selectedCity || (selectedState ? 'Choose your city' : 'Select state first')}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={selectedState ? colors.brandBerry : '#CBD5E1'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSelectLocation}
            disabled={submitting}
            activeOpacity={0.88}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <View style={styles.btnContent}>
                <Text style={styles.buttonText}>Confirm Delivery Location</Text>
                <Feather name="arrow-right" size={18} color={colors.brandGold} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* State Modal */}
        <Modal
          visible={stateModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setStateModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose State</Text>
                <TouchableOpacity onPress={() => setStateModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={cities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <StateItem item={item} />}
              />
            </View>
          </View>
        </Modal>

        {/* City Modal */}
        <Modal
          visible={cityModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setCityModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Cities in {selectedState}</Text>
                <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1E293B" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={selectedStateCities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <CityItem item={item} />}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundWarm,
  },
  container: {
    flexGrow: 1,
    padding: 18,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundRose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  formSection: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    marginTop: 10,
    letterSpacing: 0.3,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFDFB',
  },
  selectButtonDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  selectButtonTextDisabled: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    backgroundColor: colors.brandBerry,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: colors.brandBerry,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
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
    maxHeight: '75%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
});

