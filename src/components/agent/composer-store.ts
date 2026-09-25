import type { View } from 'react-native';

import { createStore } from '@/lib/create-store';

export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

/** Which surface the planner morphs out of (the Home ask pill or the tab bar's + button). */
export const composerStore = createStore<{ open: boolean; origin: OriginRect | null }>({ open: false, origin: null });
export const useComposer = composerStore.useStore;

/** Measure a view in window coordinates and open the planner from it. */
export function openComposerFrom(ref: React.RefObject<View | null>, radius: number) {
  const node = ref.current;
  if (!node) {
    composerStore.set({ open: true, origin: null });
    return;
  }
  node.measureInWindow((x, y, width, height) => {
    composerStore.set({ open: true, origin: { x, y, width, height, radius } });
  });
}
