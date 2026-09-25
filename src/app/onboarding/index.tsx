import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  css,
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { MomentsMark } from '@/components/brand/moments-mark';
import { Wordmark } from '@/components/brand/wordmark';
import { ArrowRight } from '@/components/icons/lucide';
import { SurfaceMark } from '@/components/system-bars/surface-mark';
import { Button } from '@/components/ui/button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { TwoTone } from '@/components/ui/two-tone';
import { art } from '@/data/art';
import { setPrefs } from '@/data/prefs';
import { haptic } from '@/lib/haptics';
import { useLive } from '@/hooks/use-live';
import { alpha, cssEase, gradient, GUTTER, useTheme } from '@/theme';

const PAGES = [
  {
    art: 'onboard-rooftop',
    lead: 'Big days, ',
    strong: 'planned for you.',
    body: 'Tell us what’s coming up. Your S2S team turns it into a plan — every piece priced to your door.',
  },
  {
    art: 'onboard-sourcing',
    lead: 'From Amazon to PriceSmart, ',
    strong: 'we get it all.',
    body: 'We search the stores online, and walk into the ones you can’t — even members-only.',
  },
  {
    art: 'onboard-christmas',
    lead: 'On time, ',
    strong: 'no surprises.',
    body: 'Landed prices up front, and a countdown that works back from the day.',
  },
];

/** A slow push-in on the page you're looking at (Ken Burns), restarted each time a page lands. */
const kenBurns = css.keyframes({
  from: { transform: [{ scale: 1 }] },
  to: { transform: [{ scale: 1.08 }] },
});

/**
 * Welcome (YOBUMA onboarding, in paper): full-bleed golden-hour photos that page with parallax,
 * fading into paper where a two-tone headline swaps page by page. One gold action.
 */
export default function Welcome() {
  const t = useTheme();
  const live = useLive();
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const photoH = Math.round(H * 0.66);
  const x = useSharedValue(0);
  const [page, setPage] = useState(0);
  const scroller = useRef<Animated.ScrollView>(null);
  const last = page === PAGES.length - 1;

  const onScroll = useAnimatedScrollHandler((e) => {
    x.set(e.contentOffset.x);
    const i = Math.round(e.contentOffset.x / W);
    if (i !== page) scheduleOnRN(setPage, Math.max(0, Math.min(PAGES.length - 1, i)));
  });

  const next = () => {
    if (last) return router.push('/onboarding/name');
    haptic.select();
    scroller.current?.scrollTo({ x: (page + 1) * W, animated: true });
  };

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      {/* Photos */}
      <Animated.ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={[styles.pager, { height: photoH }]}>
        {PAGES.map((p, i) => (
          <Photo key={p.art} index={i} x={x} width={W} height={photoH} src={art(p.art)?.source} active={live && page === i} />
        ))}
      </Animated.ScrollView>

      {/* Legibility: a whisper of ink under the status bar, and the photo melting into paper. */}
      <View style={[styles.topShade, { height: insets.top + 96 }, gradient('linear-gradient(180deg, rgba(8,31,55,0.42) 0%, rgba(8,31,55,0) 100%)')]}>
        <SurfaceMark />
      </View>
      <View
        style={[
          styles.paperFade,
          { top: photoH * 0.52, height: photoH * 0.48 + 1 },
          gradient(`linear-gradient(180deg, ${alpha(t.color.bg, 0)} 0%, ${alpha(t.color.bg, 0.75)} 55%, ${t.color.bg} 100%)`),
        ]}
      />

      {/* Top bar */}
      <View style={[styles.top, { top: insets.top + 10 }]}>
        <View style={styles.lockup} accessible accessibilityRole="image" accessibilityLabel="Moments">
          <MomentsMark size={34} state="static" variant="light" />
          <Wordmark height={19} color="#FFFFFF" />
        </View>
        <PressableScale haptics="select" onPress={() => router.push('/onboarding/name')} style={styles.skip} accessibilityLabel="Skip">
          <Text variant="labelM" color="#FFFFFF">
            Skip
          </Text>
        </PressableScale>
      </View>

      {/* Copy + actions */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.copy}>
          <Animated.View key={page} entering={FadeIn.duration(320).delay(60)} exiting={FadeOut.duration(140)} style={styles.copyInner}>
            <TwoTone lead={PAGES[page].lead} strong={PAGES[page].strong} />
            <Text variant="bodyL" tone="muted" style={styles.body}>
              {PAGES[page].body}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.dots} accessibilityRole="adjustable" accessibilityLabel={`Page ${page + 1} of ${PAGES.length}`}>
          {PAGES.map((p, i) => (
            <Dot key={p.art} index={i} x={x} width={W} />
          ))}
        </View>

        <Button
          label={last ? 'Get started' : 'Continue'}
          variant="gold"
          size="lg"
          block
          trailing={<ArrowRight size={20} color={t.color.onGold} strokeWidth={2.4} />}
          onPress={next}
        />
        <Button
          label="I already have an account"
          variant="ghost"
          size="lg"
          block
          onPress={() => {
            setPrefs({ onboarded: true });
            router.replace('/home');
          }}
        />
      </View>
    </View>
  );
}

function Photo({
  index,
  x,
  width,
  height,
  src,
  active,
}: {
  index: number;
  x: SharedValue<number>;
  width: number;
  height: number;
  src?: number | object;
  active: boolean;
}) {
  // The photo travels at ~55% of the page's speed and settles from a 6% zoom.
  const parallax = useAnimatedStyle(() => {
    const offset = x.get() / width - index;
    return {
      transform: [
        { translateX: offset * width * 0.45 },
        { scale: interpolate(Math.abs(offset), [0, 1], [1, 1.06], Extrapolation.CLAMP) },
      ],
    };
  });
  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Animated.View style={[StyleSheet.absoluteFill, parallax]}>
        <Animated.View
          key={active ? 'on' : 'off'}
          style={[
            StyleSheet.absoluteFill,
            active && { animationName: kenBurns, animationDuration: 9000, animationTimingFunction: cssEase.sine, animationFillMode: 'forwards' },
          ]}>
          {src ? <Image accessibilityLabel="" accessible={false} source={src} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" transition={200} /> : null}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** Page dot that stretches into a gold bar as its page arrives (follows the finger). */
function Dot({ index, x, width }: { index: number; x: SharedValue<number>; width: number }) {
  const t = useTheme();
  // Colours are resolved on the JS thread; the worklet only reads the strings.
  const idle = alpha(t.color.navy, 0.16);
  const active = t.color.gold;
  const style = useAnimatedStyle(() => {
    const k = Math.max(0, 1 - Math.abs(x.get() / width - index));
    return {
      width: 7 + 20 * k,
      backgroundColor: interpolateColor(k, [0, 1], [idle, active]),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pager: { position: 'absolute', top: 0, left: 0, right: 0 },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' },
  paperFade: { position: 'absolute', left: 0, right: 0, pointerEvents: 'none' },
  top: { position: 'absolute', left: GUTTER, right: GUTTER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  skip: { height: 36, paddingHorizontal: 16, borderRadius: 18, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderCurve: 'continuous' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER + 4, gap: 8 },
  copy: { minHeight: 176, justifyContent: 'flex-end' },
  copyInner: { gap: 12 },
  body: { maxWidth: 360 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14, marginBottom: 16 },
  dot: { height: 7, borderRadius: 4 },
});
