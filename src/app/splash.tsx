import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { MomentsMark } from '@/components/brand/moments-mark';
import { S2SMark } from '@/components/brand/s2s-mark';
import { Wordmark } from '@/components/brand/wordmark';
import { WORDMARK_HEIGHT, WORDMARK_WIDTH } from '@/components/brand/wordmark-paths';
import { Text } from '@/components/ui/text';
import { prefsStore } from '@/data/prefs';
import { brand, ease, spring, useReduced, useTheme } from '@/theme';

/** The native splash shows the mark at imageWidth 200 × its 0.66 artboard scale (scripts/gen-brand-assets.mjs). */
const SPLASH_MARK = 132;
/**
 * Final lockup, stacked and centred on screen: a large mark with "moments" beneath it. The mark's
 * artboard already carries ~12% air under the tile, so a small gap reads as a comfortable one.
 */
const MARK_END = 148;
const WORD_H = 46;
const WORD_W = (WORDMARK_WIDTH / WORDMARK_HEIGHT) * WORD_H;
const GAP = 0;
const TOTAL = MARK_END + GAP + WORD_H;
/** The artboard's empty band above the rings would sit the pair low; nudge it to the optical centre. */
const OPTICAL = -18;
/** Vertical offsets from screen centre once the lockup has settled. */
const MARK_Y = -TOTAL / 2 + MARK_END / 2 + OPTICAL;
const WORD_Y = TOTAL / 2 - WORD_H / 2 + OPTICAL;

/**
 * Cold-launch splash (YOBUMA's choreography, our mark). Frame 0 is the native splash exactly —
 * paper, the mark centred — so the hand-off is invisible. Then the mark grows a little and lifts
 * to make room, "moments" rises in letter by letter beneath it (the pair centred on screen),
 * "by Shop2Ship" fades up, and a gold bloom grows from the mark into onboarding (or Home).
 * Tap anywhere to skip.
 */
export default function Splash() {
  const t = useTheme();
  const reduced = useReduced();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [writing, setWriting] = useState(reduced);

  const move = useSharedValue(reduced ? 1 : 0);
  const tag = useSharedValue(reduced ? 1 : 0);
  const bloom = useSharedValue(0);
  const leave = useSharedValue(0);

  const go = () => router.replace(prefsStore.get().onboarded ? '/home' : '/onboarding');

  useEffect(() => {
    if (reduced) {
      leave.set(withDelay(900, withTiming(1, { duration: 300 }, (done) => done && scheduleOnRN(go))));
      return;
    }
    move.set(withDelay(120, withSpring(1, spring.gentle)));
    const write = setTimeout(() => setWriting(true), 300);
    tag.set(withDelay(1100, withTiming(1, { duration: 500, easing: ease.outQuart })));
    bloom.set(withDelay(1900, withTiming(1, { duration: 520, easing: ease.quint }, (done) => done && scheduleOnRN(go))));
    return () => clearTimeout(write);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markStyle = useAnimatedStyle(() => {
    const m = move.get();
    return {
      transform: [{ translateY: m * MARK_Y }, { scale: interpolate(m, [0, 1], [1, MARK_END / SPLASH_MARK]) }],
    };
  });
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bloom.get(), [0.25, 0.8], [1, 0], Extrapolation.CLAMP) * (1 - leave.get()),
    transform: [{ scale: interpolate(bloom.get(), [0, 1], [1, 1.04]) }],
  }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tag.get() * interpolate(bloom.get(), [0.2, 0.7], [1, 0], Extrapolation.CLAMP) * (1 - leave.get()),
    transform: [{ translateY: (1 - tag.get()) * 24 }],
  }));

  // The bloom grows from where the mark lands.
  const cx = width / 2;
  const cy = height / 2 + MARK_Y;
  const reach = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy)) * 1.15;
  const bloomStyle = useAnimatedStyle(() => {
    const b = bloom.get();
    return {
      opacity: interpolate(b, [0, 0.55, 1], [0.95, 0.9, 0]),
      transform: [{ scale: b }],
    };
  });

  return (
    <Pressable style={[styles.fill, { backgroundColor: t.color.bg }]} onPress={go} accessibilityRole="button" accessibilityLabel="Moments by Shop2Ship. Tap to continue">
      <Animated.View style={[styles.center, contentStyle]}>
        <View style={[styles.word, { transform: [{ translateY: WORD_Y }] }]}>
          {writing ? <Wordmark height={WORD_H} reveal={!reduced} /> : <View style={{ width: WORD_W, height: WORD_H }} />}
        </View>
        <Animated.View style={[{ width: SPLASH_MARK, height: SPLASH_MARK }, markStyle]}>
          <MomentsMark size={SPLASH_MARK} state="static" />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.tagline, { bottom: insets.bottom + 40 }, tagStyle]}>
        <S2SMark size={20} state="static" />
        <Text variant="labelM" tone="muted">
          by Shop<Text variant="labelM" color={brand.gold}>2</Text>Ship
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.bloom,
          { width: reach * 2, height: reach * 2, borderRadius: reach, left: cx - reach, top: cy - reach, backgroundColor: brand.gold },
          bloomStyle,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  word: { position: 'absolute', width: WORD_W, height: WORD_H },
  tagline: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bloom: { position: 'absolute', pointerEvents: 'none' },
});
