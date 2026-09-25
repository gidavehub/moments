import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';

import { spring, type, useReduced, useTheme } from '@/theme';

import { Text } from './text';

function Digit({ value, h, color, delay, fontSize }: { value: number; h: number; color: string; delay: number; fontSize: number }) {
  const reduced = useReduced();
  const y = useSharedValue(reduced ? -value * h : 0);
  useEffect(() => {
    y.set(reduced ? -value * h : withDelay(delay, withSpring(-value * h, { ...spring.soft, stiffness: 90 })));
  }, [value, h, delay, reduced, y]);
  const col = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  return (
    <View style={{ height: h, overflow: 'hidden' }} aria-hidden>
      <Animated.View style={col}>
        {Array.from({ length: 10 }, (_, n) => (
          <Text key={n} variant="numeral" color={color} style={{ height: h, lineHeight: h, fontSize }}>
            {n}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

/** Slot-machine digits (Fredoka) that roll into place — the moment's countdown. */
export function RollingNumber({
  value,
  pad = 2,
  size = 56,
  color,
  delay = 0,
  style,
}: {
  value: number;
  pad?: number;
  size?: number;
  color?: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const digits = `${Math.max(0, Math.round(value))}`.padStart(pad, '0').split('').map(Number);
  const h = Math.round(size * ((type.numeral.lineHeight as number) / (type.numeral.fontSize as number)));
  // One readable number for assistive tech; the ten-digit strips underneath are decoration.
  return (
    <View style={[styles.row, style]} accessible accessibilityRole="text" aria-label={`${Math.max(0, Math.round(value))}`}>
      {digits.map((d, i) => (
        <Digit key={`${digits.length}-${i}`} value={d} h={h} fontSize={size} color={color ?? t.color.text} delay={delay + i * 90} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row' } });
