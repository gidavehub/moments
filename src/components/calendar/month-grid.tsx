import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { sparklePath } from '@/components/brand/geometry';
import { Text } from '@/components/ui/text';
import { haptic } from '@/lib/haptics';
import { fmt, isSameDay, monthMatrix } from '@/lib/dates';
import { alpha, gradient, spring, useTheme } from '@/theme';

export interface DayMark {
  /** Tint of a moment happening that day. */
  moment?: string;
  dots: string[];
}

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * A month as a 6×7 grid. Moment days wear their category tint with a sparkle; task days get
 * state dots; today has a gold ring; the selection is a gold pill that springs cell to cell.
 */
export function MonthGrid({
  month,
  width,
  today,
  selected,
  marks,
  onSelect,
}: {
  month: Date;
  width: number;
  today: Date;
  selected: Date;
  marks: (d: Date) => DayMark;
  onSelect: (d: Date) => void;
}) {
  const t = useTheme();
  const cell = width / 7;
  const rows = monthMatrix(month);
  const pos = (() => {
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) if (isSameDay(rows[r][c], selected)) return { r, c };
    return null;
  })();

  const x = useSharedValue(pos ? pos.c * cell : 0);
  const y = useSharedValue(pos ? pos.r * cell : 0);
  const vis = useSharedValue(pos ? 1 : 0);
  useEffect(() => {
    if (pos) {
      x.set(withSpring(pos.c * cell, spring.snappy));
      y.set(withSpring(pos.r * cell, spring.snappy));
      vis.set(withSpring(1, spring.snappy));
    } else vis.set(withSpring(0, spring.snappy));
  }, [pos?.r, pos?.c, cell, x, y, vis, pos]);
  const hl = useAnimatedStyle(() => ({ opacity: vis.get(), transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: 0.6 + vis.get() * 0.4 }] }));

  return (
    <View style={{ width }}>
      <View style={styles.week}>
        {WEEK.map((w, i) => (
          <Text key={i} variant="caption" tone="subtle" align="center" style={{ width: cell }}>
            {w}
          </Text>
        ))}
      </View>
      <View style={{ height: cell * 6 }}>
        <Animated.View style={[{ pointerEvents: 'none' }, styles.hl, { width: cell, height: cell }, hl]}>
          <View style={[styles.hlInner, { backgroundColor: t.color.gold, boxShadow: t.shadow.glow }, gradient(t.gradient.flareSheen)]} />
        </Animated.View>
        {rows.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((d) => {
              const inMonth = d.getMonth() === month.getMonth();
              const isSel = isSameDay(d, selected);
              const isToday = isSameDay(d, today);
              const mk = marks(d);
              return (
                <Pressable
                  key={d.toDateString()}
                  onPress={() => {
                    haptic.select();
                    onSelect(d);
                  }}
                  accessibilityLabel={fmt.long(d)}
                  accessibilityState={{ selected: isSel }}
                  style={[styles.cell, { width: cell, height: cell }]}>
                  <View
                    style={[
                      styles.day,
                      mk.moment && !isSel ? { backgroundColor: mk.moment } : null,
                      isToday && !isSel ? { borderWidth: 2, borderColor: t.color.gold } : null,
                    ]}>
                    <Text
                      variant="callout"
                      color={isSel ? t.color.onGold : mk.moment ? '#0D3052' : inMonth ? t.color.text : alpha(t.color.text, 0.25)}
                      style={{ fontSize: 15 }}>
                      {d.getDate()}
                    </Text>
                    {mk.moment ? (
                      <Svg width={10} height={10} style={styles.spark}>
                        <Path d={sparklePath(5, 5, 5)} fill={isSel ? t.color.onGold : '#0D3052'} />
                      </Svg>
                    ) : null}
                  </View>
                  <View style={styles.dots}>
                    {mk.dots.slice(0, 3).map((c, i) => (
                      <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row', marginBottom: 4 },
  row: { flexDirection: 'row' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  spark: { position: 'absolute', top: 2, right: 2 },
  dots: { flexDirection: 'row', gap: 3, height: 5, position: 'absolute', bottom: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  hl: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
  hlInner: { width: 42, height: 42, borderRadius: 21 },
});
