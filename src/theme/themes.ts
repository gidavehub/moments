import { alpha, brand, canvas, flare, ink } from './palette';

export interface StatePair {
  bg: string;
  fg: string;
  dot: string;
}

export interface ThemeColors {
  bg: string;
  bgSoft: string;
  bgSunk: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  hairline: string;
  border: string;
  navy: string;
  gold: string;
  goldText: string;
  onGold: string;
  primary: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  alert: string;
  discount: string;
  discountSoft: string;
  glassFill: string;
  glassStroke: string;
  glassHighlight: string;
  scrim: string;
  skeleton: string;
  skeletonShine: string;
  dotGrid: string;
  particle: string;
  state: { neutral: StatePair; gold: StatePair; green: StatePair; muted: StatePair };
}

export interface Theme {
  color: ThemeColors;
  shadow: Record<ShadowName, string>;
  gradient: Record<GradientName, string>;
}

export type ShadowName = 'none' | 'hairline' | 'plate' | 'lift' | 'float' | 'cathedral' | 'glass' | 'ring' | 'glow';
export type GradientName =
  | 'flareSheen'
  | 'inkSheen'
  | 'glassSheen'
  | 'halo'
  | 'scrimBottom'
  | 'scrimTop'
  | 'paperFade';

const n = (a: number) => alpha(brand.navy, a);

const paperShadow: Record<ShadowName, string> = {
  none: '0px 0px 0px 0px rgba(0,0,0,0)',
  hairline: `0px 0px 0px 1px ${n(0.06)}`,
  plate: `0px 1px 2px 0px ${n(0.04)}, 0px 4px 12px -2px ${n(0.06)}`,
  lift: `0px 2px 4px 0px ${n(0.04)}, 0px 12px 28px -6px ${n(0.12)}`,
  float: `0px 4px 8px 0px ${n(0.04)}, 0px 24px 48px -12px ${n(0.18)}`,
  cathedral: `0px 8px 16px 0px ${n(0.05)}, 0px 40px 80px -20px ${n(0.24)}`,
  glass: `0px 1px 2px 0px ${n(0.05)}, 0px 16px 40px -12px ${n(0.16)}`,
  ring: `0px 0px 0px 4px ${alpha(brand.gold, 0.18)}`,
  glow: `0px 10px 30px -6px ${alpha(brand.gold, 0.55)}`,
};

const gradients: Record<GradientName, string> = {
  flareSheen: `linear-gradient(135deg, ${flare[500]} 0%, ${brand.orange} 45%, ${flare[300]} 100%)`,
  inkSheen: `linear-gradient(150deg, #143755 0%, ${ink[900]} 55%, ${ink[950]} 100%)`,
  glassSheen: `linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.58) 100%)`,
  halo: `radial-gradient(circle at 50% 50%, ${alpha(brand.gold, 0.55)} 0%, ${alpha(brand.gold, 0.18)} 45%, ${alpha(brand.gold, 0)} 78%)`,
  scrimBottom: `linear-gradient(180deg, ${alpha(canvas.default, 0)} 0%, ${alpha(canvas.default, 0.96)} 100%)`,
  scrimTop: `linear-gradient(180deg, ${alpha(canvas.default, 0.94)} 0%, ${alpha(canvas.default, 0)} 100%)`,
  paperFade: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(8,31,55,0.72) 100%)`,
};

export const paper: Theme = {
  color: {
    bg: canvas.default,
    bgSoft: canvas.soft,
    bgSunk: canvas.sunk,
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    text: ink[950],
    textMuted: ink[500],
    textSubtle: ink[400],
    textInverse: '#FFFFFF',
    hairline: n(0.08),
    border: n(0.12),
    navy: ink[900],
    gold: brand.gold,
    // Gold is never text on paper (2.1:1). Where "gold text" is wanted we use the deep flare.
    goldText: flare[700],
    onGold: ink[950],
    primary: ink[900],
    onPrimary: '#FFFFFF',
    success: brand.success,
    successSoft: alpha(brand.success, 0.12),
    alert: brand.alert,
    discount: brand.discount,
    discountSoft: alpha(brand.discount, 0.1),
    glassFill: 'rgba(255,255,255,0.72)',
    glassStroke: n(0.06),
    glassHighlight: 'rgba(255,255,255,0.85)',
    scrim: alpha(ink[950], 0.32),
    skeleton: n(0.06),
    skeletonShine: 'rgba(255,255,255,0.7)',
    dotGrid: 'rgba(0,0,0,0.13)',
    particle: ink[900],
    state: {
      neutral: { bg: n(0.05), fg: ink[500], dot: ink[400] },
      gold: { bg: flare[100], fg: flare[800], dot: brand.gold },
      green: { bg: alpha(brand.success, 0.12), fg: '#2E7D32', dot: brand.success },
      muted: { bg: n(0.04), fg: ink[400], dot: ink[300] },
    },
  },
  shadow: paperShadow,
  gradient: gradients,
};

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  tile: 20,
  card: 24,
  lg: 28,
  panel: 32,
  hero: 40,
  full: 999,
} as const;

export const space = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/** Side gutter every screen uses. */
export const GUTTER = 20;
