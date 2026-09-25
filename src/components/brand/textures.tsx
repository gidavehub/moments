import { memo, useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { css } from 'react-native-reanimated';
import Svg, { Circle, Defs, Mask, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useLive } from '@/hooks/use-live';
import { brand, cssEase, useTheme } from '@/theme';

import { GrainFill } from './grain-fill';

/** Tiled film grain — the soft-3D "printed" feel. Sits on top of gradients and art. */
export const Grain = memo(function Grain({ opacity = 0.06, style }: { opacity?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ pointerEvents: 'none' }, StyleSheet.absoluteFill, { opacity, overflow: 'hidden' }, style]}>
      <GrainFill />
    </View>
  );
});

/**
 * The S2S landing dot grid: 1px dots every 18px, fading out toward the edges through a
 * radial mask so it reads as texture, not graph paper.
 */
export const DotGrid = memo(function DotGrid({
  gap = 18,
  dot = 1.1,
  color,
  fade = 'radial',
  style,
}: {
  gap?: number;
  dot?: number;
  color?: string;
  fade?: 'radial' | 'bottom' | 'none';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const id = useId().replace(/:/g, '');
  const fill = color ?? t.color.dotGrid;
  return (
    <View style={[{ pointerEvents: 'none' }, StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id={`p${id}`} x={0} y={0} width={gap} height={gap} patternUnits="userSpaceOnUse">
            <Circle cx={gap / 2} cy={gap / 2} r={dot} fill={fill} />
          </Pattern>
          {fade !== 'none' && (
            <RadialGradient
              id={`g${id}`}
              cx="50%"
              cy={fade === 'bottom' ? '100%' : '45%'}
              rx={fade === 'bottom' ? '80%' : '62%'}
              ry={fade === 'bottom' ? '90%' : '58%'}>
              <Stop offset="0" stopColor="#fff" stopOpacity={1} />
              <Stop offset="0.7" stopColor="#fff" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#fff" stopOpacity={0} />
            </RadialGradient>
          )}
          {fade !== 'none' && (
            <Mask id={`m${id}`}>
              <Rect width="100%" height="100%" fill={`url(#g${id})`} />
            </Mask>
          )}
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#p${id})`} mask={fade !== 'none' ? `url(#m${id})` : undefined} />
      </Svg>
    </View>
  );
});

const driftA = css.keyframes({
  '0%': { transform: [{ translateX: -30 }, { translateY: -10 }, { scale: 1 }] },
  '50%': { transform: [{ translateX: 40 }, { translateY: 30 }, { scale: 1.12 }] },
  '100%': { transform: [{ translateX: -30 }, { translateY: -10 }, { scale: 1 }] },
});
const driftB = css.keyframes({
  '0%': { transform: [{ translateX: 30 }, { translateY: 20 }, { scale: 1.05 }] },
  '50%': { transform: [{ translateX: -40 }, { translateY: -20 }, { scale: 0.95 }] },
  '100%': { transform: [{ translateX: 30 }, { translateY: 20 }, { scale: 1.05 }] },
});

function Blob({ size, color, opacity, id }: { size: number; color: string; opacity: number; id: string }) {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.7" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={size} height={size} fill={`url(#${id})`} />
    </Svg>
  );
}

/** Two slow gold/orange light blobs drifting behind hero content (S2S aurora, 22s / 26s). */
export const Aurora = memo(function Aurora({ intensity = 1, style }: { intensity?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = !useLive();
  const id = useId().replace(/:/g, '');
  const k = (1) * intensity;
  return (
    <View style={[{ pointerEvents: 'none' }, StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          styles.blobA,
          !reduced && { animationName: driftA, animationDuration: 22000, animationIterationCount: 'infinite', animationTimingFunction: cssEase.sine },
        ]}>
        <Blob size={560} color={brand.gold} opacity={0.26 * k} id={`a${id}`} />
      </Animated.View>
      <Animated.View
        style={[
          styles.blobB,
          !reduced && { animationName: driftB, animationDuration: 26000, animationIterationCount: 'infinite', animationTimingFunction: cssEase.sine },
        ]}>
        <Blob size={480} color={brand.orange} opacity={0.16 * k} id={`b${id}`} />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  blobA: { position: 'absolute', top: -200, left: -180 },
  blobB: { position: 'absolute', bottom: -160, right: -200 },
});
