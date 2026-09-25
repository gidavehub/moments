import { Platform } from 'react-native';

/**
 * Screen presentations. On web (<768px, EXPO_UNSTABLE_WEB_MODAL) every modal becomes a vaul
 * drawer, so full-screen flows fall back to plain cards there.
 */
type Opts = Record<string, unknown>;

const web = Platform.OS === 'web';

export const fullScreen = (extra: Opts = {}): Opts =>
  web
    ? { presentation: 'card', animation: 'fade', ...extra }
    : { presentation: 'fullScreenModal', animation: 'slide_from_bottom', ...extra };

export const sheet = (detents: number[], extra: Opts = {}): Opts => ({
  presentation: 'formSheet',
  sheetAllowedDetents: detents,
  sheetInitialDetentIndex: 0,
  sheetGrabberVisible: true,
  sheetCornerRadius: 32,
  sheetExpandsWhenScrolledToEdge: true,
  ...extra,
});
