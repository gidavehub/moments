import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

/** Lifts a screen's docked composer with the keyboard (native, frame-accurate on both OSes). */
export function KeyboardAvoid({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <KeyboardAvoidingView behavior="padding" style={style}>
      {children}
    </KeyboardAvoidingView>
  );
}
