/**
 * Moments mark geometry — "Sparkling day". A calendar tile (the plan) with gold binder rings
 * and one four-point sparkle at its heart (the moment — and the AI). Authored on a 512 grid,
 * optically centred, and tilted −5.66° like the Shop2Ship mark. (S2S orbits its globe with
 * satellite sparkles; the calendar doesn't need them.)
 */

export const MARK_VIEWBOX = 512;
export const MARK_TILT = -5.66;

export const tile = { x: 77, y: 113, w: 358, h: 335, r: 100 };
export const rings = [
  { x: 146, y: 64, w: 44, h: 95, r: 22 },
  { x: 322, y: 64, w: 44, h: 95, r: 22 },
];
export const bigSpark = { cx: 256, cy: 292, r: 92 };

/** Centre of the tile — the pivot for halos, shockwaves and page flips. */
export const tileCenter = { x: tile.x + tile.w / 2, y: tile.y + tile.h / 2 };

/**
 * Four-point sparkle: a cubic star whose arms pinch toward the centre. `waist` is the distance
 * (in radii) of the control points along the arm, `pinch` their offset off-axis.
 */
export function sparklePath(cx: number, cy: number, r: number, waist = 0.25, pinch = 0.1) {
  const w = r * waist;
  const p = r * pinch;
  const f = (n: number) => Math.round(n * 100) / 100;
  return [
    `M${f(cx)} ${f(cy - r)}`,
    `C${f(cx + p)} ${f(cy - w)} ${f(cx + w)} ${f(cy - p)} ${f(cx + r)} ${f(cy)}`,
    `C${f(cx + w)} ${f(cy + p)} ${f(cx + p)} ${f(cy + w)} ${f(cx)} ${f(cy + r)}`,
    `C${f(cx - p)} ${f(cy + w)} ${f(cx - w)} ${f(cy + p)} ${f(cx - r)} ${f(cy)}`,
    `C${f(cx - w)} ${f(cy - p)} ${f(cx - p)} ${f(cy - w)} ${f(cx)} ${f(cy - r)}`,
    'Z',
  ].join(' ');
}

export function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M${x + rr} ${y}`,
    `H${x + w - rr}`,
    `A${rr} ${rr} 0 0 1 ${x + w} ${y + rr}`,
    `V${y + h - rr}`,
    `A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}`,
    `H${x + rr}`,
    `A${rr} ${rr} 0 0 1 ${x} ${y + h - rr}`,
    `V${y + rr}`,
    `A${rr} ${rr} 0 0 1 ${x + rr} ${y}`,
    'Z',
  ].join(' ');
}

/** Rotate a point about the 512-grid centre by the mark tilt (for particle targets etc.). */
export function tilt(x: number, y: number, deg = MARK_TILT) {
  const a = (deg * Math.PI) / 180;
  const c = MARK_VIEWBOX / 2;
  const dx = x - c;
  const dy = y - c;
  return { x: c + dx * Math.cos(a) - dy * Math.sin(a), y: c + dx * Math.sin(a) + dy * Math.cos(a) };
}

/** SVG path strings of the whole mark (used by the particle sampler). */
export const markPaths = {
  tile: roundedRectPath(tile.x, tile.y, tile.w, tile.h, tile.r),
  rings: rings.map((g) => roundedRectPath(g.x, g.y, g.w, g.h, g.r)).join(' '),
  bigSpark: sparklePath(bigSpark.cx, bigSpark.cy, bigSpark.r),
};

export const pct = (v: number) => `${(v / MARK_VIEWBOX) * 100}%`;
