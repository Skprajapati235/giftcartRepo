import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BASE_HEIGHT, STICKY_FOOTER_BASE_PADDING } from '../constants/layout';

export function useLayoutInsets() {
  const insets = useSafeAreaInsets();

  // On Android devices with on-screen navigation buttons (Back, Home, Recents)
  // insets.bottom can be 0 or small, causing tab bar and sticky buttons to overlap with physical/software keys.
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'android' ? 24 : 16);
  const safeTop = Math.max(insets.top, Platform.OS === 'android' ? 12 : 0);

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
