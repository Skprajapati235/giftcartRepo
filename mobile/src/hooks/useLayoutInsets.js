import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BASE_HEIGHT, STICKY_FOOTER_BASE_PADDING } from '../constants/layout';

export function useLayoutInsets() {
  const insets = useSafeAreaInsets();

  // Use actual safe-area insets from device so tab bar sits cleanly at the bottom
  const safeBottom = insets?.bottom || 0;
  const safeTop = Math.max(insets?.top || 0, Platform.OS === 'android' ? 12 : 0);

  const tabBarHeight = TAB_BAR_BASE_HEIGHT + safeBottom;
  const stickyFooterPadding = Math.max(safeBottom, STICKY_FOOTER_BASE_PADDING);

  return {
    insets,
    top: insets.top,
    safeTop,
    bottom: safeBottom,
    rawBottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    tabBarHeight,
    stickyFooterPadding,
  };
}
