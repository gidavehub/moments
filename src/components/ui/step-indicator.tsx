import { Fragment, useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { alpha, ease, radius, spring, useTheme } from '@/theme';

import { Text } from './text';

const SIZE = 38;
const LABEL = 120;

function Connector({ filled }: { filled: boolean }) {
  const t = useTheme();
  const p = useSharedValue(filled ? 1 : 0);
  useEffect(() => {
    p.set(withTiming(filled ? 1 : 0, { duration: 520, easing: ease.expo }));
  }, [filled, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  return (
    <View style={[styles.line, { backgroundColor: alpha(t.color.text, 0.12) }]}>
      <Animated.View style={[styles.lineFill, { backgroundColor: t.color.gold }, fill]} />
    </View>
  );
}

function Node({ index, state }: { index: number; state: 'done' | 'current' | 'todo' }) {
  const t = useTheme();
  const check = useSharedValue(state === 'done' ? 1 : 0);
  const ring = useSharedValue(state === 'current' ? 1 : 0);
  useEffect(() => {
    check.set(state === 'done' ? withDelay(260, withSpring(1, spring.bouncy)) : withTiming(0, { duration: 150 }));
    ring.set(withTiming(state === 'current' ? 1 : 0, { duration: 400, easing: ease.expo }));
  }, [state, check, ring]);

  const checkStyle = useAnimatedStyle(() => ({ opacity: check.get(), transform: [{ scale: 0.4 + check.get() * 0.6 }] }));
  const glow = useAnimatedStyle(() => ({ opacity: ring.get(), transform: [{ scale: 0.8 + ring.get() * 0.2 }] }));

  const done = state === 'done';
  const current = state === 'current';
  return (
    <View style={styles.nodeWrap}>
      <Animated.View style={[styles.glow, { boxShadow: t.shadow.ring }, glow]} />
      <View
        style={[
          styles.node,
          {
            backgroundColor: done ? t.color.gold : t.color.surface,
            borderColor: done || current ? t.color.gold : alpha(t.color.text, 0.16),
            borderWidth: current ? 3 : done ? 0 : 1.5,
          },
        ]}>
        {done ? (
          <Animated.View style={checkStyle}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={t.color.onGold} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Animated.View>
        ) : (
          <Text variant="callout" tone={current ? 'default' : 'subtle'}>
            {index + 1}
          </Text>
        )}
      </View>
    </View>
  );
}

/** DoMore-style numbered stepper: ✓ — ② — 3 — 4, gold connectors fill as you advance. */
export function StepIndicator({
  steps,
  current,
  style,
}: {
  steps: string[];
  current: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [w, setW] = useState(0);
  const n = steps.length;
  // The current label sits under its node; the first and last pin to the edge so they never clip.
  const cx = n > 1 ? SIZE / 2 + (current * (w - SIZE)) / (n - 1) : w / 2;
  const place =
    current === 0
      ? { left: -6, textAlign: 'left' as const }
      : current === n - 1
        ? { right: -6, textAlign: 'right' as const }
        : { left: cx - LABEL / 2, width: LABEL, textAlign: 'center' as const };
  return (
    <View style={style}>
      <View style={styles.row} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {steps.map((_, i) => (
          <Fragment key={i}>
            {i > 0 && <Connector filled={i <= current} />}
            <Node index={i} state={i < current ? 'done' : i === current ? 'current' : 'todo'} />
          </Fragment>
        ))}
      </View>
      <View style={styles.labels}>
        {w > 0 && steps[current] ? (
          <Animated.View key={current} entering={FadeIn.duration(260)} style={[styles.label, { left: place.left, right: place.right, width: place.width }]}>
            <Text variant="caption" numberOfLines={1} style={{ textAlign: place.textAlign }}>
              {steps[current]}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  line: { flex: 1, height: 3, borderRadius: 2, marginHorizontal: 6, overflow: 'hidden' },
  lineFill: { height: '100%', borderRadius: 2 },
  nodeWrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  node: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  labels: { height: 16, marginTop: 8 },
  label: { position: 'absolute', top: 0 },
});
