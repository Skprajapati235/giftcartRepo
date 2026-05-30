import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Safe area wrapper — use instead of react-native SafeAreaView.
 * Default: top + horizontal insets (bottom handled by tab bar / sticky footer).
 */
export default function SafeScreen({
  children,
  style,
  edges = ['top', 'left', 'right'],
}) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
});
