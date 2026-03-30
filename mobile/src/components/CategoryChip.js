import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CategoryChip({ title, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected ? styles.activeChip : styles.inactiveChip]}
      onPress={onPress}
    >
      <Text style={[styles.label, selected ? styles.activeLabel : styles.inactiveLabel]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: '#ff74c3',
    borderColor: '#ff74c3',
  },
  inactiveChip: {
    backgroundColor: '#111',
    borderColor: '#444',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeLabel: {
    color: '#111',
  },
  inactiveLabel: {
    color: '#fff',
  },
});
