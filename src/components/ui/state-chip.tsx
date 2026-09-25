import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { kf, loop, radius, useReduced, useTheme } from '@/theme';

import { Text } from './text';

export type StateTone = 'neutral' | 'gold' | 'green' | 'muted';

/** S2S status chip: a 6px state dot + label. Gold = "your move", green = done, neutral = S2S working. */
export function StateChip({
  label,
  tone = 'neutral',
  live,
  size = 'md',
  style,
}: {
  label: string;
  tone?: StateTone;
  live?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const reduced = useReduced();
  const p = t.color.state[tone];
  return (
    <View style={[styles.chip, { backgroundColor: p.bg, height: size === 'sm' ? 22 : 26 }, style]}>
      <View style={styles.dotWrap}>
        {live && !reduced ? (
          <Animated.View style={[styles.dot, styles.ping, { backgroundColor: p.dot }, loop(kf.ping, 1600, 0)]} />
        ) : null}
        <View style={[styles.dot, { backgroundColor: p.dot }]} />
      </View>
      <Text variant="caption" color={p.fg} numberOfLines={1} style={size === 'sm' ? { fontSize: 11 } : null}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 9,
    borderRadius: radius.full,
  },
  dotWrap: { width: 6, height: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  ping: { position: 'absolute' },
});
