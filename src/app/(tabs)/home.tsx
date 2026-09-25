import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AskPill } from '@/components/agent/ask-pill';
import { Aurora } from '@/components/brand/textures';
import { AgendaCard } from '@/components/calendar/agenda-card';
import { DatePills } from '@/components/calendar/date-pills';
import { NeedsYouRow } from '@/components/home/needs-you-row';
import { SuggestionCard } from '@/components/home/suggestion-card';
import { TidyBanner } from '@/components/home/tidy-banner';
import { WalkInCard } from '@/components/home/walk-in-card';
import { Bell, CalendarDays, ICON_STROKE, Sparkles } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { NextUpCarousel } from '@/components/moment/next-up-carousel';
import { useChromeInsets, useChromeScroll } from '@/components/navigation/chrome';
import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { ProgressDots, type DotState } from '@/components/ui/progress-dots';
import { SectionHeader } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { WordReveal } from '@/components/ui/word-reveal';
import { today } from '@/data/clock';
import { photoOf } from '@/data/people';
import { usePrefs } from '@/data/prefs';
import { reviewTasks, tasksOn, upcoming, useWorld, yourMove } from '@/data/store';
import { fmt, weekOf, ymd } from '@/lib/dates';
import { enter, GUTTER, ink, kf, useTheme } from '@/theme';

function greeting(h: number) {
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good day,';
  return 'Good evening,';
}

export default function Home() {
  const t = useTheme();
  const w = useWorld();
  const name = usePrefs((p) => p.name);
  const insets = useChromeInsets();
  const onScroll = useChromeScroll();
  const now = today();
  const [day, setDay] = useState(now);

  const moments = useMemo(() => upcoming(w), [w]);
  const moves = useMemo(() => yourMove(w), [w]);
  const week = useMemo(() => weekOf(now), [now]);
  const dayTasks = useMemo(() => tasksOn(w, ymd(day)).sort((a, b) => Number(a.done) - Number(b.done)), [w, day]);
  const loose = reviewTasks(w);

  const monthTasks = w.tasks.filter((x) => x.due.slice(0, 7) === ymd(now).slice(0, 7) && !x.binned);
  const doneCount = monthTasks.filter((x) => x.done).length;
  const dots: DotState[] = monthTasks.slice(0, 9).map((x, i) => (x.done ? 'done' : i === doneCount ? 'half' : 'todo'));

  const dotsFor = (d: Date) =>
    tasksOn(w, ymd(d))
      .slice(0, 3)
      .map((x) => (x.done ? t.color.success : t.color.gold));

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      <View style={[styles.auroraWrap, { pointerEvents: 'none' }]}>
        <Aurora intensity={0.8} />
      </View>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom }}>
        {/* Header */}
        <View style={[styles.header, styles.gutter]}>
          <Avatar crop={photoOf('ava')} name="Ava Brown" size={48} ring={t.color.gold} ringWidth={2.5} />
          <View style={{ flex: 1 }}>
            <Animated.View style={enter(kf.fadeIn, 100, 500)}>
              <Text variant="callout" tone="muted">
                {greeting(now.getHours())}
              </Text>
            </Animated.View>
            <WordReveal lines={[name]} variant="title1" delay={120} />
          </View>
          <IconButton label="Notifications" badge onPress={() => router.push('/notifications')}>
            <Bell size={20} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
          <IconButton label="Calendar" onPress={() => router.push('/calendar')}>
            <CalendarDays size={20} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
        </View>

        <Animated.View style={[styles.gutter, styles.sub, enter(kf.riseIn, 260)]}>
          <View style={[styles.plus, { backgroundColor: t.color.state.gold.bg }]}>
            <Sparkles size={14} color={t.color.state.gold.fg} strokeWidth={ICON_STROKE} />
            <Text variant="caption" color={t.color.state.gold.fg}>
              S2S Plus
            </Text>
          </View>
          <Text variant="callout" tone="muted">
            <Text variant="callout">4 plans</Text> left this month
          </Text>
        </Animated.View>

        <Animated.View style={[styles.gutter, styles.progress, enter(kf.riseIn, 320)]}>
          <ProgressDots items={dots} />
          <Text variant="caption" tone="muted">
            {fmt.monthLong(now)} · {doneCount} of {monthTasks.length} sorted
          </Text>
        </Animated.View>

        <Animated.View style={[styles.gutter, { marginTop: 18 }, enter(kf.riseIn, 380)]}>
          <AskPill />
        </Animated.View>

        {/* Next up */}
        <SectionHeader title="Next up" eyebrow={`${moments.length} moments coming`} action="See all" onAction={() => router.push('/calendar')} style={[styles.gutter, styles.section]} />
        <NextUpCarousel moments={moments} />

        {/* Your move */}
        <SectionHeader title="Your move" eyebrow="Needs you" count={moves.length || undefined} accent={moves.length > 0} style={[styles.gutter, styles.section]} />
        <View style={[styles.gutter, styles.stack]}>
          {moves.length ? (
            moves.slice(0, 4).map((m, i) => <NeedsYouRow key={`${m.moment.id}-${m.item.id}`} moment={m.moment} item={m.item} index={i} />)
          ) : (
            <View style={[styles.empty, { backgroundColor: t.color.state.green.bg }]}>
              <Character kind="mo" pose="celebrate" size={84} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">All caught up</Text>
                <Text variant="footnote" tone="muted">
                  Nothing needs you right now — your S2S team is on the rest.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* This week */}
        <SectionHeader title="This week" eyebrow={fmt.long(day)} style={[styles.gutter, styles.section]} />
        <DatePills days={week} selected={day} today={now} dotsFor={dotsFor} onSelect={setDay} />
        <View style={[styles.gutter, styles.stack, { marginTop: 6 }]}>
          {dayTasks.length ? (
            dayTasks.map((task, i) => (
              <AgendaCard key={task.id} task={task} moment={w.moments.find((m) => m.id === task.momentId)} highlight={i === 0 && !task.done} index={i} />
            ))
          ) : (
            <View style={[styles.empty, { backgroundColor: t.color.bgSunk }]}>
              <Character kind="dot" pose="sleep" size={84} prop="zzz" />
              <View style={{ flex: 1 }}>
                <Text variant="headline">Nothing planned</Text>
                <Text variant="footnote" tone="muted">
                  Enjoy the quiet. Your S2S team is still on it.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* S2S team, live */}
        <SectionHeader title="Your S2S team" eyebrow="Happening now" style={[styles.gutter, styles.section]} />
        <View style={styles.gutter}>
          <WalkInCard />
        </View>

        {/* Suggestions */}
        <SectionHeader title="Coming up on your calendar" style={[styles.gutter, styles.section]} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12, paddingVertical: 6 }}>
          <SuggestionCard
            eyebrow="In 9 weeks"
            title="Thanksgiving — start planning?"
            cta="Plan it"
            tint="holiday"
            cast="pip"
            pose="wave"
            onPress={() => router.push({ pathname: '/idea/[slug]', params: { slug: 'friendsgiving-12' } })}
          />
          <SuggestionCard
            eyebrow="Oct 3 · in 10 days"
            title="Mom’s birthday — see gift ideas"
            cta="4 ideas ready"
            tint="gift"
            cast="mo"
            pose="carry"
            prop="bag"
            onPress={() => router.push({ pathname: '/moment/[id]', params: { id: 'mom-birthday' } })}
          />
          <SuggestionCard
            eyebrow="Book by Nov 1"
            title="Christmas barrel to MoBay"
            cta="See the plan"
            tint="dinner"
            cast="dot"
            pose="pointUp"
            prop="sparkles"
            onPress={() => router.push({ pathname: '/idea/[slug]', params: { slug: 'send-home-barrel' } })}
          />
        </ScrollView>

        {/* Tidy-up */}
        <View style={[styles.gutter, styles.section]}>
          <TidyBanner month={fmt.monthLong(now)} count={loose.length} dots={dots} />
        </View>

        <View style={[styles.gutter, styles.sign]}>
          <Text variant="caption" color={ink[300]} align="center">
            Moments by Shop2Ship · every price landed to your door
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  auroraWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 520 },
  gutter: { paddingHorizontal: GUTTER },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sub: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  plus: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, height: 26, borderRadius: 13 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' },
  section: { marginTop: 30, marginBottom: 12 },
  stack: { gap: 10 },
  empty: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 24 },
  sign: { marginTop: 28 },
});

