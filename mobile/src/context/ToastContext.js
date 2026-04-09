import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform, StatusBar } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const fadeAnim = useRef(new Animated.Value(-100)).current;

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true });
    
    Animated.spring(fadeAnim, {
      toValue: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 20) + 10,
      useNativeDriver: true,
      bounciness: 10,
    }).start();

    setTimeout(() => {
      hideToast();
    }, 3000);
  }, [fadeAnim]);

  const hideToast = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  }, [fadeAnim]);

  const getToastStyle = (type) => {
    switch (type) {
      case 'success': return { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32', icon: 'check-circle' };
      case 'error': return { bg: '#FFEBEE', border: '#F44336', text: '#C62828', icon: 'alert-circle' };
      case 'warning': return { bg: '#FFF3E0', border: '#FF9800', text: '#EF6C00', icon: 'alert-triangle' };
      default: return { bg: '#F5F5F5', border: '#9E9E9E', text: '#424242', icon: 'info' };
    }
  };

  const style = getToastStyle(toast.type);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View style={[
          styles.toastContainer, 
          { transform: [{ translateY: fadeAnim }], backgroundColor: style.bg, borderLeftColor: style.border }
        ]}>
          <Feather name={style.icon} size={18} color={style.border} />
          <Text style={[styles.toastText, { color: style.text }]}>{toast.message}</Text>
          <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
             <Feather name="x" size={14} color={style.text} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

// Internal Import for Close Button (Avoiding dependency issues)
const TouchableOpacity = require('react-native').TouchableOpacity;

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10,
    flex: 1,
  },
  closeBtn: {
    marginLeft: 10,
    padding: 5,
  }
});
