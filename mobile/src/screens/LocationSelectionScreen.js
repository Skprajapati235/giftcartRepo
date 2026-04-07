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
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import locationService from '../services/locationService';
import userService from '../services/userService';

export default function LocationSelectionScreen({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const data = await locationService.getCities();
      setCities(data);
      setLoading(false);
    } catch (error) {
      console.log('Failed to fetch cities:', error);
      Alert.alert('Error', 'Failed to fetch locations. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectLocation = async () => {
    if (!selectedState || !selectedCity) {
      Alert.alert('Required', 'Please select both state and city.');
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#D82B76" />
      </View>
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
    >
      <Text style={styles.dropdownItemText}>{item.state}</Text>
    </TouchableOpacity>
  );

  const CityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedCity(item);
        setCityModalVisible(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Location</Text>
        <Text style={styles.subtitle}>Choose your state and city to continue</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.label}>State *</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setStateModalVisible(true)}
        >
          <Text style={styles.selectButtonText}>
            {selectedState || 'Select State'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#D82B76" />
        </TouchableOpacity>

        <Text style={styles.label}>City *</Text>
        <TouchableOpacity
          style={[styles.selectButton, !selectedState && styles.selectButtonDisabled]}
          onPress={() => selectedState && setCityModalVisible(true)}
          disabled={!selectedState}
        >
          <Text
            style={[
              styles.selectButtonText,
              !selectedState && styles.selectButtonTextDisabled,
            ]}
          >
            {selectedCity || 'Select City'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={selectedState ? '#D82B76' : '#ccc'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleSelectLocation}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Saving...' : 'Continue'}
        </Text>
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setStateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
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
              <Text style={styles.modalTitle}>Select City in {selectedState}</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
    marginTop: 15,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectButtonText: {
    fontSize: 14,
    color: '#222',
    flex: 1,
  },
  selectButtonTextDisabled: {
    color: '#999',
  },
  button: {
    backgroundColor: '#D82B76',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#222',
  },
});
