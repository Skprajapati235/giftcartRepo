import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_BASE_HEIGHT, STICKY_FOOTER_BASE_PADDING } from '../constants/layout';

export function useLayoutInsets() {
  const insets = useSafeAreaInsets();

  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;
  const stickyFooterPadding = Math.max(insets.bottom, STICKY_FOOTER_BASE_PADDING);

  return {
    insets,
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    tabBarHeight,
    stickyFooterPadding,
  };
}
