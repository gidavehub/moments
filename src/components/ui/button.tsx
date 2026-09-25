import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { alpha, radius, useTheme } from '@/theme';

import { PressableScale, type PressableScaleProps } from './pressable-scale';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'ghost' | 'glass' | 'danger' | 'navy';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends Omit<PressableScaleProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHT: Record<ButtonSize, number> = { lg: 58, md: 48, sm: 38 };
const PAD: Record<ButtonSize, number> = { lg: 26, md: 20, sm: 14 };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  leading,
  trailing,
  block,
  style,
  haptics = 'press',
  ...rest
}: ButtonProps) {
  const t = useTheme();
  const c = t.color;

  const skin: Record<ButtonVariant, { box: ViewStyle; fg: string }> = {
    primary: {
      box: {
        backgroundColor: c.primary,
        boxShadow: `inset 0px 1px 0px rgba(255,255,255,0.14), ${t.shadow.lift}`,
      },
      fg: c.onPrimary,
    },
    navy: {
      box: { backgroundColor: c.navy, boxShadow: `inset 0px 1px 0px rgba(255,255,255,0.14), ${t.shadow.lift}` },
      fg: '#FFFFFF',
    },
    gold: {
      // Flat gold with a soft gold glow — the one primary action on a screen.
      box: {
        backgroundColor: c.gold,
        boxShadow: `inset 0px 1px 0px rgba(255,255,255,0.35), 0px 6px 22px ${alpha(c.gold, 0.4)}`,
      },
      fg: c.onGold,
    },
    secondary: {
      box: {
        backgroundColor: c.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.border,
        boxShadow: t.shadow.plate,
      },
      fg: c.text,
    },
    ghost: { box: { backgroundColor: 'transparent' }, fg: c.text },
    glass: {
      box: {
        backgroundColor: c.glassFill,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.glassStroke,
        boxShadow: t.shadow.glass,
      },
      fg: c.text,
    },
    danger: { box: { backgroundColor: alpha(c.discount, 0.1) }, fg: c.discount },
  };

  const s = skin[variant];

  return (
    <PressableScale
      haptics={haptics}
      accessibilityLabel={label}
      style={[
        styles.base,
        { height: HEIGHT[size], paddingHorizontal: PAD[size] },
        block && styles.block,
        s.box,
        style,
      ]}
      {...rest}>
      {leading ? <View style={styles.slot}>{leading}</View> : null}
      <Text variant={size === 'sm' ? 'buttonSm' : 'button'} color={s.fg} numberOfLines={1}>
        {label}
      </Text>
      {trailing ? <View style={styles.slot}>{trailing}</View> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderCurve: 'continuous',
  },
  block: { alignSelf: 'stretch' },
  slot: { alignItems: 'center', justifyContent: 'center' },
});
