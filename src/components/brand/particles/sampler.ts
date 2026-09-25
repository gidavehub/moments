import { BlendMode, FillType, PaintStyle, Skia, StrokeCap, StrokeJoin } from '@shopify/react-native-skia';

import { mulberry32 } from '@/lib/random';

import { shapes, type ShapeId } from './shapes';

/**
 * Turns a shape into N target points (512-grid space), once, on the JS thread:
 * rasterise → collect covered pixels (+ an edge-biased pass for crisp outlines) →
 * Morton-sort → golden-stride permutation. The same ordering is used for every shape, so
 * particle k lands in a comparable spot in each one and morphs read as choreography.
 */

export const NMAX = 3000;
const R = 256; // raster resolution (512 grid / 2)
const cache = new Map<string, Float32Array>();

function part1By1(n: number) {
  n &= 0x0000ffff;
  n = (n | (n << 8)) & 0x00ff00ff;
  n = (n | (n << 4)) & 0x0f0f0f0f;
  n = (n | (n << 2)) & 0x33333333;
  n = (n | (n << 1)) & 0x55555555;
  return n;
}
const morton = (x: number, y: number) => (part1By1(Math.floor(x)) | (part1By1(Math.floor(y)) << 1)) >>> 0;

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/** A bijective golden-ratio stride over [0, n): any prefix covers the whole ordering evenly. */
const strideCache = new Map<number, Int32Array>();
export function goldenStride(n: number) {
  let perm = strideCache.get(n);
  if (perm) return perm;
  let s = Math.round(n * 0.6180339887);
  while (gcd(s, n) !== 1) s++;
  perm = new Int32Array(n);
  for (let k = 0; k < n; k++) perm[k] = (k * s) % n;
  strideCache.set(n, perm);
  return perm;
}

function order(points: Float32Array, n: number) {
  const idx = Array.from({ length: n }, (_, i) => i);
  const keys = new Uint32Array(n);
  for (let i = 0; i < n; i++) keys[i] = morton((points[i * 2] / 512) * 1023, (points[i * 2 + 1] / 512) * 1023);
  idx.sort((a, b) => keys[a] - keys[b]);
  const perm = goldenStride(n);
  const out = new Float32Array(n * 2);
  for (let k = 0; k < n; k++) {
    const src = idx[perm[k]];
    out[k * 2] = points[src * 2];
    out[k * 2 + 1] = points[src * 2 + 1];
  }
  return out;
}

function rasterise(id: ShapeId): Uint8Array | null {
  const spec = shapes[id];
  const surface = Skia.Surface.Make(R, R);
  if (!surface) return null;
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color('transparent'));
  canvas.save();
  canvas.scale(R / 512, R / 512);
  if (spec.rotate) canvas.rotate(spec.rotate, 256, 256);
  for (const part of spec.parts) {
    const parsed = Skia.Path.MakeFromSVGString(part.d);
    if (!parsed) continue;
    // The S2S mark's counters are holes: even-odd, set through the builder (SkPath is immutable now).
    const path = id === 's2s' ? Skia.PathBuilder.MakeFromPath(parsed).setFillType(FillType.EvenOdd).detach() : parsed;
    const paint = Skia.Paint();
    paint.setAntiAlias(true);
    paint.setColor(Skia.Color('white'));
    if (part.width) {
      paint.setStyle(PaintStyle.Stroke);
      paint.setStrokeWidth(part.width);
      paint.setStrokeCap(StrokeCap.Round);
      paint.setStrokeJoin(StrokeJoin.Round);
    }
    if (part.mode === 'stroke') {
      paint.setStyle(PaintStyle.Stroke);
      paint.setStrokeWidth(part.width ?? 24);
      paint.setStrokeCap(StrokeCap.Round);
      paint.setStrokeJoin(StrokeJoin.Round);
    }
    if (part.mode === 'clear') paint.setBlendMode(BlendMode.Clear);
    canvas.drawPath(path, paint);
  }
  canvas.restore();
  surface.flush();
  const image = surface.makeImageSnapshot();
  const px = image.readPixels();
  return px instanceof Uint8Array ? px : px ? Uint8Array.from(px as Float32Array, (v) => Math.round(v * 255)) : null;
}

export function sampleShape(id: ShapeId, n = NMAX): Float32Array {
  const key = `${id}:${n}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const px = rasterise(id);
  const rand = mulberry32(id.length * 7919 + id.charCodeAt(0) * 131);
  const pts = new Float32Array(n * 2);

  if (!px) {
    // Canvas unavailable — fall back to a soft ring so nothing explodes.
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = 120 + rand() * 40;
      pts[i * 2] = 256 + Math.cos(a) * r;
      pts[i * 2 + 1] = 256 + Math.sin(a) * r;
    }
    return pts;
  }

  const alphaAt = (x: number, y: number) => (x < 0 || y < 0 || x >= R || y >= R ? 0 : px[(y * R + x) * 4 + 3]);
  const filled: number[] = [];
  const edges: number[] = [];
  for (let y = 0; y < R; y++) {
    for (let x = 0; x < R; x++) {
      if (alphaAt(x, y) > 128) {
        const i = y * R + x;
        filled.push(i);
        if (alphaAt(x - 1, y) <= 128 || alphaAt(x + 1, y) <= 128 || alphaAt(x, y - 1) <= 128 || alphaAt(x, y + 1) <= 128) {
          edges.push(i);
        }
      }
    }
  }
  if (!filled.length) return pts;

  const edgeShare = Math.min(shapes[id].edge ?? 0.25, edges.length / Math.max(1, filled.length) + 0.1);
  const nEdge = Math.round(n * edgeShare);
  for (let i = 0; i < n; i++) {
    const pool = i < nEdge && edges.length ? edges : filled;
    const cell = pool[Math.floor(rand() * pool.length)];
    const x = cell % R;
    const y = Math.floor(cell / R);
    pts[i * 2] = (x + rand()) * (512 / R);
    pts[i * 2 + 1] = (y + rand()) * (512 / R);
  }

  const out = order(pts, n);
  cache.set(key, out);
  return out;
}

/** The loose cloud particles gather from / scatter to. */
export function sampleCloud(n = NMAX, spread = 1): Float32Array {
  const key = `cloud:${n}:${spread}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rand = mulberry32(4242);
  const pts = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    // Gaussian-ish radial falloff, wider than tall.
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(-2 * Math.log(Math.max(1e-6, rand()))) * 0.42;
    pts[i * 2] = 256 + Math.cos(a) * r * 300 * spread;
    pts[i * 2 + 1] = 256 + Math.sin(a) * r * 360 * spread;
  }
  cache.set(key, pts);
  return pts;
}
