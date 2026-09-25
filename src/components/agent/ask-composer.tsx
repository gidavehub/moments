import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useChrome } from '@/components/navigation/chrome';
import { SurfaceMark } from '@/components/system-bars/surface-mark';
import { actions } from '@/data/store';
import { alpha, ease, useReduced, useTheme } from '@/theme';

import { composerStore, useComposer, type OriginRect } from './composer-store';
import { Planner } from './planner';

/** Warm the planner up once Home has settled, so opening it never mounts anything. */
const WARM_AFTER_MS = 1200;

/**
 * The planner, opened as a container transform: a light paper surface grows out of the pill or
 * button you tapped, and the planner fades and lifts in over it.
 *
 * Built for smoothness on device:
 * - The planner is mounted ahead of time (paused, off-screen), so opening mounts nothing.
 * - Only the childless surface animates its bounds; the planner itself only animates opacity
 *   and transform, which Reanimated applies without re-laying anything out.
 * - Closing fades the content first, then folds the surface back into its origin.
 */
export function AskComposer() {
  const t = useTheme();
  const reduced = useReduced();
  const chrome = useChrome();
  const { width: W, height: H } = useWindowDimensions();
  const { open, origin } = useComposer();
  const [warm, setWarm] = useState(false);
  const [shown, setShown] = useState(false);
  const [from, setFrom] = useState<OriginRect | null>(null);
  const [resetKey, setResetKey] = useState(0);
  /** Surface progress: 0 = the origin rect, 1 = full screen. */
  const p = useSharedValue(0);
  /** Content progress: 0 = hidden (parked off-screen), 1 = shown. */
  const c = useSharedValue(0);

  const o = from ?? { x: 0, y: H * 0.6, width: W, height: H * 0.4, radius: 32 };
  const gold = t.color.gold;
  const goldGone = alpha(t.color.gold, 0);

  useEffect(() => {
    const id = setTimeout(() => setWarm(true), WARM_AFTER_MS);
    return () => clearTimeout(id);
  }, []);

  const finish = () => {
    setShown(false);
    setFrom(null);
    composerStore.set({ open: false, origin: null });
  };

  useEffect(() => {
    if (!open || shown) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setWarm(true);
    setFrom(origin);
    setShown(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    p.set(0);
    c.set(0);
    p.set(withTiming(1, { duration: reduced ? 220 : 480, easing: reduced ? ease.outQuart : ease.emphasizedIn }));
    c.set(withDelay(reduced ? 0 : 110, withTiming(1, { duration: reduced ? 220 : 380, easing: ease.outQuart })));
    chrome?.hidden.set(withTiming(1, { duration: 280, easing: ease.outQuart }));
  }, [open, origin, shown, p, c, reduced, chrome]);

  const close = () => {
    chrome?.hidden.set(withDelay(120, withTiming(0, { duration: 380, easing: ease.expo })));
    c.set(withTiming(0, { duration: reduced ? 160 : 150, easing: ease.outQuart }));
    p.set(
      withDelay(
        reduced ? 0 : 60,
        withTiming(0, { duration: reduced ? 200 : 340, easing: reduced ? ease.outQuart : ease.emphasizedOut }, (done) => {
          if (done) scheduleOnRN(finish);
        }),
      ),
    );
  };

  useEffect(() => {
    if (!shown) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    let off = () => {};
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
      window.addEventListener('keydown', onKey);
      off = () => window.removeEventListener('keydown', onKey);
    }
    return () => {
      sub.remove();
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  const plate = useAnimatedStyle(() => {
    const v = p.get();
    if (reduced) return { left: 0, top: 0, width: W, height: H, borderRadius: 0, opacity: v, borderColor: goldGone };
    return {
      left: interpolate(v, [0, 1], [o.x, 0]),
      top: interpolate(v, [0, 1], [o.y, 0]),
      width: interpolate(v, [0, 1], [o.width, W]),
      height: interpolate(v, [0, 1], [o.height, H]),
      borderRadius: interpolate(v, [0, 0.8, 1], [o.radius, 30, 0], Extrapolation.CLAMP),
      // Transparent at the very start, so the pill underneath hands over instead of vanishing.
      opacity: interpolate(v, [0, 0.12], [0, 1], Extrapolation.CLAMP),
      borderColor: interpolateColor(v, [0, 0.45], [gold, goldGone]),
    };
  });
  const scrim = useAnimatedStyle(() => ({ opacity: p.get() * 0.32 }));
  const content = useAnimatedStyle(() => {
    const v = c.get();
    return {
      opacity: v,
      // Parked off-screen while hidden so it's never composited; lifts 16pt and settles in.
      transform: [{ translateY: v === 0 ? H * 2 : (1 - v) * 16 }, { scale: 0.985 + 0.015 * v }],
    };
  });

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
      {shown && (
        <>
          <Animated.View style={[{ pointerEvents: 'none' }, StyleSheet.absoluteFill, { backgroundColor: t.color.navy }, scrim]} />
          <Animated.View style={[styles.plate, { backgroundColor: t.color.bg }, plate]}>
            <SurfaceMark tone="light" priority={3} />
          </Animated.View>
        </>
      )}
      {warm && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { pointerEvents: shown ? 'box-none' : 'none' }, content]}
          accessibilityElementsHidden={!shown}
          importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
          aria-hidden={!shown}>
          <Planner
            embedded
            active={shown}
            resetKey={resetKey}
            onClose={close}
            onSubmit={(draft) => {
              const id = actions.createDraft(draft);
              router.push({ pathname: '/plan/run', params: { id } });
              // Once plan/run covers it, park the composer and clear the draft for next time.
              setTimeout(() => {
                chrome?.hidden.set(0);
                c.set(0);
                p.set(0);
                finish();
                setResetKey((k) => k + 1);
              }, 500);
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plate: { position: 'absolute', overflow: 'hidden', borderWidth: 1.5, borderCurve: 'continuous' },
});
