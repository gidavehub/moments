import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { alpha, ease, useReduced, useTheme } from '@/theme';

const APath = Animated.createAnimatedComponent(Path);

export interface DonutSegment {
  value: number;
  color: string;
  key: string;
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

/** Start/end angles for each segment, laid left → right over the top of the arc. */
function layoutSegments(segments: DonutSegment[], total: number, gap: number) {
  const visible = segments.filter((s) => s.value > 0);
  const out: (DonutSegment & { a0: number; a1: number })[] = [];
  let a = Math.PI;
  for (let i = 0; i < visible.length; i++) {
    const sweep = (visible[i].value / total) * Math.PI;
    out.push({ ...visible[i], a0: a + (i ? gap / 2 : 0), a1: a + sweep - gap / 2 });
    a += sweep;
  }
  return out;
}

function Segment({ d, len, color, width, progress }: { d: string; len: number; color: string; width: number; progress: SharedValue<number> }) {
  const props = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - progress.get()) }));
  return (
    <APath d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeDasharray={`${len} ${len}`} animatedProps={props} />
  );
}

function AnimatedSegment({ delay, ...rest }: { d: string; len: number; color: string; width: number; delay: number }) {
  const reduced = useReduced();
  const p = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) p.set(withDelay(delay, withTiming(1, { duration: 700, easing: ease.expo })));
  }, [p, delay, reduced]);
  return <Segment {...rest} progress={p} />;
}

/**
 * The half-donut gauge (mental-health "Weekly mood" meets a budget meter). Segments are drawn
 * left → right over the top, each sweeping in after the previous one.
 */
export function HalfDonut({
  segments,
  total,
  width = 220,
  thickness = 18,
  gap = 0.05,
  children,
  style,
}: {
  segments: DonutSegment[];
  /** The full scale (e.g. the budget). Unfilled remainder shows as track. */
  total: number;
  width?: number;
  thickness?: number;
  gap?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const r = (width - thickness) / 2;
  const cx = width / 2;
  const cy = r + thickness / 2;
  const h = cy + thickness / 2;

  const segs = layoutSegments(segments, total, gap).map((s) => ({
    ...s,
    d: arc(cx, cy, r, s.a0, Math.max(s.a0 + 0.001, s.a1)),
    len: r * Math.max(0.001, s.a1 - s.a0),
  }));

  return (
    <View style={[{ width, height: h }, style]}>
      <Svg width={width} height={h}>
        <Path d={arc(cx, cy, r, Math.PI, Math.PI * 2)} stroke={alpha(t.color.text, 0.08)} strokeWidth={thickness} fill="none" strokeLinecap="round" />
        {segs.map((s, i) => (
          <AnimatedSegment key={s.key} d={s.d} len={s.len} color={s.color} width={thickness} delay={200 + i * 180} />
        ))}
      </Svg>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' }}>{children}</View>
    </View>
  );
}
