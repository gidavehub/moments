import { useIsFocused } from 'expo-router';

import { useReduced } from '@/theme';

/**
 * Whether looping decoration (breathing, bobbing, particles) should run: motion isn't reduced
 * and this screen is the one in front. Tabs stay mounted when you switch away, and a pushed
 * screen leaves the one below mounted — without this their loops keep ticking off-screen.
 */
export function useLive() {
  const focused = useIsFocused();
  const reduced = useReduced();
  return focused && !reduced;
}
