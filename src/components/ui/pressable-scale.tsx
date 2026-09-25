import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { spring } from '@/theme';

const APressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed. */
  to?: number;
  haptics?: 'none' | 'select' | 'tap' | 'press';
}

/** Press feedback: a springy scale-down plus optional haptic. The base for every tappable. */
export function PressableScale({
  children,
  style,
  to = 0.97,
  haptics = 'tap',
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const pressed = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.get() ? to : 1, spring.press) }],
  }));

  return (
    <APressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        pressed.set(1);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(0);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptics !== 'none') haptic[haptics]();
        onPress?.(e);
      }}
      style={[style, animated, disabled && { opacity: 0.45 }]}
      {...rest}>
      {children}
    </APressable>
  );
}
