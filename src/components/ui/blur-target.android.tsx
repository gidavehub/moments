import { BlurTargetView } from 'expo-blur';
import { createContext, use, useRef, type ReactNode, type RefObject } from 'react';
import { type StyleProp, type View, type ViewStyle } from 'react-native';

export const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

export function useBlurTarget() {
  return use(BlurTargetContext);
}

/** Wraps the content that floating glass (tab bar, headers) should blur on Android 12+. */
export function BlurTarget({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const ref = useRef<View>(null);
  return (
    <BlurTargetContext value={ref}>
      <BlurTargetView ref={ref} style={style}>
        {children}
      </BlurTargetView>
    </BlurTargetContext>
  );
}
