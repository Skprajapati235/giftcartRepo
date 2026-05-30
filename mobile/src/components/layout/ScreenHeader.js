import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCREEN_PADDING_H } from '../../constants/layout';

export default function ScreenHeader({
  title,
  onBack,
  right,
  border = false,
  light = false,
}) {
  const iconColor = light ? '#FFF' : '#000';
  const titleColor = light ? '#FFF' : '#000';

  return (
    <View style={[styles.header, border && styles.border]}>
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={styles.side}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}
      <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>{right || null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING_H,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    minHeight: 52,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  side: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
  },
});
