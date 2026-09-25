import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

/** The browser resizes the viewport for its own keyboard — nothing to do on web. */
export function KeyboardAvoid({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={style}>{children}</View>;
}
