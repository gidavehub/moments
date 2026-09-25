import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeft, Ellipsis, ICON_STROKE, MapPin, Plus, Share2, Users } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { ArtPanel } from '@/components/moment/art-panel';
import { BudgetMeter } from '@/components/moment/budget-meter';
import { PlanItemCard } from '@/components/moment/plan-item-card';
import { ReplyBar } from '@/components/moment/reply-bar';
import { StageRail } from '@/components/moment/stage-rail';
import { SurfaceMark } from '@/components/system-bars/surface-mark';
import { TimelineList } from '@/components/moment/timeline-list';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { RollingNumber } from '@/components/ui/countdown';
import { GlassSurface } from '@/components/ui/glass-surface';
import { IconButton } from '@/components/ui/icon-button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { SectionHeader } from '@/components/ui/section-header';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { WordReveal } from '@/components/ui/word-reveal';
import { today } from '@/data/clock';
import { art } from '@/data/art';
import { kindMeta } from '@/data/kinds';
import { people, photoOf } from '@/data/people';
import { daysUntil, isSorted, isWorking, momentById, needsYou, progress, spend, useWorld } from '@/data/store';
import type { PlanItem } from '@/data/types';
import { fmt, parseYmd } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { money } from '@/lib/money';
import { alpha, gradient, GUTTER, tints, useTheme } from '@/theme';

const HERO = 360;
type Filter = 'all' | 'needs' | 'working' | 'done';

const EMPTY_FILTER: Record<Filter, { title: string; body: string }> = {
  all: { title: 'Nothing planned yet', body: 'Message your S2S team and they’ll sketch the plan.' },
  needs: { title: 'Nothing needs you', body: 'Your S2S team is on the rest — we’ll ping you when there’s a pick.' },
  working: { title: 'S2S is all caught up', body: 'Everything left is with you, or already sorted.' },
  done: { title: 'Nothing agreed yet', body: 'Pick from a shortlist or accept a quote to get going.' },
};

export default function MomentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const w = useWorld();
  const m = momentById(w, id ?? '');
  const [filter, setFilter] = useState<Filter>('all');
  const [quoted, setQuoted] = useState<string | undefined>();
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });

  const heroStyle = useAnimatedStyle(() => {
    const v = y.get();
    return {
      transform: [
        { translateY: v > 0 ? v * 0.45 : v },
        { scale: v < 0 ? 1 + -v / HERO : 1 },
      ],
    };
  });
  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(y.get(), [HERO - 150, HERO - 90], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(y.get(), [HERO - 150, HERO - 90], [-8, 0], Extrapolation.CLAMP) }],
  }));

  const tasks = useMemo(() => w.tasks.filter((x) => x.momentId === id), [w.tasks, id]);

  if (!m) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: t.color.bg }]}>
        <Text variant="title3">That moment has moved</Text>
        <Button label="Take me home" onPress={() => router.replace('/home')} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const meta = kindMeta[m.kind];
  const tn = tints[meta.tint];
  const p = progress(m);
  const days = daysUntil(m.date);
  const hours = 24 - today().getHours();
  const date = parseYmd(m.date);
  const counts = {
    all: m.items.length,
    needs: m.items.filter(needsYou).length,
    working: m.items.filter(isWorking).length,
    done: m.items.filter(isSorted).length,
  };
  const shown = m.items.filter((i) => (filter === 'needs' ? needsYou(i) : filter === 'working' ? isWorking(i) : filter === 'done' ? isSorted(i) : true));
  const s = spend(m);
  const caption =
    p.needs > 0 ? `${p.sorted} of ${p.total} agreed — ${p.needs} still waiting on you.` : p.sorted === p.total ? 'Everything is agreed. Move it to checkout when you’re ready.' : 'Your S2S team is on the rest.';

  const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  const ask = (item: PlanItem) => {
    haptic.select();
    setQuoted(item.title);
  };

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        {/* Hero */}
        <View style={{ height: HERO, overflow: 'hidden', backgroundColor: art(m.cover)?.bg ?? tn.bg }}>
          <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
            <ArtPanel artKey={m.cover} tint={meta.tint} cast={m.cast} pose="celebrate" prop="confetti" castSize={200} style={[StyleSheet.absoluteFill, { paddingTop: insets.top }]} />
          </Animated.View>
          <View style={[styles.heroFade, gradient(`linear-gradient(180deg, rgba(0,0,0,0) 55%, ${t.color.bg} 100%)`)]} />
        </View>

        {/* Title block (overlaps the hero) */}
        <View style={[styles.gutter, { marginTop: -76 }]}>
          <View style={styles.kindRow}>
            <View style={[styles.kind, { backgroundColor: tn.ink }]}>
              <Text variant="caption" color="#FFFFFF">
                {m.occasion ?? meta.label}
              </Text>
            </View>
            {m.recurring && <Chip label="Every year" size="sm" tone="glass" />}
            <Chip label={`From ${m.origin}`} size="sm" tone="glass" />
          </View>
          <WordReveal lines={[m.title]} variant="display" style={{ marginTop: 10 }} />
          <View style={styles.metaRow}>
            <Text variant="callout" tone="muted">
              {fmt.long(date)}
              {m.time ? ` · ${m.time}` : ''}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={15} color={t.color.textMuted} strokeWidth={ICON_STROKE} />
            <Text variant="callout" tone="muted" style={{ flex: 1 }}>
              {m.place}
            </Text>
          </View>
          <View style={[styles.chipsRow]}>
            {m.guests ? <Chip label={`${m.guests} guests`} size="sm" leading={<Users size={14} color={t.color.text} strokeWidth={ICON_STROKE} />} /> : null}
            <Chip label={`Up to US$${m.budgetUsd.toLocaleString()}`} size="sm" />
            {m.preferences ? <Chip label={m.preferences.split(' · ')[0]} size="sm" /> : null}
          </View>
        </View>

        {/* Countdown */}
        <View style={styles.gutter}>
          <Surface elevation="lift" style={styles.countdown}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14 }}>
              <View>
                <RollingNumber value={days} size={60} color={t.color.text} delay={300} />
                <Text variant="caption" tone="muted">
                  days
                </Text>
              </View>
              <View>
                <RollingNumber value={hours} size={60} color={t.color.textSubtle} delay={500} />
                <Text variant="caption" tone="muted">
                  hours
                </Text>
              </View>
            </View>
            <ProgressRing value={p.ratio} size={84} stroke={8} delay={400}>
              <Text variant="headline">
                {p.sorted}/{p.total}
              </Text>
              <Text variant="caption" tone="muted" style={{ fontSize: 10 }}>
                sorted
              </Text>
            </ProgressRing>
          </Surface>
        </View>

        {/* Stage */}
        <View style={[styles.gutter, styles.section]}>
          <StageRail stage={m.stage} caption={caption} />
        </View>

        {/* Plan */}
        <SectionHeader title="The plan" eyebrow={`${m.items.length} things`} style={[styles.gutter, styles.section]} />
        <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8, paddingBottom: 12 }}>
          {(
            [
              ['all', 'All'],
              ['needs', 'Needs you'],
              ['working', 'With S2S'],
              ['done', 'Done'],
            ] as [Filter, string][]
          ).map(([f, label]) => (
            <Chip key={f} label={`${label}  ${counts[f]}`} selected={filter === f} onPress={() => setFilter(f)} size="sm" tone={f === 'needs' && counts.needs ? 'gold' : 'default'} />
          ))}
        </Animated.ScrollView>
        <Animated.View layout={LinearTransition.springify().damping(20)} style={[styles.gutter, { gap: 12 }]}>
          {shown.map((item, i) => (
            <PlanItemCard key={item.id} moment={m} item={item} index={i} onAsk={ask} />
          ))}
          {!shown.length && (
            <Animated.View entering={FadeIn.duration(260)} style={[styles.emptyFilter, { backgroundColor: t.color.bgSunk }]}>
              <Character kind={filter === 'done' ? 'dot' : m.cast} pose={filter === 'done' ? 'think' : 'celebrate'} size={72} still />
              <View style={{ flex: 1 }}>
                <Text variant="headline">{EMPTY_FILTER[filter].title}</Text>
                <Text variant="footnote" tone="muted">
                  {EMPTY_FILTER[filter].body}
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Ready to order */}
        {s.committed > 0 && (
          <View style={[styles.gutter, styles.section]}>
            <View style={[styles.order, { backgroundColor: t.color.navy }, gradient(t.gradient.inkSheen)]}>
              <SurfaceMark />
              <View style={{ flex: 1 }}>
                <Text variant="overline" color={t.color.gold}>
                  Ready to order
                </Text>
                <Text variant="title2" color="#FFFFFF">
                  {money(s.committed)}
                </Text>
                <Text variant="caption" color={alpha('#FFFFFF', 0.7)}>
                  {p.sorted} agreed · {p.total - p.sorted} still open · landed to {m.city}
                </Text>
              </View>
              <Button label="Checkout" variant="gold" size="sm" onPress={() => haptic.success()} />
            </View>
          </View>
        )}

        {/* Countdown timeline */}
        <SectionHeader title="Countdown" eyebrow="Worked back from the day" style={[styles.gutter, styles.section]} />
        <View style={styles.gutter}>
          <TimelineList tasks={tasks} />
        </View>

        {/* Budget */}
        <SectionHeader title="Budget" eyebrow="Everything landed" style={[styles.gutter, styles.section]} />
        <View style={styles.gutter}>
          <Surface padded elevation="plate">
            <BudgetMeter moment={m} />
          </Surface>
        </View>

        {/* People */}
        <SectionHeader title="People" style={[styles.gutter, styles.section]} />
        <View style={[styles.gutter, styles.people]}>
          {m.people.map((pid) => (
            <View key={pid} style={styles.person}>
              <Avatar crop={photoOf(pid)} name={people[pid]?.name} size={56} ring={pid === 'ava' ? t.color.gold : undefined} />
              <Text variant="caption" tone="muted">
                {people[pid]?.short}
              </Text>
            </View>
          ))}
          <View style={styles.person}>
            <View style={[styles.invite, { borderColor: t.color.border }]}>
              <Plus size={22} color={t.color.textMuted} strokeWidth={ICON_STROKE} />
            </View>
            <Text variant="caption" tone="muted">
              Invite
            </Text>
          </View>
          <View style={styles.person}>
            <Avatar crop={photoOf('keisha')} name="Keisha" size={56} ring={t.color.success} />
            <Text variant="caption" tone="muted">
              Keisha · S2S
            </Text>
          </View>
        </View>

        {/* Updates */}
        <SectionHeader title="Everything that happened" style={[styles.gutter, styles.section]} />
        <View style={[styles.gutter, { gap: 14 }]}>
          {m.updates.map((u, i) => (
            <View key={u.id} style={styles.update}>
              <View style={[styles.updateDot, { backgroundColor: i === 0 ? t.color.gold : alpha(t.color.text, 0.2) }]} />
              <View style={{ flex: 1 }}>
                <Text variant="callout">{u.label}</Text>
                <Text variant="caption" tone="subtle">
                  {u.at}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* Sticky compact header */}
      <Animated.View style={[{ pointerEvents: 'box-none' }, styles.sticky, { paddingTop: insets.top + 6 }, barStyle]}>
        <GlassSurface radius={26} style={styles.stickyBar}>
          <View style={styles.stickyRow}>
            <View style={{ width: 48 }} />
            <View style={{ flex: 1, marginRight: 104 }}>
              <Text variant="headline" numberOfLines={1}>
                {m.title}
              </Text>
              <Text variant="caption" tone="muted">
                {days} days · {p.sorted}/{p.total} sorted
              </Text>
            </View>
          </View>
        </GlassSurface>
      </Animated.View>

      {/* Floating nav buttons */}
      <View style={[{ pointerEvents: 'box-none' }, styles.nav, { top: insets.top + 10 }]}>
        <IconButton label="Back" onPress={back}>
          <ChevronLeft size={22} color={t.color.text} strokeWidth={ICON_STROKE} />
        </IconButton>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <IconButton label="Share">
            <Share2 size={19} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
          <IconButton label="More">
            <Ellipsis size={20} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
        </View>
      </View>

      <ReplyBar quoted={quoted} onClear={() => setQuoted(undefined)} onSend={() => setQuoted(undefined)} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  gutter: { paddingHorizontal: GUTTER },
  section: { marginTop: 28 },
  emptyFilter: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 24 },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 180 },
  kindRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  kind: { paddingHorizontal: 10, height: 26, borderRadius: 13, justifyContent: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  countdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, marginTop: 22, borderRadius: 28 },
  order: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 26 },
  people: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  person: { alignItems: 'center', gap: 6 },
  invite: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  update: { flexDirection: 'row', gap: 12 },
  updateDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  sticky: { position: 'absolute', left: 12, right: 12, top: 0 },
  stickyBar: { height: 60, justifyContent: 'center', paddingHorizontal: 10 },
  stickyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nav: { position: 'absolute', left: GUTTER, right: GUTTER, flexDirection: 'row', justifyContent: 'space-between' },
});
