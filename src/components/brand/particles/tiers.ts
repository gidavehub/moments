import * as Device from 'expo-device';
import { Platform } from 'react-native';

/** Particle counts, best first. The frame-time guard steps down this ladder. */
const LADDER = [2400, 1400, 800, 500];

/** Once a field has had to step down, later fields start there too. */
let cap = Infinity;

/** How many particles this device gets. Android's UI thread pays per particle, so it gets fewer. */
export function particleBudget(): number {
  let base = 2400;
  if (Platform.OS === 'android') {
    const mem = Device.totalMemory ?? 0;
    base = mem && mem < 4 * 1024 ** 3 ? 800 : 1400;
  }
  return Math.min(base, cap);
}

/** The next tier down from `n` (or `n` itself at the floor), remembered for the session. */
export function stepDown(n: number): number {
  const next = LADDER.find((t) => t < n) ?? n;
  cap = Math.min(cap, next);
  return next;
}

/** Frames averaging slower than this over the probe window drop a tier (≈45 fps). */
export const SLOW_FRAME_MS = 22;
/** Frames skipped while textures upload and targets settle, then frames measured. */
export const PROBE_WARMUP = 10;
export const PROBE_FRAMES = 45;
