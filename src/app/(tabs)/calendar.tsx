import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { AgendaCard } from '@/components/calendar/agenda-card';
import { MonthGrid, type DayMark } from '@/components/calendar/month-grid';
import { ArrowUpRight, CalendarCheck, ChevronLeft, ChevronRight, ICON_STROKE } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { useChromeInsets, useChromeScroll } from '@/components/navigation/chrome';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { art } from '@/data/art';
import { today } from '@/data/clock';
import { kindMeta } from '@/data/kinds';
import { daysUntil, progress, useWorld } from '@/data/store';
import type { Moment } from '@/data/types';
import { addMonths, fmt, parseYmd, relativeDay, ymd } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { alpha, GUTTER, tints, useTheme } from '@/theme';

const HOLIDAYS: Record<string, string> = { '2026-10-19': 'Heroes Day', '2026-11-26': 'Thanksgiving (US)', '2026-12-25': 'Christmas Day', '2026-12-26': 'Boxing Day' };

function MomentDayCard({ m }: { m: Moment }) {
  const t = useTheme();
  const meta = kindMeta[m.kind];
  const tn = tints[meta.tint];
  const a = art(m.cover);
  const p = progress(m);
  return (
    <PressableScale haptics="tap" to={0.98} onPress={() => router.push({ pathname: '/moment/[id]', params: { id: m.id } })} style={[styles.momentCard, { backgroundColor: a?.bg ?? tn.bg, boxShadow: t.shadow.lift }]}>
      <View style={styles.thumb}>{a ? <Image accessibilityLabel="" accessible={false} source={a.source} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Character kind={m.cast} size={70} still />}</View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="overline" color={alpha(tn.ink, 0.75)}>
          {m.occasion ?? meta.label} · {m.time}
        </Text>
        <Text variant="headline" color={tn.ink} numberOfLines={1}>
          {m.title}
        </Text>
        <Text variant="footnote" color={alpha(tn.ink, 0.75)} numberOfLines={1}>
          {m.place}
        </Text>
        <Text variant="caption" color={tn.ink}>
          {p.sorted}/{p.total} sorted · {p.needs} need you
        </Text>
      </View>
      <View style={[styles.go, { backgroundColor: tn.ink }]}>
        <ArrowUpRight size={18} color="#FFFFFF" strokeWidth={ICON_STROKE} />
      </View>
    </PressableScale>
  );
}

export default function Calendar() {
  const t = useTheme();
  const w = useWorld();
  const { width } = useWindowDimensions();
  const insets = useChromeInsets();
  const onScroll = useChromeScroll();
  const now = today();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [dir, setDir] = useState<1 | -1>(1);
  const [day, setDay] = useState(now);
  const [mode, setMode] = useState<'month' | 'agenda'>('month');
  const gridW = width - GUTTER * 2;

  const byDay = useMemo(() => {
    const m = new Map<string, Moment[]>();
    w.moments.forEach((x) => m.set(x.date, [...(m.get(x.date) ?? []), x]));
    return m;
  }, [w.moments]);

  const marks = (d: Date): DayMark => {
    const key = ymd(d);
    const ms = byDay.get(key);
    const tasks = w.tasks.filter((x) => x.due === key && !x.binned);
    return {
      moment: ms?.length ? tints[kindMeta[ms[0].kind].tint].bg : undefined,
      dots: [
        ...tasks.map((x) => (x.done ? t.color.success : t.color.gold)),
        ...(HOLIDAYS[key] ? [t.color.textSubtle] : []),
      ],
    };
  };

  const shift = (n: 1 | -1) => {
    haptic.select();
    setDir(n);
    setMonth((m) => addMonths(m, n));
  };
  const swipe = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .onEnd((e) => {
      if (e.translationX < -60 || e.velocityX < -600) scheduleOnRN(shift, 1);
      else if (e.translationX > 60 || e.velocityX > 600) scheduleOnRN(shift, -1);
    });

  const key = ymd(day);
  const dayMoments = byDay.get(key) ?? [];
  const dayTasks = w.tasks.filter((x) => x.due === key && !x.binned);

  const agenda = useMemo(() => {
    const keys = new Set<string>([...w.tasks.filter((x) => !x.binned && x.due >= ymd(now)).map((x) => x.due), ...w.moments.map((x) => x.date)]);
    return [...keys].sort().slice(0, 14);
  }, [w, now]);

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom }}>
        <View style={[styles.gutter, styles.head]}>
          <View style={{ flex: 1 }}>
            <Text variant="overline" tone="subtle">
              Your calendar
            </Text>
            <Text variant="title1">{fmt.monthYear(month)}</Text>
          </View>
          <IconButton label="Previous month" size={40} onPress={() => shift(-1)}>
            <ChevronLeft size={20} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
          <IconButton label="Next month" size={40} onPress={() => shift(1)}>
            <ChevronRight size={20} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
        </View>

        <View style={[styles.gutter, { marginTop: 14 }]}>
          <View style={[styles.connected, { backgroundColor: t.color.successSoft }]}>
            <CalendarCheck size={16} color={t.color.state.green.fg} strokeWidth={ICON_STROKE} />
            <Text variant="caption" color={t.color.state.green.fg} style={{ flex: 1 }}>
              Google Calendar connected · 5 dates we’re watching
            </Text>
          </View>
        </View>

        <View style={[styles.gutter, { marginTop: 14 }]}>
          <Segmented
            options={[
              { value: 'month', label: 'Month' },
              { value: 'agenda', label: 'Agenda' },
            ]}
            value={mode}
            onChange={setMode}
          />
        </View>

        {mode === 'month' ? (
          <>
            <GestureDetector gesture={swipe}>
              <View style={[styles.gutter, { marginTop: 16, overflow: 'hidden' }]}>
                <Animated.View key={ymd(month)} entering={(dir > 0 ? SlideInRight : SlideInLeft).springify().damping(22)}>
                  <MonthGrid month={month} width={gridW} today={now} selected={day} marks={marks} onSelect={setDay} />
                </Animated.View>
              </View>
            </GestureDetector>

            <SectionHeader title={fmt.long(day)} eyebrow={relativeDay(now, day)} style={[styles.gutter, styles.section]} />
            <View style={[styles.gutter, { gap: 10 }]}>
              {HOLIDAYS[key] && (
                <View style={[styles.holiday, { backgroundColor: t.color.state.neutral.bg }]}>
                  <Text variant="callout">{HOLIDAYS[key]}</Text>
                  <Text variant="caption" tone="muted">
                    Public holiday
                  </Text>
                </View>
              )}
              {dayMoments.map((m) => (
                <Animated.View key={m.id} entering={FadeIn.duration(300)}>
                  <MomentDayCard m={m} />
                </Animated.View>
              ))}
              {dayTasks.map((task, i) => (
                <AgendaCard key={task.id} task={task} moment={w.moments.find((m) => m.id === task.momentId)} highlight={i === 0 && !task.done && !dayMoments.length} index={i} />
              ))}
              {!dayMoments.length && !dayTasks.length && !HOLIDAYS[key] && (
                <View style={[styles.empty, { backgroundColor: t.color.bgSunk }]}>
                  <Character kind="dot" pose="sleep" size={96} prop="zzz" />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text variant="headline">Nothing planned</Text>
                    <Text variant="footnote" tone="muted">
                      Enjoy the quiet — or plan something for this day.
                    </Text>
                    <PressableScale haptics="tap" onPress={() => router.push('/plan/new')}>
                      <Text variant="callout" tone="gold">
                        Plan a moment →
                      </Text>
                    </PressableScale>
                  </View>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={[styles.gutter, { marginTop: 18, gap: 22 }]}>
            {agenda.map((k) => {
              const d = parseYmd(k);
              const ms = byDay.get(k) ?? [];
              const ts = w.tasks.filter((x) => x.due === k && !x.binned);
              return (
                <View key={k} style={{ gap: 10 }}>
                  <View style={styles.agendaHead}>
                    <Text variant="numeralSm" style={{ width: 44 }}>
                      {d.getDate()}
                    </Text>
                    <View>
                      <Text variant="callout">{fmt.weekdayLong(d)}</Text>
                      <Text variant="caption" tone="muted">
                        {fmt.monthShort(d)} · {relativeDay(now, d)}
                        {ms.length ? ` · ${daysUntil(k)} days to ${ms[0].title}` : ''}
                      </Text>
                    </View>
                  </View>
                  {ms.map((m) => (
                    <MomentDayCard key={m.id} m={m} />
                  ))}
                  {ts.map((task, i) => (
                    <AgendaCard key={task.id} task={task} moment={w.moments.find((m) => m.id === task.momentId)} index={i} />
                  ))}
                </View>
              );
            })}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  head: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  connected: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 34, borderRadius: 17 },
  section: { marginTop: 22, marginBottom: 12 },
  momentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 24, borderCurve: 'continuous' },
  thumb: { width: 72, height: 72, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  go: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  holiday: { padding: 12, borderRadius: 18, gap: 2 },
  empty: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 24 },
  agendaHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
