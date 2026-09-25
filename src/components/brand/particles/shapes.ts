import { MARK_TILT, markPaths, roundedRectPath, sparklePath } from '../geometry';
import { LOGO_PATHS } from '../s2s-logo-paths';

/**
 * Particle "chapters": each is line art on a 512 grid that the sampler rasterises once and
 * turns into target points. Strokes are thick so particles have room to settle into them.
 */

export interface ShapePart {
  d: string;
  mode: 'fill' | 'stroke' | 'clear';
  width?: number;
}

export interface ShapeSpec {
  id: ShapeId;
  parts: ShapePart[];
  /** Rotate the whole shape (degrees) about the grid centre while rasterising. */
  rotate?: number;
  /** Fraction of points biased to edges (crisper outlines). */
  edge?: number;
}

export type ShapeId =
  | 'gift'
  | 'calendar'
  | 'mark'
  | 'envelope'
  | 'checklist'
  | 'store'
  | 'buyer'
  | 'tag'
  | 's2s'
  | 'heart';

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;

export const shapes: Record<ShapeId, ShapeSpec> = {
  gift: {
    id: 'gift',
    edge: 0.3,
    parts: [
      { d: roundedRectPath(124, 250, 264, 186, 34), mode: 'fill' },
      { d: roundedRectPath(104, 178, 304, 62, 26), mode: 'fill' },
      { d: 'M256 176 C226 104 150 94 160 150 C166 182 222 188 256 176 Z', mode: 'fill' },
      { d: 'M256 176 C286 104 362 94 352 150 C346 182 290 188 256 176 Z', mode: 'fill' },
      { d: roundedRectPath(236, 178, 40, 258, 6), mode: 'clear' },
      { d: roundedRectPath(244, 178, 24, 258, 4), mode: 'fill' },
    ],
  },
  calendar: {
    id: 'calendar',
    edge: 0.35,
    parts: [
      { d: roundedRectPath(100, 150, 312, 290, 60), mode: 'stroke', width: 30 },
      { d: 'M100 232 H412', mode: 'stroke', width: 24 },
      { d: roundedRectPath(170, 100, 36, 88, 18), mode: 'fill' },
      { d: roundedRectPath(306, 100, 36, 88, 18), mode: 'fill' },
      { d: circle(178, 298, 19), mode: 'fill' },
      { d: circle(256, 298, 19), mode: 'fill' },
      { d: circle(334, 298, 19), mode: 'fill' },
      { d: circle(178, 372, 19), mode: 'fill' },
      { d: sparklePath(256, 372, 44), mode: 'fill' },
      { d: circle(334, 372, 19), mode: 'fill' },
    ],
  },
  mark: {
    id: 'mark',
    rotate: MARK_TILT,
    edge: 0.25,
    parts: [
      { d: roundedRectPath(95, 131, 322, 299, 82), mode: 'stroke', width: 36 },
      { d: sparklePath(256, 292, 98), mode: 'fill' },
      { d: markPaths.rings, mode: 'fill' },
    ],
  },
  envelope: {
    id: 'envelope',
    edge: 0.35,
    parts: [
      { d: roundedRectPath(84, 150, 344, 232, 36), mode: 'stroke', width: 30 },
      { d: 'M100 170 L256 290 L412 170', mode: 'stroke', width: 26 },
      { d: circle(256, 290, 36), mode: 'fill' },
    ],
  },
  checklist: {
    id: 'checklist',
    edge: 0.35,
    parts: [
      { d: roundedRectPath(120, 112, 272, 320, 40), mode: 'stroke', width: 28 },
      { d: roundedRectPath(196, 84, 120, 58, 24), mode: 'fill' },
      { d: roundedRectPath(164, 190, 48, 48, 12), mode: 'stroke', width: 18 },
      { d: 'M174 212 L186 226 L206 200', mode: 'stroke', width: 16 },
      { d: 'M238 214 H350', mode: 'stroke', width: 22 },
      { d: roundedRectPath(164, 272, 48, 48, 12), mode: 'stroke', width: 18 },
      { d: 'M174 294 L186 308 L206 282', mode: 'stroke', width: 16 },
      { d: 'M238 296 H330', mode: 'stroke', width: 22 },
      { d: roundedRectPath(164, 354, 48, 48, 12), mode: 'stroke', width: 18 },
      { d: 'M238 378 H310', mode: 'stroke', width: 22 },
    ],
  },
  store: {
    id: 'store',
    edge: 0.3,
    parts: [
      { d: 'M96 150 H376 L400 208 H72 Z', mode: 'fill' },
      { d: circle(110, 214, 22), mode: 'fill' },
      { d: circle(166, 214, 22), mode: 'fill' },
      { d: circle(222, 214, 22), mode: 'fill' },
      { d: circle(278, 214, 22), mode: 'fill' },
      { d: circle(334, 214, 22), mode: 'fill' },
      { d: roundedRectPath(96, 236, 256, 190, 18), mode: 'stroke', width: 24 },
      { d: roundedRectPath(186, 314, 72, 112, 12), mode: 'fill' },
      { d: circle(362, 318, 78), mode: 'clear' },
      { d: circle(362, 318, 64), mode: 'stroke', width: 28 },
      { d: 'M410 366 L452 408', mode: 'stroke', width: 38 },
    ],
  },
  buyer: {
    id: 'buyer',
    edge: 0.3,
    parts: [
      { d: roundedRectPath(292, 120, 150, 306, 20), mode: 'stroke', width: 26 },
      { d: circle(408, 282, 13), mode: 'fill' },
      { d: circle(168, 162, 36), mode: 'fill' },
      { d: 'M168 214 L178 318', mode: 'stroke', width: 48 },
      { d: 'M170 236 L124 292', mode: 'stroke', width: 26 },
      { d: 'M178 238 L226 284', mode: 'stroke', width: 26 },
      { d: 'M178 318 L140 410', mode: 'stroke', width: 30 },
      { d: 'M180 318 L224 404', mode: 'stroke', width: 30 },
      { d: roundedRectPath(214, 282, 56, 60, 12), mode: 'fill' },
    ],
  },
  tag: {
    id: 'tag',
    rotate: -14,
    edge: 0.3,
    parts: [
      { d: 'M96 256 L180 164 H400 A26 26 0 0 1 426 190 V322 A26 26 0 0 1 400 348 H180 Z', mode: 'fill' },
      { d: circle(176, 256, 26), mode: 'clear' },
      { d: 'M314 200 V312', mode: 'clear', width: 18 },
      { d: 'M346 220 C322 198 276 206 278 232 C280 258 346 252 346 282 C346 312 296 314 272 294', mode: 'clear', width: 22 },
    ],
  },
  s2s: {
    id: 's2s',
    edge: 0.2,
    parts: [{ d: LOGO_PATHS[0].d, mode: 'fill' }, { d: LOGO_PATHS[1].d, mode: 'clear' }],
  },
  heart: {
    id: 'heart',
    edge: 0.3,
    parts: [
      {
        d: 'M256 420 C168 350 96 292 96 212 C96 160 136 124 184 124 C216 124 242 142 256 168 C270 142 296 124 328 124 C376 124 416 160 416 212 C416 292 344 350 256 420 Z',
        mode: 'fill',
      },
    ],
  },
};
