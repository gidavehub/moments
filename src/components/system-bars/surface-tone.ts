import { useIsFocused } from 'expo-router';
import { useEffect, useId, useRef } from 'react';
import type { View } from 'react-native';

import { createStore } from '@/lib/create-store';

/**
 * "Infinity" system bars: screens run edge to edge under the status bar and the home bar,
 * and the clock/battery and home-bar icons flip between dark and light to match whatever is
 * behind them. Surfaces that aren't paper register here; `SystemBars` measures them.
 */
export type SurfaceTone = 'dark' | 'light';
/** Icon colour for a system bar — light icons sit on dark surfaces. */
export type IconTone = 'dark' | 'light';

export interface Surface {
  ref: React.RefObject<View | null>;
  tone: SurfaceTone;
  /** Higher wins where surfaces overlap: 0 screen base, 1 card, 2 overlay/sheet, 3 full-screen takeover. */
  priority: number;
  order: number;
}

const surfaces = new Map<string, Surface>();
let order = 0;

export const listSurfaces = () => [...surfaces.values()];

/** The icon tones the bars show right now (the web device frame mirrors these). */
export const barTones = createStore<{ top: IconTone; bottom: IconTone }>({ top: 'dark', bottom: 'dark' });
export const useBarTones = barTones.useStore;

/**
 * Mark a view as a dark (or, over a dark base, light) surface for the system bars. Returns a
 * ref for that view. Only the screen in front counts, so tabs and screens underneath a push
 * drop out on their own.
 */
export function useSurfaceTone<T extends View = View>(tone: SurfaceTone = 'dark', priority = 1) {
  const ref = useRef<T>(null);
  const id = useId();
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused) return;
    surfaces.set(id, { ref: ref as React.RefObject<View | null>, tone, priority, order: ++order });
    return () => {
      surfaces.delete(id);
    };
  }, [id, tone, priority, focused]);
  return ref;
}
