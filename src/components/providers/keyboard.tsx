import { type ReactNode } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';

/**
 * Keyboard tracking for the whole app. On Android the provider takes over window insets, and
 * unless both bars are marked translucent it pads the app away from them — solid strips under
 * the status bar and the navigation bar. Moments draws edge to edge, so both are translucent.
 */
export function AppKeyboardProvider({ children }: { children: ReactNode }) {
  return (
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent preserveEdgeToEdge>
      {children}
    </KeyboardProvider>
  );
}
