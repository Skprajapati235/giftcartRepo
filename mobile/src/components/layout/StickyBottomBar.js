import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLayoutInsets } from '../../hooks/useLayoutInsets';
import { STICKY_FOOTER_BASE_PADDING } from '../../constants/layout';

/** Sticky footer for checkout, cart, product detail — respects home indicator */
export default function StickyBottomBar({ children, style, absolute = false, contentStyle }) {
  const { stickyFooterPadding } = useLayoutInsets();

  return (
    <View style={[absolute && styles.absolute, style]}>
      <View
        style={[
          styles.bar,
          { paddingBottom: stickyFooterPadding, paddingTop: STICKY_FOOTER_BASE_PADDING },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingHorizontal: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  absolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
});
