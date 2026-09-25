import { createContext, use, type ReactNode } from 'react';
import { useAnimatedScrollHandler, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ease } from '@/theme';

interface Chrome {
  /** 0 = visible, 1 = tucked away. */
  hidden: SharedValue<number>;
}

const ChromeContext = createContext<Chrome | null>(null);

export function ChromeProvider({ children }: { children: ReactNode }) {
  const hidden = useSharedValue(0);
  return <ChromeContext value={{ hidden }}>{children}</ChromeContext>;
}

export function useChrome() {
  return use(ChromeContext);
}

export const TAB_BAR_HEIGHT = 68;

/** Bottom padding a tab screen needs so its last row clears the floating bar. */
export function useChromeInsets() {
  const insets = useSafeAreaInsets();
  return { bottom: insets.bottom + TAB_BAR_HEIGHT + 36, top: insets.top };
}

/**
 * Scroll handler for tab screens: tuck the bar away when scrolling down past the fold,
 * bring it back on any upward scroll (or near the top).
 */
export function useChromeScroll(onScrollY?: SharedValue<number>) {
  const chrome = useChrome();
  const last = useSharedValue(0);
  return useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      onScrollY?.set(y);
      if (!chrome) return;
      const dy = y - last.get();
      last.set(y);
      if (y < 80 || dy < -6) {
        if (chrome.hidden.get() !== 0) chrome.hidden.set(withTiming(0, { duration: 380, easing: ease.expo }));
      } else if (dy > 8) {
        if (chrome.hidden.get() !== 1) chrome.hidden.set(withTiming(1, { duration: 380, easing: ease.expo }));
      }
    },
  });
}
