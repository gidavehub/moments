import { NavigationBar } from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { barTones, listSurfaces, useBarTones, type IconTone, type Surface } from './surface-tone';

/** How often the bars re-check what's behind them (~7 fps is plenty for a status-bar fade). */
const TICK_MS = 140;

interface Box extends Surface {
  x: number;
  y: number;
  w: number;
  h: number;
}

const measure = (s: Surface) =>
  new Promise<Box | null>((resolve) => {
    const node = s.ref.current;
    if (!node) return resolve(null);
    node.measureInWindow((x, y, w, h) => resolve(w && h ? { ...s, x, y, w, h } : null));
  });

/**
 * Drives the status bar (both platforms) and the Android navigation bar from the registered
 * surfaces: whichever surface covers most of a bar's band decides its icon tone. The iPhone
 * home indicator samples the content behind it natively, so it follows the same surfaces.
 */
export function SystemBars() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const tones = useBarTones();

  useEffect(() => {
    let alive = true;
    let busy = false;

    const bandTone = (boxes: Box[], y0: number, y1: number): IconTone => {
      let best: Box | null = null;
      for (const b of boxes) {
        const overlapY = Math.min(y1, b.y + b.h) - Math.max(y0, b.y);
        const overlapX = Math.min(width, b.x + b.w) - Math.max(0, b.x);
        if (overlapY < (y1 - y0) * 0.5 || overlapX < width * 0.5) continue;
        if (!best || b.priority > best.priority || (b.priority === best.priority && b.order > best.order)) best = b;
      }
      return best?.tone === 'dark' ? 'light' : 'dark';
    };

    const tick = async () => {
      if (busy || (Platform.OS !== 'web' && AppState.currentState !== 'active')) return;
      busy = true;
      const boxes = (await Promise.all(listSurfaces().map(measure))).filter((b): b is Box => !!b);
      busy = false;
      if (!alive) return;
      const top = bandTone(boxes, 0, Math.max(insets.top, 24));
      const bottom = bandTone(boxes, height - Math.max(insets.bottom, 16), height);
      if (__DEV__ && Platform.OS === 'web') {
        // Inspect from the browser console: what the bars measured and decided.
        (globalThis as { __systemBars?: unknown }).__systemBars = { top, bottom, boxes: boxes.map(({ tone, priority, x, y, w, h }) => ({ tone, priority, x, y, w, h })) };
      }
      const now = barTones.get();
      if (now.top !== top || now.bottom !== bottom) barTones.set({ top, bottom });
    };

    tick();
    const id = setInterval(tick, TICK_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [insets.top, insets.bottom, width, height]);

  return (
    <>
      <StatusBar style={tones.top} animated />
      <NavigationBar style={tones.bottom} />
    </>
  );
}
