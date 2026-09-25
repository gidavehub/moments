import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { roundedRectPath, sparklePath } from '@/components/brand/geometry';
import { brand, flare, ink } from '@/theme';

/**
 * The Moments cast — hand-built on a 200×240 grid. Each character supplies:
 *  - `silhouette`: path strings for the white "sticker" outline drawn behind everything,
 *  - `art`: the flat-fill body with navy outline (DoMore style),
 *  - anchors for the rig: shoulders, hips, face.
 */

export const OUT = ink[900];
export const SW = 6;

export type CastName = 'mo' | 'dot' | 'tiers' | 'bloop' | 'pip';

export interface CastDef {
  name: CastName;
  label: string;
  silhouette: string[];
  art: () => React.ReactNode;
  shoulders: [number, number][];
  hips: [number, number][] | null;
  face: { x: number; y: number; dx: number; rx: number; ry: number; mouthDy: number; cheeks: boolean };
  armScale?: number;
  ground: number;
  /** A candle flame drawn on its own layer so it can flicker; `base` is where it meets the wick. */
  flame?: { outer: string; inner: string; base: [number, number] };
}

const cream = '#FFF7E6';
const creamShade = '#FBE6BF';
const blush = '#F9D6CE';
const coral = '#FF8F6E';

// ---- Mo: the gift box ---------------------------------------------------------------------

const moBody = roundedRectPath(44, 98, 112, 92, 22);
const moLid = roundedRectPath(36, 76, 128, 30, 14);
const moBowL = 'M100 72 C88 44 58 40 62 62 C64 74 86 76 100 72 Z';
const moBowR = 'M100 72 C112 44 142 40 138 62 C136 74 114 76 100 72 Z';

const mo: CastDef = {
  name: 'mo',
  label: 'Mo',
  silhouette: [moBody, moLid, moBowL, moBowR],
  shoulders: [
    [46, 140],
    [154, 140],
  ],
  hips: [
    [80, 188],
    [120, 188],
  ],
  face: { x: 100, y: 138, dx: 22, rx: 7.5, ry: 10.5, mouthDy: 21, cheeks: true },
  ground: 226,
  art: () => (
    <G>
      <Path d={moBody} fill={cream} />
      <Path d="M44 160 H156 V168 A22 22 0 0 1 134 190 H66 A22 22 0 0 1 44 168 Z" fill={creamShade} opacity={0.7} />
      <Path d={moBody} fill="none" stroke={OUT} strokeWidth={SW} />
      <Path d={moLid} fill={brand.gold} stroke={OUT} strokeWidth={SW} />
      <Rect x={92} y={76} width={16} height={30} fill={flare[600]} />
      <Path d={moLid} fill="none" stroke={OUT} strokeWidth={SW} />
      <Path d="M50 85 H72" stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={4} strokeLinecap="round" />
      <Path d="M95 76 C91 88 88 96 85 104 L94 100 Z" fill={brand.gold} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M105 76 C109 88 112 96 115 104 L106 100 Z" fill={brand.gold} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
      <Path d={moBowL} fill={brand.gold} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <Path d={moBowR} fill={brand.gold} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
      <Path d="M72 56 Q78 50 86 52" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Circle cx={100} cy={70} r={9} fill={flare[400]} stroke={OUT} strokeWidth={SW} />
    </G>
  ),
};

// ---- Dot: the calendar page --------------------------------------------------------------

const dotBody = roundedRectPath(48, 80, 104, 116, 20);
const dot: CastDef = {
  name: 'dot',
  label: 'Dot',
  silhouette: [dotBody, roundedRectPath(70, 62, 12, 32, 6), roundedRectPath(118, 62, 12, 32, 6)],
  shoulders: [
    [50, 146],
    [150, 146],
  ],
  hips: [
    [80, 196],
    [120, 196],
  ],
  face: { x: 100, y: 146, dx: 21, rx: 7, ry: 10, mouthDy: 20, cheeks: true },
  ground: 234,
  art: () => (
    <G>
      <Path d={dotBody} fill="#FFFFFF" />
      <Path d="M48 100 A20 20 0 0 1 68 80 H132 A20 20 0 0 1 152 100 V114 H48 Z" fill={ink[900]} />
      <Circle cx={80} cy={100} r={3.5} fill={flare[300]} />
      <Circle cx={100} cy={100} r={3.5} fill="#FFFFFF" opacity={0.75} />
      <Circle cx={120} cy={100} r={3.5} fill="#FFFFFF" opacity={0.75} />
      <Path d="M152 168 Q134 168 128 196 L138 196 Q152 194 152 180 Z" fill={ink[100]} />
      <Path d={dotBody} fill="none" stroke={OUT} strokeWidth={SW} />
      <Path d="M152 168 Q134 168 128 196" fill="none" stroke={OUT} strokeWidth={4} strokeLinecap="round" />
      <Path d={roundedRectPath(70, 62, 12, 32, 6)} fill={brand.gold} stroke={OUT} strokeWidth={4.5} />
      <Path d={roundedRectPath(118, 62, 12, 32, 6)} fill={brand.gold} stroke={OUT} strokeWidth={4.5} />
    </G>
  ),
};

// ---- Tiers: the cake ------------------------------------------------------------------------

function drips(x0: number, x1: number, y: number, depth: number, n: number) {
  const w = (x1 - x0) / n;
  let d = `M${x0} ${y - 6} H${x1} V${y}`;
  for (let i = n - 1; i >= 0; i--) {
    const xa = x0 + i * w;
    const deep = depth * (i % 2 === 0 ? 1 : 0.55);
    d += ` Q${xa + w * 0.75} ${y + deep} ${xa + w / 2} ${y + deep * 0.7} Q${xa + w * 0.25} ${y} ${xa} ${y}`;
  }
  return `${d} Z`;
}

const tierBottom = roundedRectPath(40, 146, 120, 58, 18);
const tierTop = roundedRectPath(60, 106, 80, 44, 14);
const tiers: CastDef = {
  name: 'tiers',
  label: 'Tiers',
  silhouette: [tierBottom, tierTop, roundedRectPath(95, 80, 10, 30, 3), 'M100 48 C110 60 111 68 100 76 C89 68 90 60 100 48 Z'],
  shoulders: [
    [42, 172],
    [158, 172],
  ],
  hips: [
    [80, 204],
    [120, 204],
  ],
  face: { x: 100, y: 178, dx: 22, rx: 6.5, ry: 9, mouthDy: 16, cheeks: true },
  ground: 238,
  armScale: 0.9,
  art: () => (
    <G>
      <Path d={tierBottom} fill={blush} />
      <Path d={drips(40, 160, 158, 12, 6)} fill="#FFFFFF" />
      <Path d={tierBottom} fill="none" stroke={OUT} strokeWidth={SW} />
      <Path d={tierTop} fill={cream} />
      <Path d={drips(60, 140, 118, 9, 4)} fill={blush} />
      <Path d={tierTop} fill="none" stroke={OUT} strokeWidth={SW} />
      {[
        [58, 190, brand.gold],
        [142, 192, ink[400]],
        [70, 122, coral],
        [128, 140, brand.gold],
      ].map(([x, y, c], i) => (
        <Rect key={i} x={x as number} y={y as number} width={9} height={4} rx={2} fill={c as string} transform={`rotate(${i * 37 - 30} ${x} ${y})`} />
      ))}
      <Path d={roundedRectPath(95, 80, 10, 30, 3)} fill={ink[50]} stroke={OUT} strokeWidth={4} />
      <Path d="M95 90 L105 86 M95 100 L105 96" stroke={brand.gold} strokeWidth={3} strokeLinecap="round" />
    </G>
  ),
  flame: {
    outer: 'M100 48 C110 60 111 68 100 76 C89 68 90 60 100 48 Z',
    inner: 'M100 58 C105 64 105 69 100 72 C95 69 95 64 100 58 Z',
    base: [100, 76],
  },
};

// ---- Bloop: the balloon ---------------------------------------------------------------------

const balloon = 'M100 42 C134 42 154 70 154 104 C154 140 128 166 100 166 C72 166 46 140 46 104 C46 70 66 42 100 42 Z';
const bloop: CastDef = {
  name: 'bloop',
  label: 'Bloop',
  silhouette: [balloon, 'M91 166 L109 166 L100 178 Z'],
  shoulders: [
    [50, 118],
    [150, 118],
  ],
  hips: null,
  face: { x: 100, y: 102, dx: 22, rx: 7.5, ry: 10.5, mouthDy: 21, cheeks: true },
  ground: 238,
  armScale: 0.72,
  art: () => (
    <G>
      <Path d="M100 178 C92 192 108 202 100 214 C94 222 102 230 100 236" stroke={OUT} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d={balloon} fill={coral} />
      <Path d="M100 166 C128 166 154 140 154 104 C154 92 151 81 146 72 C148 118 128 150 92 160 Z" fill="#E86F50" opacity={0.55} />
      <Path d={balloon} fill="none" stroke={OUT} strokeWidth={SW} />
      <Path d="M68 78 Q74 62 92 56" stroke="#FFFFFF" strokeOpacity={0.75} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M91 166 L109 166 L100 178 Z" fill={coral} stroke={OUT} strokeWidth={4.5} strokeLinejoin="round" />
    </G>
  ),
};

// ---- Pip: the envelope ----------------------------------------------------------------------

const pipBody = roundedRectPath(36, 102, 128, 88, 14);
const pip: CastDef = {
  name: 'pip',
  label: 'Pip',
  silhouette: [pipBody],
  shoulders: [
    [38, 152],
    [162, 152],
  ],
  hips: [
    [80, 190],
    [120, 190],
  ],
  face: { x: 100, y: 164, dx: 30, rx: 6.5, ry: 9, mouthDy: 15, cheeks: false },
  ground: 226,
  art: () => (
    <G>
      <Path d={pipBody} fill="#FFFFFF" />
      <Path d="M50 102 H150 A14 14 0 0 1 162 109 L100 150 L38 109 A14 14 0 0 1 50 102 Z" fill={ink[50]} />
      <Path d={pipBody} fill="none" stroke={OUT} strokeWidth={SW} />
      <Path d="M40 110 L100 150 L160 110" fill="none" stroke={OUT} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={100} cy={148} r={13} fill={brand.gold} stroke={OUT} strokeWidth={4} />
      <Path d={sparklePath(100, 148, 7)} fill="#FFFFFF" />
    </G>
  ),
};

export const cast: Record<CastName, CastDef> = { mo, dot, tiers, bloop, pip };

/** Shared bits the rig draws. */
export const eyeHighlight = (x: number, y: number) => <Circle cx={x - 2.4} cy={y - 3.4} r={2.3} fill="#FFFFFF" />;
export const cheek = (x: number, y: number) => <Ellipse cx={x} cy={y} rx={8} ry={5} fill={coral} opacity={0.4} />;
