import { memo, useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  css,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { sparklePath } from '@/components/brand/geometry';
import { useLive } from '@/hooks/use-live';
import { brand, cssEase, flare, ink, spring, tints } from '@/theme';

import { cast, cheek, eyeHighlight, OUT, SW, type CastName } from './cast';
import { poseExpression, poses, type Expression, type LimbPose, type PoseName } from './poses';

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const AEllipse = Animated.createAnimatedComponent(Ellipse);

export type CharacterProp = 'none' | 'bag' | 'confetti' | 'zzz' | 'sparkles' | 'calendar';

export interface CharacterProps {
  kind?: CastName;
  pose?: PoseName;
  expression?: Expression;
  size?: number;
  sticker?: boolean;
  prop?: CharacterProp;
  /** Freeze all motion (lists, thumbnails). */
  still?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TAU = Math.PI * 2;

interface LimbSV {
  a: SharedValue<number>;
  bend: SharedValue<number>;
  len: SharedValue<number>;
  amp: SharedValue<number>;
  off: SharedValue<number>;
}

function useLimb(p: LimbPose, scale: number): LimbSV {
  const a = useSharedValue(p.a);
  const bend = useSharedValue(p.bend);
  const len = useSharedValue(p.len * scale);
  const amp = useSharedValue(p.amp);
  const off = useSharedValue(p.off);
  useEffect(() => {
    a.set(withSpring(p.a, spring.soft));
    bend.set(withSpring(p.bend, spring.soft));
    len.set(withSpring(p.len * scale, spring.soft));
    amp.set(withTiming(p.amp, { duration: 300 }));
    off.set(p.off);
  }, [p.a, p.bend, p.len, p.amp, p.off, scale, a, bend, len, amp, off]);
  return { a, bend, len, amp, off };
}

/** Hand/foot position + quadratic "noodle" path for a limb, on the UI thread. */
function limbGeom(sx: number, sy: number, side: number, l: LimbSV, phase: number) {
  'worklet';
  const ang = ((l.a.get() + l.amp.get() * Math.sin(TAU * (phase + l.off.get()))) * Math.PI) / 180;
  const len = l.len.get();
  const hx = sx + Math.sin(ang) * len * side;
  const hy = sy + Math.cos(ang) * len;
  const dx = hx - sx;
  const dy = hy - sy;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  const bend = l.bend.get();
  const cx = (sx + hx) / 2 + (-dy / d) * bend * side;
  const cy = (sy + hy) / 2 + (dx / d) * bend * side;
  return { hx, hy, path: `M${sx} ${sy} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}` };
}

function Limb({
  sx,
  sy,
  side,
  limb,
  phase,
  kind,
  sticker,
}: {
  sx: number;
  sy: number;
  side: number;
  limb: LimbSV;
  phase: SharedValue<number>;
  kind: 'arm' | 'leg';
  sticker: boolean;
}) {
  const pathProps = useAnimatedProps(() => ({ d: limbGeom(sx, sy, side, limb, phase.get()).path }));
  const endProps = useAnimatedProps(() => {
    const g = limbGeom(sx, sy, side, limb, phase.get());
    return kind === 'arm' ? { cx: g.hx, cy: g.hy } : { cx: g.hx + side * 5, cy: g.hy + 1 };
  });
  const w = kind === 'arm' ? 7 : 7.5;
  if (sticker) {
    return (
      <G>
        <APath animatedProps={pathProps} stroke="#FFFFFF" strokeWidth={w + 10} strokeLinecap="round" fill="none" />
        {kind === 'arm' ? (
          <ACircle animatedProps={endProps} r={6.5 + 5} fill="#FFFFFF" />
        ) : (
          <AEllipse animatedProps={endProps} rx={11.5 + 5} ry={6.5 + 5} fill="#FFFFFF" />
        )}
      </G>
    );
  }
  return (
    <G>
      <APath animatedProps={pathProps} stroke={OUT} strokeWidth={w} strokeLinecap="round" fill="none" />
      {kind === 'arm' ? (
        <ACircle animatedProps={endProps} r={6.5} fill={OUT} />
      ) : (
        <AEllipse animatedProps={endProps} rx={11.5} ry={6.5} fill={OUT} />
      )}
    </G>
  );
}

function Eye({ x, y, rx, ry, blink }: { x: number; y: number; rx: number; ry: number; blink: SharedValue<number> }) {
  const props = useAnimatedProps(() => ({ ry: Math.max(0.8, ry * blink.get()) }));
  return (
    <G>
      <AEllipse cx={x} cy={y} rx={rx} animatedProps={props} fill={OUT} />
      {eyeHighlight(x, y)}
    </G>
  );
}

function Face({ kind, expression, blink }: { kind: CastName; expression: Expression; blink: SharedValue<number> }) {
  const f = cast[kind].face;
  const lx = f.x - f.dx;
  const rx = f.x + f.dx;
  const my = f.y + f.mouthDy;
  const arc = (x: number, up: boolean) =>
    up ? `M${x - 7.5} ${f.y + 3} Q${x} ${f.y - 8} ${x + 7.5} ${f.y + 3}` : `M${x - 7.5} ${f.y} Q${x} ${f.y + 7} ${x + 7.5} ${f.y}`;

  const eyes =
    expression === 'happy' ? (
      <>
        <Path d={arc(lx, true)} stroke={OUT} strokeWidth={4.5} strokeLinecap="round" fill="none" />
        <Path d={arc(rx, true)} stroke={OUT} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      </>
    ) : expression === 'sleepy' ? (
      <>
        <Path d={arc(lx, false)} stroke={OUT} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d={arc(rx, false)} stroke={OUT} strokeWidth={4} strokeLinecap="round" fill="none" />
      </>
    ) : expression === 'wink' ? (
      <>
        <Eye x={lx} y={f.y} rx={f.rx} ry={f.ry} blink={blink} />
        <Path d={arc(rx, true)} stroke={OUT} strokeWidth={4.5} strokeLinecap="round" fill="none" />
      </>
    ) : (
      <>
        <Eye x={lx} y={f.y} rx={f.rx} ry={expression === 'wow' ? f.ry * 1.15 : f.ry} blink={blink} />
        <Eye x={rx} y={f.y} rx={f.rx} ry={expression === 'wow' ? f.ry * 1.15 : f.ry} blink={blink} />
      </>
    );

  const brows =
    expression === 'focus' ? (
      <>
        <Path d={`M${lx - 8} ${f.y - f.ry - 6} L${lx + 6} ${f.y - f.ry - 3}`} stroke={OUT} strokeWidth={4} strokeLinecap="round" />
        <Path d={`M${rx + 8} ${f.y - f.ry - 6} L${rx - 6} ${f.y - f.ry - 3}`} stroke={OUT} strokeWidth={4} strokeLinecap="round" />
      </>
    ) : null;

  const mouth =
    expression === 'happy' ? (
      <G>
        <Path d={`M${f.x - 11} ${my - 2} Q${f.x} ${my + 16} ${f.x + 11} ${my - 2} Z`} fill={OUT} stroke={OUT} strokeWidth={3} strokeLinejoin="round" />
        <Ellipse cx={f.x} cy={my + 6} rx={5} ry={3} fill="#FF8F6E" />
      </G>
    ) : expression === 'wow' ? (
      <Ellipse cx={f.x} cy={my + 2} rx={6} ry={7.5} fill={OUT} />
    ) : expression === 'sleepy' ? (
      <Path d={`M${f.x - 5} ${my} Q${f.x} ${my + 4} ${f.x + 5} ${my}`} stroke={OUT} strokeWidth={4} strokeLinecap="round" fill="none" />
    ) : expression === 'focus' ? (
      <Path d={`M${f.x - 7} ${my} Q${f.x} ${my + 4} ${f.x + 7} ${my}`} stroke={OUT} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    ) : (
      <Path d={`M${f.x - 9} ${my - 2} Q${f.x} ${my + 9} ${f.x + 9} ${my - 2}`} stroke={OUT} strokeWidth={4.5} strokeLinecap="round" fill="none" />
    );

  return (
    <G>
      {f.cheeks && expression !== 'focus' ? (
        <>
          {cheek(lx - 6, f.y + 14)}
          {cheek(rx + 6, f.y + 14)}
        </>
      ) : null}
      {brows}
      {eyes}
      {mouth}
    </G>
  );
}

function Bag() {
  return (
    <G>
      <Path d="M86 170 Q86 152 100 152 Q114 152 114 170" stroke={OUT} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <Path d="M70 168 H130 L135 212 H65 Z" fill={ink[900]} stroke="#FFFFFF" strokeWidth={3} strokeLinejoin="round" />
      <Path d={sparklePath(100, 190, 11)} fill={brand.gold} />
    </G>
  );
}

function MiniCalendar({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Rect x={x - 14} y={y - 14} width={28} height={28} rx={7} fill="#FFFFFF" stroke={OUT} strokeWidth={4} />
      <Rect x={x - 14} y={y - 14} width={28} height={9} rx={4} fill={ink[900]} />
      <Path d={sparklePath(x, y + 4, 6)} fill={brand.gold} />
    </G>
  );
}

const confettiDrift = css.keyframes({
  '0%': { opacity: 0.4, transform: [{ translateY: 6 }, { rotate: '-6deg' }] },
  '50%': { opacity: 1, transform: [{ translateY: -6 }, { rotate: '6deg' }] },
  '100%': { opacity: 0.4, transform: [{ translateY: 6 }, { rotate: '-6deg' }] },
});
const zzzRise = css.keyframes({
  '0%': { opacity: 0, transform: [{ translateY: 10 }, { translateX: -4 }] },
  '30%': { opacity: 1 },
  '100%': { opacity: 0, transform: [{ translateY: -18 }, { translateX: 8 }] },
});
const bobKf = new Map<number, ReturnType<typeof css.keyframes>>();
function bobFor(amp: number) {
  let k = bobKf.get(amp);
  if (!k) {
    k = css.keyframes({
      '0%': { transform: [{ translateY: 0 }, { scaleY: 1 }] },
      '50%': { transform: [{ translateY: -amp }, { scaleY: 1.015 }] },
      '100%': { transform: [{ translateY: 0 }, { scaleY: 1 }] },
    });
    bobKf.set(amp, k);
  }
  return k;
}
const sway = css.keyframes({
  '0%': { transform: [{ rotate: '-5deg' }] },
  '50%': { transform: [{ rotate: '5deg' }] },
  '100%': { transform: [{ rotate: '-5deg' }] },
});

// Candle flame: uneven stretch-and-lean (never a clean sine) with a quicker core and a warm halo.
const flicker = css.keyframes({
  '0%': { transform: [{ scaleX: 1 }, { scaleY: 1 }, { rotate: '0deg' }] },
  '16%': { transform: [{ scaleX: 0.93 }, { scaleY: 1.12 }, { rotate: '-4deg' }] },
  '31%': { transform: [{ scaleX: 1.05 }, { scaleY: 0.94 }, { rotate: '2deg' }] },
  '49%': { transform: [{ scaleX: 0.97 }, { scaleY: 1.07 }, { rotate: '-1deg' }] },
  '66%': { transform: [{ scaleX: 1.06 }, { scaleY: 0.91 }, { rotate: '3deg' }] },
  '83%': { transform: [{ scaleX: 0.95 }, { scaleY: 1.09 }, { rotate: '-2deg' }] },
  '100%': { transform: [{ scaleX: 1 }, { scaleY: 1 }, { rotate: '0deg' }] },
});
const coreFlicker = css.keyframes({
  '0%': { opacity: 1, transform: [{ scaleY: 1 }] },
  '40%': { opacity: 0.7, transform: [{ scaleY: 0.86 }] },
  '70%': { opacity: 0.95, transform: [{ scaleY: 1.1 }] },
  '100%': { opacity: 1, transform: [{ scaleY: 1 }] },
});
const halo = css.keyframes({
  '0%': { opacity: 0.3, transform: [{ scale: 0.92 }] },
  '50%': { opacity: 0.55, transform: [{ scale: 1.08 }] },
  '100%': { opacity: 0.3, transform: [{ scale: 0.92 }] },
});

function Flame({ outer, inner, base, frozen }: NonNullable<(typeof cast)[CastName]['flame']> & { frozen: boolean }) {
  const origin = { transformOrigin: `${(base[0] / 200) * 100}% ${(base[1] / 240) * 100}%` };
  const loop = (name: typeof flicker, ms: number, delay = 0) =>
    frozen
      ? null
      : { animationName: name, animationDuration: ms, animationDelay: delay, animationIterationCount: 'infinite' as const, animationTimingFunction: cssEase.sine };
  const [hx, hy] = [base[0], base[1] - 14];
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: `${(hx / 200) * 100}% ${(hy / 240) * 100}%` }, loop(halo, 1400)]}>
        <Svg width="100%" height="100%" viewBox="0 0 200 240">
          <Circle cx={hx} cy={hy} r={22} fill={brand.gold} opacity={0.35} />
          <Circle cx={hx} cy={hy} r={13} fill={flare[200]} opacity={0.5} />
        </Svg>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, origin, loop(flicker, 920)]}>
        <Svg width="100%" height="100%" viewBox="0 0 200 240">
          <Path d={outer} fill={brand.orange} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        </Svg>
        <Animated.View style={[StyleSheet.absoluteFill, origin, loop(coreFlicker, 610, 120)]}>
          <Svg width="100%" height="100%" viewBox="0 0 200 240">
            <Path d={inner} fill={flare[200]} />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const CONFETTI = [
  { x: 22, y: 40, c: brand.gold, r: 20 },
  { x: 176, y: 34, c: '#FF8F6E', r: -30 },
  { x: 36, y: 96, c: ink[400], r: 45 },
  { x: 168, y: 92, c: brand.gold, r: 10 },
  { x: 60, y: 16, c: tints.trip.deep, r: -15 },
  { x: 142, y: 12, c: tints.gift.deep, r: 35 },
  { x: 10, y: 150, c: '#FF8F6E', r: 60 },
  { x: 190, y: 146, c: tints.babyShower.deep, r: -40 },
];

function CharacterImpl({
  kind = 'mo',
  pose = 'idle',
  expression,
  size = 160,
  sticker = true,
  prop = 'none',
  still,
  style,
}: CharacterProps) {
  const live = useLive();
  const frozen = still || !live;
  const def = cast[kind];
  const p = poses[pose];
  const expr = expression ?? poseExpression[pose];
  const scale = def.armScale ?? 1;

  const armL = useLimb(p.armL, scale);
  const armR = useLimb(p.armR, scale);
  const legL = useLimb(p.legL, 1);
  const legR = useLimb(p.legR, 1);

  const phase = useSharedValue(0);
  const blink = useSharedValue(1);

  useEffect(() => {
    if (frozen) {
      phase.set(0);
      return;
    }
    phase.set(0);
    phase.set(withRepeat(withTiming(1, { duration: p.period, easing: Easing.linear }), -1, false));
  }, [frozen, p.period, phase]);

  useEffect(() => {
    if (frozen || expr === 'happy' || expr === 'sleepy') return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          blink.set(withSequence(withTiming(0.1, { duration: 70 }), withTiming(1, { duration: 150 })));
          schedule();
        },
        3500 + Math.random() * 2500,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, [frozen, expr, blink]);

  const [sl, sr] = def.shoulders;
  const hips = def.hips;
  const W = size;
  const H = size * 1.2;
  const handL = { x: sl[0], y: sl[1] };

  const limbs = (stk: boolean) => (
    <>
      {hips && (
        <>
          <Limb sx={hips[0][0]} sy={hips[0][1]} side={-1} limb={legL} phase={phase} kind="leg" sticker={stk} />
          <Limb sx={hips[1][0]} sy={hips[1][1]} side={1} limb={legR} phase={phase} kind="leg" sticker={stk} />
        </>
      )}
    </>
  );
  const arms = (stk: boolean) => (
    <>
      <Limb sx={sl[0]} sy={sl[1]} side={-1} limb={armL} phase={phase} kind="arm" sticker={stk} />
      <Limb sx={sr[0]} sy={sr[1]} side={1} limb={armR} phase={phase} kind="arm" sticker={stk} />
    </>
  );

  const bobStyle =
    frozen || !p.bob
      ? null
      : kind === 'bloop'
        ? {
            transformOrigin: '50% 100%',
            animationName: sway,
            animationDuration: p.bob * 1.6,
            animationIterationCount: 'infinite' as const,
            animationTimingFunction: cssEase.sine,
          }
        : {
            transformOrigin: '50% 100%',
            animationName: bobFor(p.bobAmp),
            animationDuration: p.bob,
            animationIterationCount: 'infinite' as const,
            animationTimingFunction: cssEase.sine,
          };

  return (
    <View style={[{ width: W, height: H }, style]} accessibilityRole="image" accessibilityLabel={def.label}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 200 240">
        <Ellipse cx={100} cy={def.ground} rx={kind === 'bloop' ? 22 : 50} ry={6} fill={ink[900]} opacity={0.12} />
      </Svg>

      {prop === 'confetti' && (
        <Animated.View
          style={[StyleSheet.absoluteFill, !frozen && { animationName: confettiDrift, animationDuration: 1800, animationIterationCount: 'infinite', animationTimingFunction: cssEase.sine }]}>
          <Svg width="100%" height="100%" viewBox="0 0 200 240">
            {CONFETTI.map((c, i) =>
              i % 2 ? (
                <Circle key={i} cx={c.x} cy={c.y} r={4.5} fill={c.c} />
              ) : (
                <Rect key={i} x={c.x} y={c.y} width={12} height={5} rx={2.5} fill={c.c} transform={`rotate(${c.r} ${c.x} ${c.y})`} />
              ),
            )}
          </Svg>
        </Animated.View>
      )}

      <Animated.View style={[StyleSheet.absoluteFill, bobStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 200 240">
          {sticker && (
            <G>
              {limbs(true)}
              {arms(true)}
              {def.silhouette.map((d, i) => (
                <Path key={i} d={d} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={SW + 10} strokeLinejoin="round" />
              ))}
            </G>
          )}
          {limbs(false)}
          {def.art()}
          <Face kind={kind} expression={expr} blink={blink} />
          {prop === 'bag' && <Bag />}
          {arms(false)}
          {prop === 'calendar' && <MiniCalendar x={handL.x - 18} y={handL.y + 30} />}
          {prop === 'sparkles' && (
            <G>
              <Path d={sparklePath(176, 40, 12)} fill={brand.gold} stroke={OUT} strokeWidth={2.5} />
              <Path d={sparklePath(160, 16, 7)} fill={flare[300]} />
              <Path d={sparklePath(188, 70, 6)} fill={brand.gold} />
            </G>
          )}
        </Svg>
        {def.flame && <Flame {...def.flame} frozen={frozen} />}
      </Animated.View>

      {prop === 'zzz' && (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                StyleSheet.absoluteFill,
                !frozen && {
                  animationName: zzzRise,
                  animationDuration: 2400,
                  animationDelay: i * 800,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: cssEase.sine,
                },
              ]}>
              <Svg width="100%" height="100%" viewBox="0 0 200 240">
                <Path
                  d={`M${150 + i * 10} ${60 - i * 16} h${8 + i * 3} l-${8 + i * 3} ${9 + i * 3} h${8 + i * 3}`}
                  stroke={ink[400]}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </Svg>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}

export const Character = memo(CharacterImpl);
