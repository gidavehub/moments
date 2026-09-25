import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { alpha, duration, ease, useReduced, useTheme } from '@/theme';

const ACircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  delay?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Circular progress that draws itself on mount. Used for "6 of 9 sorted" and countdowns. */
export function ProgressRing({ value, size = 44, stroke = 4, color, track, delay = 0, children, style }: ProgressRingProps) {
  const t = useTheme();
  const reduced = useReduced();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = useSharedValue(reduced ? value : 0);

  useEffect(() => {
    p.set(reduced ? value : withDelay(delay, withTiming(value, { duration: 1100, easing: ease.expo })));
  }, [value, delay, reduced, p]);

  const props = useAnimatedProps(() => ({ strokeDashoffset: circ * (1 - Math.max(0, Math.min(1, p.get()))) }));

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? alpha(t.color.text, 0.1)} strokeWidth={stroke} fill="none" />
        <ACircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? t.color.gold}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          animatedProps={props}
        />
      </Svg>
      {children}
    </View>
  );
}

export const RING_DRAW_MS = duration.slow;
