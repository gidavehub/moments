import { Fragment } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { MomentsMark } from '@/components/brand/moments-mark';
import { Text } from '@/components/ui/text';
import type { Stage } from '@/data/types';
import { alpha, cssEase, enter, gradient, kf, loop, useTheme } from '@/theme';

export const STAGES: { id: Stage; label: string }[] = [
  { id: 'planned', label: 'Planned' },
  { id: 'onIt', label: 'We’re on it' },
  { id: 'choosing', label: 'Pick and approve' },
  { id: 'booked', label: 'Booked' },
  { id: 'arriving', label: 'Arriving' },
  { id: 'theDay', label: 'The day' },
];

/**
 * The S2S request stage rail, adapted to a moment's life. Done stages are green ticks,
 * the live one is a gold-sheen pill with a breathing mark, the rest are quiet dots.
 */
export function StageRail({ stage, caption, compact, style }: { stage: Stage; caption?: string; compact?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const idx = Math.max(0, STAGES.findIndex((s) => s.id === stage));
  return (
    <View style={style}>
      <View style={styles.row}>
        {STAGES.map((s, i) => {
          const done = i < idx;
          const live = i === idx;
          return (
            <Fragment key={s.id}>
              {i > 0 && <View style={[styles.line, { backgroundColor: i <= idx ? t.color.success : alpha(t.color.text, 0.12) }]} />}
              {live ? (
                <Animated.View
                  style={[styles.live, { backgroundColor: t.color.gold, boxShadow: t.shadow.glow }, gradient(t.gradient.flareSheen), enter(kf.popIn, 200, 420, cssEase.spring)]}>
                  <Animated.View style={loop(kf.pulseDot, 2400)}>
                    <View style={[styles.liveDot, { backgroundColor: t.color.onGold }]} />
                  </Animated.View>
                  {!compact && (
                    <Text variant="caption" color={t.color.onGold} numberOfLines={1}>
                      {s.label}
                    </Text>
                  )}
                </Animated.View>
              ) : (
                <View
                  accessibilityLabel={`${s.label}${done ? ', done' : ''}`}
                  style={[
                    styles.node,
                    done ? { backgroundColor: t.color.success } : { backgroundColor: t.color.surface, borderWidth: 1.5, borderColor: alpha(t.color.text, 0.16) },
                  ]}>
                  {done && (
                    <Svg width={12} height={12} viewBox="0 0 24 24">
                      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FFFFFF" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </View>
              )}
            </Fragment>
          );
        })}
      </View>
      {caption && !compact ? (
        <View style={styles.caption}>
          <MomentsMark size={30} state="planning" />
          <Text variant="footnote" tone="muted" style={{ flex: 1 }}>
            {caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  line: { flex: 1, height: 2.5, borderRadius: 2, marginHorizontal: 3 },
  node: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  live: { height: 30, borderRadius: 15, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  caption: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
});
