import { createContext, use, type ReactNode, type RefObject } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Android's blur needs to know which view it blurs (a BlurTargetView). On iOS/web the
 * backdrop is sampled automatically, so this is a plain View and the context stays empty.
 */
export const BlurTargetContext = createContext<RefObject<View | null> | null>(null);

export function useBlurTarget() {
  return use(BlurTargetContext);
}

export function BlurTarget({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={style}>{children}</View>;
}
