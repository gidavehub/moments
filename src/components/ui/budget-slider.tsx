import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { haptic } from '@/lib/haptics';
import { FX, moneyShort } from '@/lib/money';
import { alpha, gradient, spring, useTheme } from '@/theme';

import { Text } from './text';

/** A gold budget slider in US$ with the landed J$ equivalent underneath. Snaps to steps of 50. */
export function BudgetSlider({ min = 100, max = 3000, value, onChange }: { min?: number; max?: number; value: number; onChange: (v: number) => void }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const p = useSharedValue((value - min) / (max - min));
  const pressed = useSharedValue(0);
  const startP = useSharedValue(0);

  const emit = (v: number) => {
    const snapped = Math.round((min + v * (max - min)) / 50) * 50;
    if (snapped !== value) {
      haptic.select();
      onChange(snapped);
    }
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      startP.set(p.get());
      pressed.set(withSpring(1, spring.snappy));
    })
    .onUpdate((e) => {
      if (w <= 0) return;
      const next = Math.max(0, Math.min(1, startP.get() + e.translationX / w));
      p.set(next);
      scheduleOnRN(emit, next);
    })
    .onFinalize(() => {
      pressed.set(withSpring(0, spring.snappy));
    });

  const fill = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: p.get() * w - 14 }, { scale: 1 + pressed.get() * 0.18 }] }));

  return (
    <View style={{ gap: 10 }}>
      <View style={styles.head}>
        <Text variant="title2">US${value.toLocaleString()}</Text>
        <Text variant="callout" tone="muted">
          ≈ {moneyShort(value * FX.JMD)} landed
        </Text>
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.hit} onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="adjustable" accessibilityLabel={`Budget up to ${value} US dollars`}>
          <View style={[styles.track, { backgroundColor: alpha(t.color.text, 0.1) }]}>
            <Animated.View style={[styles.fill, { backgroundColor: t.color.gold }, gradient(t.gradient.flareSheen), fill]} />
          </View>
          <Animated.View style={[styles.knob, { backgroundColor: '#FFFFFF', borderColor: t.color.gold, boxShadow: t.shadow.lift }, knob]} />
        </View>
      </GestureDetector>
      <View style={styles.head}>
        <Text variant="caption" tone="subtle">
          US${min}
        </Text>
        <Text variant="caption" tone="subtle">
          US${max.toLocaleString()}+
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  hit: { height: 36, justifyContent: 'center' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  knob: { position: 'absolute', left: 0, width: 28, height: 28, borderRadius: 14, borderWidth: 3 },
});
