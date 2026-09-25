'use no memo';
import {
  Atlas,
  Canvas,
  Circle,
  Group,
  Path,
  RadialGradient,
  rect,
  Skia,
  useRSXformBuffer,
  useTexture,
  vec,
  type SkColor,
} from '@shopify/react-native-skia';
import { useIsFocused } from 'expo-router';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { brand, flare, ink } from '@/theme';

import { sparklePath } from '../geometry';
import { sampleCloud, sampleShape } from './sampler';
import type { ShapeId } from './shapes';
import { particleBudget, PROBE_FRAMES, PROBE_WARMUP, SLOW_FRAME_MS, stepDown } from './tiers';

export type Chapter = ShapeId | 'cloud';
export type FieldLook = 'paper' | 'ink';

export interface ParticleFieldProps {
  width: number;
  height: number;
  /** Every chapter this field may visit (sampled up front). */
  chapters: Chapter[];
  /** The chapter to show now. Changing it morphs; changes mid-morph queue. */
  chapter: Chapter;
  look?: FieldLook;
  /** Fraction of min(width, height) the 512 grid occupies. */
  fit?: number;
  /** Keep a gentle swirl running while holding a shape. */
  alive?: boolean;
  morphMs?: number;
  interactive?: boolean;
  onArrive?: (chapter: Chapter) => void;
  style?: StyleProp<ViewStyle>;
}

const SPRITE = 32;

const PAPER = [ink[900], ink[900], ink[800], ink[700], ink[600], brand.gold, brand.gold, flare[400]];
const INK = [brand.gold, brand.gold, brand.gold, flare[300], flare[200], '#FFF4DA', brand.orange, '#94DBFF'];

function ParticleFieldImpl({
  width,
  height,
  chapters,
  chapter,
  look = 'paper',
  fit = 0.78,
  alive = true,
  morphMs = 1500,
  interactive = true,
  onArrive,
  style,
}: ParticleFieldProps) {
  const [n, setN] = useState(particleBudget);
  const focused = useIsFocused();
  const running = alive && focused;
  const chapterKey = chapters.join('|');

  // ---- targets (sampled once per chapter list) -------------------------------------------
  const { field, slots } = useMemo(() => {
    const list: Chapter[] = ['cloud', ...chapters.filter((c) => c !== 'cloud')];
    const out = new Array<number>(list.length * n * 2);
    const idx: Record<string, number> = {};
    list.forEach((c, ci) => {
      const pts = c === 'cloud' ? sampleCloud() : sampleShape(c);
      idx[c] = ci;
      // NMAX-ordered with a golden stride, so the first n points cover the whole shape.
      for (let i = 0; i < n * 2; i++) out[ci * n * 2 + i] = pts[i];
    });
    return { field: { pts: out, stride: n * 2 }, slots: idx };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, chapterKey]);

  const seeds = useMemo(() => {
    const s = new Array<number>(n * 2);
    for (let i = 0; i < n; i++) {
      const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
      const y = Math.sin(i * 269.5 + 183.3) * 43758.5453;
      s[i * 2] = x - Math.floor(x);
      s[i * 2 + 1] = y - Math.floor(y);
    }
    return s;
  }, [n]);

  const targets = useSharedValue(field);
  const seedSV = useSharedValue(seeds);
  useEffect(() => {
    targets.set(field);
  }, [field, targets]);
  useEffect(() => {
    seedSV.set(seeds);
  }, [seeds, seedSV]);

  const from = useSharedValue(slots[chapter] ?? 0);
  const to = useSharedValue(slots[chapter] ?? 0);
  const p = useSharedValue(1);
  const clock = useSharedValue(0);
  const touch = useSharedValue({ x: 0, y: 0, on: 0 });

  const k = (Math.min(width, height) * fit) / 512;
  const ox = (width - 512 * k) / 2;
  const oy = (height - 512 * k) / 2;
  const geo = useSharedValue({ k, ox, oy });
  useEffect(() => {
    geo.set({ k, ox, oy });
  }, [k, ox, oy, geo]);

  // Frame-time guard: after a short warm-up, average the next PROBE_FRAMES frames. Too slow
  // for this device → step down a tier (fewer particles) and probe again.
  const probe = useSharedValue({ frames: 0, total: 0, done: false });
  const slower = (avg: number) => {
    const next = stepDown(n);
    if (next === n) return;
    if (__DEV__) console.log(`[particles] ${avg.toFixed(1)}ms/frame at ${n} → ${next}`);
    setN(next);
  };

  // Clock only runs while something moves.
  const frame = useFrameCallback((info) => {
    clock.set(info.timeSinceFirstFrame);
    const dt = info.timeSincePreviousFrame;
    const pr = probe.get();
    if (pr.done || dt == null) return;
    const frames = pr.frames + 1;
    const total = frames > PROBE_WARMUP ? pr.total + dt : 0;
    const done = frames >= PROBE_WARMUP + PROBE_FRAMES;
    probe.set({ frames, total, done });
    if (done && total / PROBE_FRAMES > SLOW_FRAME_MS) scheduleOnRN(slower, total / PROBE_FRAMES);
  }, false);
  useEffect(() => {
    probe.set({ frames: 0, total: 0, done: false });
  }, [n, probe]);

  // ---- chapter changes: morph, queueing while a flight is underway -----------------------
  const current = useRef<Chapter>(chapter);
  const queue = useRef<Chapter | null>(null);
  const busy = useRef(false);

  const arrive = (c: Chapter) => {
    busy.current = false;
    onArrive?.(c);
    if (queue.current && queue.current !== current.current) {
      const next = queue.current;
      queue.current = null;
      start(next);
    } else if (!running) {
      frame.setActive(false);
    }
  };

  const start = (c: Chapter) => {
    const slot = slots[c];
    if (slot == null) return;
    busy.current = true;
    frame.setActive(true);
    from.set(to.get());
    to.set(slot);
    current.current = c;
    p.set(0);
    p.set(
      withTiming(1, { duration: morphMs, easing: Easing.linear }, (done) => {
        if (done) scheduleOnRN(arrive, c);
      }),
    );
  };

  useEffect(() => {
    if (chapter === current.current && !busy.current) {
      if (running) frame.setActive(true);
      return;
    }
    if (busy.current) queue.current = chapter;
    else start(chapter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, slots]);

  // Off-screen (or told to rest), the swirl stops; a morph in flight still lands.
  useEffect(() => {
    if (running) frame.setActive(true);
    else if (!busy.current) frame.setActive(false);
    return () => frame.setActive(false);
  }, [running, frame]);

  // ---- per-particle closed-form motion (UI thread) ----------------------------------------
  const transforms = useRSXformBuffer(n, (xf, i) => {
    'worklet';
    const F = targets.get();
    const T = F.pts;
    const S = seedSV.get();
    const g = geo.get();
    const a = from.get() * F.stride + i * 2;
    const b = to.get() * F.stride + i * 2;
    const ax = T[a];
    const ay = T[a + 1];
    const bx = T[b];
    const by = T[b + 1];
    const s1 = S[i * 2];
    const s2 = S[i * 2 + 1];
    const t = clock.get() / 1000;

    const xn = Math.min(1, Math.max(0, ax / 512));
    const delay = 0.62 * xn + 0.38 * s1;
    const lt = Math.min(1, Math.max(0, (p.get() - delay * 0.38) / 0.62));
    const e = lt < 0.5 ? 4 * lt * lt * lt : 1 - Math.pow(-2 * lt + 2, 3) / 2;
    const bump = Math.sin(Math.PI * lt);

    const nx = Math.sin(ay * 0.018 + t * 1.4 + s1 * 6.283) * Math.cos(ax * 0.013 - t * 0.8);
    const ny = Math.cos(ax * 0.016 + t * 1.1 + s2 * 4.1) * Math.sin(ay * 0.02 + t * 0.6);
    const flight = 70 * bump;
    const hold = 2.2;

    const x = ax + (bx - ax) * e + nx * (flight + hold) + 26 * bump + (ax - 256) * 0.08 * bump;
    const y = ay + (by - ay) * e + ny * (flight + hold) - 18 * bump + (ay - 256) * 0.08 * bump;

    let cx = g.ox + x * g.k;
    let cy = g.oy + y * g.k;

    const tv = touch.get();
    if (tv.on > 0) {
      const dx = cx - tv.x;
      const dy = cy - tv.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const R = 70;
      if (d < R && d > 0.001) {
        const f = (1 - d / R) * 26 * tv.on;
        cx += (dx / d) * f;
        cy += (dy / d) * f;
      }
    }

    const scale = (0.24 + s2 * 0.3) * (1 + 0.6 * bump) * Math.max(0.6, g.k * 1.15);
    xf.set(scale, 0, cx - (SPRITE / 2) * scale, cy - (SPRITE / 2) * scale);
  });

  // ---- static per-particle sprite + colour -----------------------------------------------
  const sprites = useMemo(
    () => Array.from({ length: n }, (_, i) => (seeds[i * 2 + 1] > 0.93 ? rect(SPRITE, 0, SPRITE, SPRITE) : rect(0, 0, SPRITE, SPRITE))),
    [n, seeds],
  );
  const colors = useMemo<SkColor[]>(() => {
    const pal = look === 'ink' ? INK : PAPER;
    return Array.from({ length: n }, (_, i) => {
      const c = Skia.Color(pal[Math.floor(seeds[i * 2] * pal.length) % pal.length]);
      // Paper: ink on the page, slightly translucent so dense areas deepen.
      // Ink: additive light — keep each particle dim so crowds glow instead of blowing out.
      c[3] = look === 'paper' ? 0.8 : 0.34 + seeds[i * 2 + 1] * 0.3;
      return c;
    });
  }, [n, seeds, look]);

  const texture = useTexture(
    <Group>
      <Circle cx={SPRITE / 2} cy={SPRITE / 2} r={SPRITE / 2}>
        <RadialGradient
          c={vec(SPRITE / 2, SPRITE / 2)}
          r={SPRITE / 2}
          colors={look === 'ink' ? ['#FFFFFF', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)'] : ['#FFFFFF', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)']}
          positions={look === 'ink' ? [0, 0.28, 1] : [0, 0.45, 1]}
        />
      </Circle>
      <Path path={sparklePath(SPRITE * 1.5, SPRITE / 2, SPRITE * 0.46)} color="white" />
    </Group>,
    { width: SPRITE * 2, height: SPRITE },
    [look],
  );

  const pan = Gesture.Pan()
    .enabled(interactive)
    .minDistance(0)
    .onBegin((e) => {
      touch.set({ x: e.x, y: e.y, on: 1 });
    })
    .onUpdate((e) => {
      touch.set({ x: e.x, y: e.y, on: 1 });
    })
    .onFinalize(() => {
      touch.set({ x: 0, y: 0, on: 0 });
    });

  return (
    <GestureDetector gesture={pan}>
      <Canvas style={StyleSheet.flatten([{ width, height }, style])}>
        <Atlas
          image={texture}
          sprites={sprites}
          transforms={transforms}
          colors={colors}
          colorBlendMode="modulate"
          blendMode={look === 'ink' ? 'plus' : 'srcOver'}
        />
      </Canvas>
    </GestureDetector>
  );
}

export const ParticleField = memo(ParticleFieldImpl);
