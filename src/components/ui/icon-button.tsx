import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { gradient, useTheme } from '@/theme';

import { PressableScale, type PressableScaleProps } from './pressable-scale';

export interface IconButtonProps extends Omit<PressableScaleProps, 'children'> {
  children: ReactNode;
  label: string;
  size?: number;
  variant?: 'glass' | 'surface' | 'gold' | 'navy' | 'ghost' | 'sunk';
  badge?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  children,
  label,
  size = 44,
  variant = 'glass',
  badge,
  style,
  haptics = 'tap',
  ...rest
}: IconButtonProps) {
  const t = useTheme();
  const c = t.color;
  const skins: Record<NonNullable<IconButtonProps['variant']>, ViewStyle> = {
    glass: {
      backgroundColor: c.glassFill,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.glassStroke,
      boxShadow: t.shadow.plate,
    },
    surface: {
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.hairline,
      boxShadow: t.shadow.plate,
    },
    sunk: { backgroundColor: c.bgSunk },
    gold: { backgroundColor: c.gold, ...gradient(t.gradient.flareSheen), boxShadow: t.shadow.ring },
    navy: { backgroundColor: c.navy },
    ghost: { backgroundColor: 'transparent' },
  };

  return (
    <PressableScale
      accessibilityLabel={label}
      haptics={haptics}
      to={0.92}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={[{ width: size, height: size, borderRadius: size / 2 }, styles.center, skins[variant], style]}
      {...rest}>
      {children}
      {badge ? <View style={[styles.badge, { backgroundColor: c.discount, borderColor: c.surface }]} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
});
