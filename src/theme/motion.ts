import { css, cubicBezier, Easing, type CSSAnimationTimingFunction, type WithSpringConfig } from 'react-native-reanimated';

/**
 * Motion tokens — lifted from shop2ship-ui (tailwind-preset.cjs + styles.css) so Moments
 * moves like its parent. Worklet easings for shared-value animations, CSS easings for
 * Reanimated 4's declarative `animationName` API.
 */

export const ease = {
  expo: Easing.bezier(0.16, 1, 0.3, 1),
  spring: Easing.bezier(0.34, 1.4, 0.64, 1),
  quint: Easing.bezier(0.83, 0, 0.17, 1),
  exit: Easing.bezier(0.4, 0, 1, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** Every colour/opacity change (YOBUMA `fade()`). */
  outQuart: Easing.bezier(0.25, 1, 0.5, 1),
  /** Container transforms: fast out of the gate, long gentle settle (Material emphasized decelerate). */
  emphasizedIn: Easing.bezier(0.05, 0.7, 0.1, 1),
  /** …and the way back: eases off, then commits (emphasized accelerate). */
  emphasizedOut: Easing.bezier(0.3, 0, 0.8, 0.15),
};

export const cssEase = {
  expo: cubicBezier(0.16, 1, 0.3, 1),
  spring: cubicBezier(0.34, 1.4, 0.64, 1),
  quint: cubicBezier(0.83, 0, 0.17, 1),
  exit: cubicBezier(0.4, 0, 1, 1),
  inOut: cubicBezier(0.65, 0, 0.35, 1),
  outQuart: cubicBezier(0.25, 1, 0.5, 1),
  sine: cubicBezier(0.37, 0, 0.63, 1),
  linear: 'linear' as const,
};

export const duration = {
  fast: 250,
  base: 400,
  slow: 600,
  morph: 620,
  rise: 520,
  pop: 420,
  word: 760,
  /** Colour / opacity fades. */
  fade: 280,
} as const;

/**
 * Springs for anything that moves (YOBUMA's set, as stiffness/damping for mass 1: damping =
 * 2·ζ·√k). Colour and opacity changes use a 280ms `ease.outQuart` fade instead.
 */
export const spring = {
  /** The S2S particle spring (116 / 15) — soft, slightly under-damped. */
  soft: { stiffness: 116, damping: 15, mass: 1 } satisfies WithSpringConfig,
  /** Presses, toggles, selection (ζ 0.9). */
  snappy: { stiffness: 900, damping: 54, mass: 1 } satisfies WithSpringConfig,
  /** Layout and position (ζ 0.86). */
  standard: { stiffness: 420, damping: 35.2, mass: 1 } satisfies WithSpringConfig,
  /** Sheets, big surfaces, entrances (ζ 0.92). */
  gentle: { stiffness: 220, damping: 27.3, mass: 1 } satisfies WithSpringConfig,
  /** Stars, success, dialogs (ζ 0.52). */
  bouncy: { stiffness: 400, damping: 20.8, mass: 1 } satisfies WithSpringConfig,
  /** Draggable sheets settling on a stop (ζ 0.88). */
  sheet: { stiffness: 320, damping: 31.5, mass: 1 } satisfies WithSpringConfig,
  press: { stiffness: 900, damping: 54, mass: 1 } satisfies WithSpringConfig,
};

export const stagger = (i: number, step = 45, cap = 360) => Math.min(i * step, cap);

// ---- Declarative keyframes (built once at module scope) --------------------------------

export const kf = {
  riseIn: css.keyframes({
    from: { opacity: 0, transform: [{ translateY: 14 }, { scale: 0.985 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
  }),
  riseInLong: css.keyframes({
    from: { opacity: 0, transform: [{ translateY: 28 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  }),
  fadeIn: css.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } }),
  popIn: css.keyframes({
    '0%': { opacity: 0, transform: [{ scale: 0.86 }] },
    '60%': { opacity: 1, transform: [{ scale: 1.04 }] },
    '100%': { opacity: 1, transform: [{ scale: 1 }] },
  }),
  breathe: css.keyframes({
    '0%': { transform: [{ translateY: 0 }, { scale: 1 }] },
    '50%': { transform: [{ translateY: -3 }, { scale: 1.022 }] },
    '100%': { transform: [{ translateY: 0 }, { scale: 1 }] },
  }),
  float: css.keyframes({
    '0%': { transform: [{ translateY: 0 }] },
    '50%': { transform: [{ translateY: -8 }] },
    '100%': { transform: [{ translateY: 0 }] },
  }),
  spin: css.keyframes({
    from: { transform: [{ rotate: '0deg' }] },
    to: { transform: [{ rotate: '360deg' }] },
  }),
  pulseDot: css.keyframes({
    '0%': { opacity: 0.55, transform: [{ scale: 0.9 }] },
    '50%': { opacity: 1, transform: [{ scale: 1.1 }] },
    '100%': { opacity: 0.55, transform: [{ scale: 0.9 }] },
  }),
  ping: css.keyframes({
    from: { opacity: 0.7, transform: [{ scale: 1 }] },
    to: { opacity: 0, transform: [{ scale: 2.4 }] },
  }),
  halo: css.keyframes({
    from: { opacity: 0.8, transform: [{ scale: 0.72 }] },
    to: { opacity: 0, transform: [{ scale: 1.28 }] },
  }),
  twinkle: css.keyframes({
    '0%': { opacity: 0.5, transform: [{ scale: 0.9 }, { rotate: '0deg' }] },
    '50%': { opacity: 1, transform: [{ scale: 1.14 }, { rotate: '14deg' }] },
    '100%': { opacity: 0.5, transform: [{ scale: 0.9 }, { rotate: '0deg' }] },
  }),
  shimmer: css.keyframes({
    from: { transform: [{ translateX: '-100%' }] },
    to: { transform: [{ translateX: '100%' }] },
  }),
  caret: css.keyframes({
    '0%': { opacity: 1 },
    '50%': { opacity: 0 },
    '100%': { opacity: 1 },
  }),
  sway: css.keyframes({
    '0%': { transform: [{ rotate: '-4deg' }] },
    '50%': { transform: [{ rotate: '4deg' }] },
    '100%': { transform: [{ rotate: '-4deg' }] },
  }),
  bob: css.keyframes({
    '0%': { transform: [{ translateY: 0 }] },
    '50%': { transform: [{ translateY: -4 }] },
    '100%': { transform: [{ translateY: 0 }] },
  }),
};

/** A one-shot entrance: `{...enter(kf.riseIn, 120)}` spread into an Animated style. */
export function enter(
  name: (typeof kf)[keyof typeof kf],
  delay = 0,
  dur: number = duration.rise,
  timing: CSSAnimationTimingFunction = cssEase.expo,
) {
  return {
    animationName: name,
    animationDuration: dur,
    animationDelay: delay,
    animationTimingFunction: timing,
    animationFillMode: 'backwards' as const,
  };
}

/** An infinite loop: `{...loop(kf.breathe, 4500)}`. */
export function loop(
  name: (typeof kf)[keyof typeof kf],
  dur: number,
  delay = 0,
  timing: CSSAnimationTimingFunction = cssEase.sine,
) {
  return {
    animationName: name,
    animationDuration: dur,
    animationDelay: delay,
    animationTimingFunction: timing,
    animationIterationCount: 'infinite' as const,
  };
}
