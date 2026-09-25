import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { useReduced, useTheme } from '@/theme';

const BARS = 32;

function Bar({ i, clock, color }: { i: number; clock: SharedValue<number>; color: string }) {
  const style = useAnimatedStyle(() => {
    const t = clock.get() / 1000;
    // Sum of sines with per-bar phases: a live voice-ish envelope, loudest in the middle.
    const env = Math.sin((i / (BARS - 1)) * Math.PI) * 0.7 + 0.3;
    const v = 0.5 + 0.28 * Math.sin(t * 7.1 + i * 0.9) + 0.16 * Math.sin(t * 13.3 + i * 2.3) + 0.08 * Math.sin(t * 3.1 + i * 0.4);
    return { transform: [{ scaleY: Math.max(0.12, Math.min(1, v * env)) }] };
  });
  return <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />;
}

/** The S2S ask-bar voice note: 32 gold bars on one frame clock. */
export function VoiceWaveform({ active, height = 36 }: { active: boolean; height?: number }) {
  const t = useTheme();
  const reduced = useReduced();
  const clock = useSharedValue(0);
  const frame = useFrameCallback((f) => {
    clock.set(f.timeSinceFirstFrame);
  }, false);
  useEffect(() => {
    frame.setActive(active && !reduced);
    return () => frame.setActive(false);
  }, [active, reduced, frame]);
  return (
    <View style={[styles.row, { height }]} accessibilityLabel="Recording voice note">
      {Array.from({ length: BARS }, (_, i) => (
        <Bar key={i} i={i} clock={clock} color={t.color.gold} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  bar: { flex: 1, height: '100%', borderRadius: 2 },
});
