import { useEffect, useRef } from 'react';
import { StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { haptic } from '@/lib/haptics';
import { brand, fonts, useTheme } from '@/theme';

const ITEM = 52;

function Num({ n, i, x, idle, gold }: { n: number; i: number; x: SharedValue<number>; idle: string; gold: string }) {
  const style = useAnimatedStyle(() => {
    const d = x.get() / ITEM - i;
    return {
      opacity: interpolate(Math.abs(d), [0, 1, 3.5], [1, 0.55, 0.12], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(Math.abs(d), [0, 1, 2], [1.85, 1, 0.85], Extrapolation.CLAMP) }, { translateY: interpolate(Math.abs(d), [0, 1], [-6, 6], Extrapolation.CLAMP) }],
    };
  });
  const color = useAnimatedStyle(() => ({ color: interpolateColor(Math.min(1, Math.abs(x.get() / ITEM - i)), [0, 1], [gold, idle]) }));
  return (
    <View style={styles.item}>
      <Animated.Text style={[{ fontFamily: fonts.funBold, fontSize: 24, lineHeight: 30 }, style, color]}>{n}</Animated.Text>
    </View>
  );
}

/**
 * The mental-health "4 Days" picker: a snapping number wheel under a wave line whose crest
 * sits over the chosen value. Haptic tick on every step.
 */
export function WavePicker({
  min,
  max,
  value,
  onChange,
  width,
  label,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  width: number;
  label: string;
}) {
  const t = useTheme();
  const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const x = useSharedValue((value - min) * ITEM);
  const ref = useRef<Animated.ScrollView>(null);
  const last = useRef(value);

  useEffect(() => {
    ref.current?.scrollTo({ x: (value - min) * ITEM, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = useAnimatedScrollHandler((e) => {
    x.set(e.contentOffset.x);
  });
  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const v = Math.max(min, Math.min(max, Math.round(e.nativeEvent.contentOffset.x / ITEM) + min));
    if (v !== last.current) {
      last.current = v;
      haptic.select();
      onChange(v);
    }
  };

  const pad = (width - ITEM) / 2;
  const w = width;
  const crest = `M0 34 C ${w * 0.3} 34, ${w * 0.38} 6, ${w / 2} 6 C ${w * 0.62} 6, ${w * 0.7} 34, ${w} 34`;

  return (
    <View style={{ width }} accessibilityRole="adjustable" accessibilityLabel={`${label}: ${value}`}>
      <Svg width={w} height={40} style={styles.wave}>
        <Defs>
          <LinearGradient id="wave" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={t.color.border} stopOpacity={0} />
            <Stop offset="0.35" stopColor={brand.gold} stopOpacity={0.7} />
            <Stop offset="0.5" stopColor={brand.orange} />
            <Stop offset="0.65" stopColor={brand.gold} stopOpacity={0.7} />
            <Stop offset="1" stopColor={t.color.border} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={crest} stroke="url(#wave)" strokeWidth={5} fill="none" strokeLinecap="round" />
        <Path d={`M${w / 2 - 5} 6 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0`} fill={t.color.gold} />
      </Svg>
      <Animated.ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        onScroll={onScroll}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: pad, paddingVertical: 14 }}>
        {nums.map((n, i) => (
          <Num key={n} n={n} i={i} x={x} idle={t.color.textSubtle} gold={t.color.goldText} />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wave: { marginBottom: -4 },
  item: { width: ITEM, alignItems: 'center', justifyContent: 'center', height: 56 },
});
