import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { alpha, radius, useTheme } from '@/theme';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
  size?: 'sm' | 'md';
  tone?: 'default' | 'gold' | 'glass' | 'outline' | 'navy';
  style?: StyleProp<ViewStyle>;
}

/** Filter / choice chip. Selected = navy pill on paper, gold sheen on ink. */
export function Chip({ label, selected, onPress, leading, trailing, size = 'md', tone = 'default', style }: ChipProps) {
  const t = useTheme();
  const c = t.color;
  const h = size === 'sm' ? 30 : 36;

  const box: ViewStyle = selected
    ? { backgroundColor: c.navy }
    : tone === 'gold'
      ? { backgroundColor: c.state.gold.bg }
      : tone === 'glass'
        ? { backgroundColor: c.glassFill, borderWidth: StyleSheet.hairlineWidth, borderColor: c.glassStroke }
        : tone === 'outline'
          ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border }
          : tone === 'navy'
            ? { backgroundColor: alpha(c.navy, 0.06) }
            : { backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: c.hairline, boxShadow: t.shadow.plate };

  const fg = selected ? ('#FFFFFF') : tone === 'gold' ? c.state.gold.fg : c.text;

  const body = (
    <View style={[styles.row, { height: h, paddingHorizontal: leading ? 6 : 14, paddingRight: trailing ? 8 : 14 }, box, style]}>
      {leading ? <View style={styles.lead}>{leading}</View> : null}
      <Text variant={size === 'sm' ? 'caption' : 'callout'} color={fg} numberOfLines={1}>
        {label}
      </Text>
      {trailing}
    </View>
  );

  if (!onPress) return body;
  return (
    <PressableScale haptics="select" onPress={onPress} accessibilityState={{ selected }} accessibilityLabel={label} hitSlop={size === 'sm' ? { top: 10, bottom: 10 } : { top: 7, bottom: 7 }}>
      {body}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    borderCurve: 'continuous',
  },
  lead: { marginRight: 2 },
});
