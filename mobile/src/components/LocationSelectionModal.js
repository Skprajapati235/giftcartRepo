import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import locationService from '../services/locationService';

export default function LocationSelectionModal({ visible, onLocationSelect, loading: externalLoading }) {
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (visible && cities.length === 0) {
      fetchCities(true);
    }
  }, [visible]);

  const fetchCities = async (isInitial = true) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const currentPage = isInitial ? 1 : page;
      const resp = await locationService.getCities({
        page: currentPage,
        limit: 10
      });

      const newData = resp.data || [];
      if (isInitial) {
        setCities(newData);
        setPage(2);
      } else {
        setCities(prev => [...prev, ...newData]);
        setPage(prev => prev + 1);
      }
      setHasMore(currentPage < (resp.totalPages || 1));
      setLoading(false);
    } catch (error) {
      console.log('Failed to fetch cities:', error);
      Alert.alert('Error', 'Failed to fetch locations!');
      setLoading(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCities(false);
    }
  };

  const handleSelectLocation = async () => {
    if (!selectedState || !selectedCity) {
      Alert.alert('Required', 'Please select both state and city.');
      return;
    }

    setSubmitting(true);
    try {
      await onLocationSelect(selectedState, selectedCity);
    } catch (error) {
      console.log('Location selection error:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
      setSubmitting(false);
    }
  };

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
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D82B76" />
              <Text style={styles.loadingText}>Loading locations...</Text>
            </View>
          ) : (
            <>
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
                style={[styles.button, (submitting || externalLoading) && styles.buttonDisabled]}
                onPress={handleSelectLocation}
                disabled={submitting || externalLoading}
              >
                <Text style={styles.buttonText}>
                  {submitting || externalLoading ? 'Saving...' : 'Continue'}
                </Text>
              </TouchableOpacity>

              {/* State Modal */}
              <Modal
                visible={stateModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setStateModalVisible(false)}
              >
                <View style={styles.innerModalOverlay}>
                  <View style={styles.innerModalContent}>
                    <View style={styles.innerModalHeader}>
                      <Text style={styles.innerModalTitle}>Select State</Text>
                      <TouchableOpacity onPress={() => setStateModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#000" />
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={cities}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => <StateItem item={item} />}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                      onEndReached={handleLoadMore}
                      onEndReachedThreshold={0.5}
                      ListFooterComponent={() => 
                        loadingMore ? (
                          <ActivityIndicator size="small" color="#D82B76" style={{ marginVertical: 10 }} />
                        ) : null
                      }
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
                <View style={styles.innerModalOverlay}>
                  <View style={styles.innerModalContent}>
                    <View style={styles.innerModalHeader}>
                      <Text style={styles.innerModalTitle}>Select City in {selectedState}</Text>
                      <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#000" />
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={selectedStateCities}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => <CityItem item={item} />}
                      scrollEnabled={true}
                      nestedScrollEnabled={true}
                    />
                  </View>
                </View>
              </Modal>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
    marginTop: 12,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
    marginHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  innerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  innerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    flex: 1,
  },
  innerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  innerModalTitle: {
    fontSize: 16,
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
    fontSize: 15,
    color: '#222',
  },
});
