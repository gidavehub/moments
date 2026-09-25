import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { alpha, spring, useTheme } from '@/theme';

/** A springy switch: gold track when on, knob squashes slightly as it travels. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  const t = useTheme();
  const p = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    p.set(withSpring(value ? 1 : 0, spring.snappy));
  }, [value, p]);

  const off = alpha(t.color.text, 0.12);
  const track = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(p.get(), [0, 1], [off, t.color.gold]) }));
  const knob = useAnimatedStyle(() => {
    const v = p.get();
    const squash = 1 + Math.sin(v * Math.PI) * 0.18;
    return { transform: [{ translateX: v * 20 }, { scaleX: squash }] };
  });

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => {
        haptic.select();
        onChange(!value);
      }}>
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, { boxShadow: t.shadow.lift }, knob]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: 52, height: 32, borderRadius: 16, padding: 3 },
  knob: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF' },
});
