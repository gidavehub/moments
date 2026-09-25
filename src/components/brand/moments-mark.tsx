import { useIsFocused } from 'expo-router';
import { memo, type ComponentProps } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { css, Keyframe } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { brand, cssEase, ink, useReduced, useTheme } from '@/theme';

import {
  bigSpark,
  MARK_TILT,
  MARK_VIEWBOX,
  markPaths,
  pct,
  rings,
  sparklePath,
  tile,
  tileCenter,
} from './geometry';

export type MarkState = 'static' | 'idle' | 'thinking' | 'planning' | 'success' | 'arriving';
export type MarkVariant = 'auto' | 'navy' | 'light' | 'mono';

export interface MomentsMarkProps {
  size?: number;
  state?: MarkState;
  variant?: MarkVariant;
  /** Mono colour, or override the sparkle/ring colour. */
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const V = MARK_VIEWBOX;

// ---- keyframes -------------------------------------------------------------------------

const breathe = css.keyframes({
  '0%': { transform: [{ translateY: 0 }, { scale: 1 }] },
  '50%': { transform: [{ translateY: -3 }, { scale: 1.022 }] },
  '100%': { transform: [{ translateY: 0 }, { scale: 1 }] },
});
/** The sparkle catches the light: a quick turn and swell, then rest. */
const glint = css.keyframes({
  '0%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
  '72%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
  '82%': { transform: [{ scale: 1.09 }, { rotate: '12deg' }] },
  '100%': { transform: [{ scale: 1 }, { rotate: '0deg' }] },
});
/** …and a white highlight flashes across its heart at the same beat. */
const flash = css.keyframes({
  '0%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
  '74%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '0deg' }] },
  '82%': { opacity: 0.95, transform: [{ scale: 1 }, { rotate: '45deg' }] },
  '94%': { opacity: 0, transform: [{ scale: 0.4 }, { rotate: '90deg' }] },
  '100%': { opacity: 0, transform: [{ scale: 0.3 }, { rotate: '90deg' }] },
});
const halo = css.keyframes({
  from: { opacity: 0.85, transform: [{ scale: 0.62 }] },
  to: { opacity: 0, transform: [{ scale: 1.28 }] },
});
const sparkThink = css.keyframes({
  '0%': { transform: [{ scale: 0.82 }, { rotate: '-18deg' }] },
  '50%': { transform: [{ scale: 1.16 }, { rotate: '12deg' }] },
  '100%': { transform: [{ scale: 0.82 }, { rotate: '-18deg' }] },
});
const pageFlip = css.keyframes({
  '0%': { transform: [{ scaleY: 1 }, { translateY: 0 }] },
  '18%': { transform: [{ scaleY: 0.9 }, { translateY: 6 }] },
  '34%': { transform: [{ scaleY: 1.04 }, { translateY: -4 }] },
  '48%': { transform: [{ scaleY: 1 }, { translateY: 0 }] },
  '100%': { transform: [{ scaleY: 1 }, { translateY: 0 }] },
});
const ringBob = css.keyframes({
  '0%': { transform: [{ translateY: 0 }] },
  '20%': { transform: [{ translateY: -10 }] },
  '40%': { transform: [{ translateY: 0 }] },
  '100%': { transform: [{ translateY: 0 }] },
});
const slowSpin = css.keyframes({
  from: { transform: [{ rotate: '0deg' }, { scale: 1 }] },
  to: { transform: [{ rotate: '360deg' }, { scale: 1 }] },
});
const pop = css.keyframes({
  '0%': { transform: [{ scale: 0.9 }] },
  '38%': { transform: [{ scale: 1.14 }] },
  '70%': { transform: [{ scale: 0.97 }] },
  '100%': { transform: [{ scale: 1 }] },
});
const shock = css.keyframes({
  from: { opacity: 0.9, transform: [{ scale: 0.5 }] },
  to: { opacity: 0, transform: [{ scale: 1.7 }] },
});
const rays = css.keyframes({
  '0%': { opacity: 0, transform: [{ scale: 0.4 }] },
  '25%': { opacity: 1, transform: [{ scale: 0.9 }] },
  '100%': { opacity: 0, transform: [{ scale: 1.35 }] },
});
const drop = css.keyframes({
  '0%': { opacity: 0, transform: [{ translateY: -46 }, { scaleX: 0.92 }, { scaleY: 1.08 }] },
  '45%': { opacity: 1, transform: [{ translateY: 0 }, { scaleX: 1.1 }, { scaleY: 0.88 }] },
  '70%': { transform: [{ translateY: -8 }, { scaleX: 0.97 }, { scaleY: 1.03 }] },
  '100%': { opacity: 1, transform: [{ translateY: 0 }, { scaleX: 1 }, { scaleY: 1 }] },
});
const sparkPop = css.keyframes({
  '0%': { opacity: 0, transform: [{ scale: 0 }] },
  '60%': { opacity: 1, transform: [{ scale: 1.45 }] },
  '100%': { opacity: 1, transform: [{ scale: 1 }] },
});

function palette(variant: MarkVariant, bg: string, color?: string) {
  const v = variant === 'auto' ? 'navy' : variant;
  if (v === 'mono') {
    // Mono: one-colour tile, the sparkle knocked out in the surface colour.
    const c = color ?? brand.navy;
    return { tile: c, accent: c, spark: bg, holes: 'transparent', sheen: false };
  }
  const accent = color ?? brand.gold;
  if (v === 'light') return { tile: ink[50], accent, spark: accent, holes: ink[200], sheen: false };
  return { tile: brand.navy, accent, spark: accent, holes: ink[950], sheen: true };
}

type AStyle = ComponentProps<typeof Animated.View>['style'];

const Layer = ({ children, style }: { children: React.ReactNode; style?: AStyle }) => (
  <Animated.View style={[{ pointerEvents: 'none' }, StyleSheet.absoluteFill, style]}>
    <Svg width="100%" height="100%" viewBox={`0 0 ${V} ${V}`}>
      {children}
    </Svg>
  </Animated.View>
);

const origin = (x: number, y: number) => ({ transformOrigin: `${pct(x)} ${pct(y)}` }) as ViewStyle;

function MomentsMarkImpl({ size = 96, state = 'idle', variant = 'auto', color, style }: MomentsMarkProps) {
  const theme = useTheme();
  const reduced = useReduced();
  const focused = useIsFocused();
  const c = palette(variant, theme.color.bg, color);
  // Off-screen, the loops rest; one-shot entrances keep their state so they don't replay on return.
  const s = reduced || (!focused && state !== 'success' && state !== 'arriving') ? 'static' : state;
  const detail = size >= 72;

  const loopIdle = s === 'idle' || s === 'success' || s === 'arriving';
  const container = [
    s === 'success' && { animationName: pop, animationDuration: 720, animationTimingFunction: cssEase.expo },
    s === 'arriving' && {
      animationName: drop,
      animationDuration: 900,
      animationTimingFunction: cssEase.expo,
      animationFillMode: 'backwards' as const,
    },
  ];
  const inner = loopIdle
    ? {
        animationName: breathe,
        animationDuration: 4500,
        animationIterationCount: 'infinite' as const,
        animationTimingFunction: cssEase.sine,
        animationDelay: s === 'idle' ? 0 : 900,
      }
    : null;

  const glinting = s === 'idle' || s === 'success';
  const glintLoop = (name: typeof glint) => ({
    animationName: name,
    animationDuration: 4500,
    animationDelay: s === 'success' ? 1200 : 900,
    animationIterationCount: 'infinite' as const,
    animationTimingFunction: cssEase.inOut,
  });

  const bigAnim =
    s === 'thinking'
      ? {
          animationName: sparkThink,
          animationDuration: 2400,
          animationIterationCount: 'infinite' as const,
          animationTimingFunction: cssEase.sine,
        }
      : s === 'planning'
        ? {
            animationName: slowSpin,
            animationDuration: 3200,
            animationIterationCount: 'infinite' as const,
            animationTimingFunction: cssEase.inOut,
          }
        : s === 'arriving'
          ? {
              animationName: sparkPop,
              animationDuration: 620,
              animationDelay: 480,
              animationTimingFunction: cssEase.spring,
              animationFillMode: 'backwards' as const,
            }
          : glinting
            ? glintLoop(glint)
            : null;

  return (
    <Animated.View style={[{ width: size, height: size }, container, style]} accessibilityRole="image" accessibilityLabel="Moments">
      <Animated.View style={[StyleSheet.absoluteFill, inner]}>
        <View style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${MARK_TILT}deg` }] }]}>
          {s === 'thinking' &&
            [0, 1, 2].map((i) => (
              <Layer
                key={`halo-${i}`}
                style={[
                  origin(tileCenter.x, tileCenter.y),
                  {
                    animationName: halo,
                    animationDuration: 2400,
                    animationDelay: i * 800,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: cssEase.expo,
                  },
                ]}>
                <Circle
                  cx={tileCenter.x}
                  cy={tileCenter.y}
                  r={200}
                  fill="none"
                  stroke={brand.gold}
                  strokeWidth={10}
                  opacity={0.7}
                />
              </Layer>
            ))}

          {s === 'success' && (
            <>
              <Layer
                style={[
                  origin(tileCenter.x, tileCenter.y),
                  { animationName: shock, animationDuration: 1100, animationTimingFunction: cssEase.expo, animationFillMode: 'both' },
                ]}>
                <Circle cx={tileCenter.x} cy={tileCenter.y} r={196} fill="none" stroke={brand.gold} strokeWidth={12} />
              </Layer>
              <Layer
                style={[
                  origin(tileCenter.x, tileCenter.y),
                  { animationName: rays, animationDuration: 1000, animationTimingFunction: cssEase.expo, animationFillMode: 'both' },
                ]}>
                {Array.from({ length: 8 }, (_, i) => {
                  const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
                  const r0 = 222;
                  const r1 = 252;
                  return (
                    <Path
                      key={i}
                      d={`M${tileCenter.x + Math.cos(a) * r0} ${tileCenter.y + Math.sin(a) * r0} L${tileCenter.x + Math.cos(a) * r1} ${tileCenter.y + Math.sin(a) * r1}`}
                      stroke={brand.gold}
                      strokeWidth={14}
                      strokeLinecap="round"
                    />
                  );
                })}
              </Layer>
            </>
          )}

          {/* Tile */}
          <Layer
            style={[
              origin(tileCenter.x, tile.y + tile.h),
              s === 'planning' && {
                animationName: pageFlip,
                animationDuration: 2200,
                animationIterationCount: 'infinite',
                animationTimingFunction: cssEase.expo,
              },
            ]}>
            {c.sheen && (
              <Defs>
                <LinearGradient id="mm-sheen" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.12} />
                  <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0} />
                </LinearGradient>
              </Defs>
            )}
            <Path d={markPaths.tile} fill={c.tile} />
            {c.sheen && detail && <Path d={markPaths.tile} fill="url(#mm-sheen)" />}
            {detail &&
              rings.map((g, i) => (
                <Rect key={i} x={g.x + 6} y={tile.y + 38} width={g.w - 12} height={20} rx={10} fill={c.holes} opacity={0.55} />
              ))}
          </Layer>

          {/* Binder rings */}
          <Layer
            style={
              s === 'planning'
                ? {
                    animationName: ringBob,
                    animationDuration: 2200,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: cssEase.expo,
                  }
                : undefined
            }>
            <Path d={markPaths.rings} fill={c.accent} />
          </Layer>

          {/* The moment */}
          <Layer style={[origin(bigSpark.cx, bigSpark.cy), bigAnim]}>
            <Path d={markPaths.bigSpark} fill={c.spark} />
          </Layer>

          {glinting && detail && c.sheen && (
            <Layer style={[origin(bigSpark.cx, bigSpark.cy), glintLoop(flash)]}>
              <Path d={sparklePath(bigSpark.cx, bigSpark.cy, bigSpark.r * 0.42)} fill="#FFFFFF" />
            </Layer>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export const MomentsMark = memo(MomentsMarkImpl);

// ---- Crossfade between states (S2SMarkCrossfade port) -----------------------------------

const markIn = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.88 }] },
  100: { opacity: 1, transform: [{ scale: 1 }] },
}).duration(520);
const markOut = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 1.08 }] },
}).duration(360);

export function MomentsMarkCrossfade({ size = 96, state = 'idle', variant, color, style }: MomentsMarkProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View key={state} entering={markIn} exiting={markOut} style={StyleSheet.absoluteFill}>
        <MomentsMark size={size} state={state} variant={variant} color={color} />
      </Animated.View>
    </View>
  );
}
