import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { ArrowUpRight, ICON_STROKE, MapPin } from '@/components/icons/lucide';
import { AvatarStack } from '@/components/ui/avatar';
import { GUTTER_CARD } from '@/components/moment/layout';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Text } from '@/components/ui/text';
import { art } from '@/data/art';
import { kindMeta } from '@/data/kinds';
import { people, photoOf } from '@/data/people';
import { daysUntil, progress } from '@/data/store';
import type { Moment } from '@/data/types';
import { fmt, parseYmd } from '@/lib/dates';
import { alpha, radius, tints, useTheme } from '@/theme';

import { ArtPanel } from './art-panel';

const GAP = 14;

function HeroCard({ m, i, x, w }: { m: Moment; i: number; x: SharedValue<number>; w: number }) {
  const t = useTheme();
  const meta = kindMeta[m.kind];
  const tn = tints[meta.tint];
  const bg = art(m.cover)?.bg ?? tn.bg;
  const days = daysUntil(m.date);
  const p = progress(m);
  const step = w + GAP;

  const card = useAnimatedStyle(() => {
    const v = x.get() / step - i;
    return {
      transform: [
        { scale: interpolate(v, [-1, 0, 1], [0.94, 1, 0.94], Extrapolation.CLAMP) },
        { rotate: `${interpolate(v, [-1, 0, 1], [2, 0, -2], Extrapolation.CLAMP)}deg` },
      ],
    };
  });
  const parallax = useAnimatedStyle(() => {
    const v = x.get() / step - i;
    return { transform: [{ translateX: interpolate(v, [-1, 0, 1], [-46, 0, 46], Extrapolation.CLAMP) }] };
  });

  const ink = tn.ink;
  return (
    <Animated.View style={[{ width: w }, card]}>
      <PressableScale
        haptics="tap"
        to={0.985}
        onPress={() => router.push({ pathname: '/moment/[id]', params: { id: m.id } })}
        accessibilityLabel={`${m.title}, in ${days} days`}
        style={[styles.card, { backgroundColor: bg, boxShadow: t.shadow.float }]}>
        <View style={styles.artWrap}>
          <Animated.View style={[styles.artInner, parallax]}>
            <ArtPanel artKey={m.cover} tint={meta.tint} cast={m.cast} pose={i === 0 ? 'wave' : 'idle'} castSize={150} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <View style={[styles.kindChip, { backgroundColor: 'rgba(255,255,255,0.82)' }]}>
            <Text variant="caption" color={ink}>
              {m.occasion ?? meta.label}
            </Text>
          </View>
          <View style={[styles.count, { backgroundColor: ink }]}>
            <Text variant="numeralSm" color="#FFFFFF" style={{ fontSize: 24, lineHeight: 26 }}>
              {days}
            </Text>
            <Text variant="caption" color={alpha('#FFFFFF', 0.8)} style={{ fontSize: 10, lineHeight: 12 }}>
              {days === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text variant="title2" color={ink} numberOfLines={1}>
            {m.title}
          </Text>
          <View style={styles.meta}>
            <Text variant="footnote" color={alpha(ink, 0.8)}>
              {fmt.short(parseYmd(m.date))}
              {m.time ? ` · ${m.time}` : ''}
            </Text>
          </View>
          <View style={styles.meta}>
            <MapPin size={13} color={alpha(ink, 0.7)} strokeWidth={ICON_STROKE} />
            <Text variant="footnote" color={alpha(ink, 0.7)} numberOfLines={1} style={{ flex: 1 }}>
              {m.place}
            </Text>
          </View>
          <View style={styles.foot}>
            <AvatarStack people={m.people.map((id) => ({ name: people[id]?.name ?? id, crop: photoOf(id) }))} size={30} ringColor={bg} />
            <View style={styles.footRight}>
              <ProgressRing value={p.ratio} size={40} stroke={4} color={ink} track={alpha(ink, 0.14)} delay={300 + i * 120}>
                <Text variant="caption" color={ink} style={{ fontSize: 11 }}>
                  {p.sorted}/{p.total}
                </Text>
              </ProgressRing>
              <View style={[styles.go, { backgroundColor: ink }]}>
                <ArrowUpRight size={20} color="#FFFFFF" strokeWidth={ICON_STROKE} />
              </View>
            </View>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

/** "Next up": snap carousel of tinted moment cards with parallax art, neighbours peeking. */
export function NextUpCarousel({ moments }: { moments: Moment[] }) {
  const { width } = useWindowDimensions();
  const w = Math.min(width - GUTTER_CARD * 2 - 24, 360);
  const x = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    x.set(e.contentOffset.x);
  });

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={w + GAP}
      decelerationRate="fast"
      disableIntervalMomentum
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingHorizontal: GUTTER_CARD, gap: GAP, paddingVertical: 12 }}>
      {moments.map((m, i) => (
        <HeroCard key={m.id} m={m} i={i} x={x} w={w} />
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.panel, overflow: 'hidden', borderCurve: 'continuous' },
  artWrap: { height: 196, overflow: 'hidden' },
  artInner: { position: 'absolute', top: 0, bottom: 0, left: -50, right: -50 },
  kindChip: { position: 'absolute', top: 14, left: 14, paddingHorizontal: 10, height: 26, borderRadius: 13, justifyContent: 'center' },
  count: { position: 'absolute', top: 14, right: 14, width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 18, paddingTop: 14, gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  footRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  go: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
