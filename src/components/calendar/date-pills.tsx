import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { fmt, isSameDay } from '@/lib/dates';
import { alpha, gradient, spring, useTheme } from '@/theme';

const W = 54;
const H = 76;
const GAP = 8;

function Pill({ date, selected, today, dots, onPress }: { date: Date; selected: boolean; today: boolean; dots: string[]; onPress: () => void }) {
  const t = useTheme();
  const on = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    on.set(withSpring(selected ? 1 : 0, spring.snappy));
  }, [selected, on]);
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: -on.get() * 4 }] }));
  const fill = useAnimatedStyle(() => ({ opacity: on.get(), transform: [{ scale: 0.7 + on.get() * 0.3 }] }));

  const fg = selected ? t.color.onGold : t.color.text;
  return (
    <PressableScale haptics="select" onPress={onPress} accessibilityLabel={fmt.long(date)} accessibilityState={{ selected }}>
      <Animated.View
        style={[
          styles.pill,
          { borderColor: today && !selected ? t.color.gold : t.color.hairline, backgroundColor: t.color.surface, boxShadow: t.shadow.plate },
          lift,
        ]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.fill, { backgroundColor: t.color.gold, boxShadow: t.shadow.glow }, gradient(t.gradient.flareSheen), fill]} />
        <Text variant="numeralSm" color={fg} style={{ fontSize: 24, lineHeight: 28 }}>
          {date.getDate()}
        </Text>
        <Text variant="caption" color={selected ? t.color.onGold : t.color.textMuted}>
          {fmt.weekdayShort(date)}
        </Text>
        <View style={styles.dots}>
          {dots.slice(0, 3).map((c, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: selected ? alpha(t.color.onGold, 0.7) : c }]} />
          ))}
        </View>
      </Animated.View>
    </PressableScale>
  );
}

/** Events-app date pills: a horizontal strip of days, the selected one lifting in gold. */
export function DatePills({
  days,
  selected,
  today,
  dotsFor,
  onSelect,
  style,
}: {
  days: Date[];
  selected: Date;
  today: Date;
  dotsFor: (d: Date) => string[];
  onSelect: (d: Date) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const ref = useRef<ScrollView>(null);
  const idx = days.findIndex((d) => isSameDay(d, selected));
  useEffect(() => {
    if (idx > 2) ref.current?.scrollTo({ x: (idx - 2) * (W + GAP), animated: true });
  }, [idx]);
  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={{ paddingHorizontal: 20, gap: GAP, paddingVertical: 8 }}>
      {days.map((d) => (
        <Pill key={d.toDateString()} date={d} selected={isSameDay(d, selected)} today={isSameDay(d, today)} dots={dotsFor(d)} onPress={() => onSelect(d)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pill: { width: W, height: H, borderRadius: 27, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 1, overflow: 'hidden' },
  fill: { borderRadius: 27 },
  dots: { flexDirection: 'row', gap: 3, height: 6, marginTop: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
