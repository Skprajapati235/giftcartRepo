import React, { createContext, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState({
    visible: false,
    message: '',
  });

  const showLoading = useCallback((message = 'Loading...') => {
    setLoadingState({ visible: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState({ visible: false, message: '' });
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading: loadingState.visible }}>
      {children}
      {loadingState.visible && (
        <Modal
          transparent
          animationType="fade"
          visible={loadingState.visible}
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <ActivityIndicator size="large" color="#D82B76" />
              {!!loadingState.message && (
                <Text style={styles.modalText}>{loadingState.message}</Text>
              )}
            </View>
          </View>
        </Modal>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});
