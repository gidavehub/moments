import { type ReactNode } from 'react';

/** react-native-keyboard-controller has no web build — the browser handles the keyboard. */
export function AppKeyboardProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
