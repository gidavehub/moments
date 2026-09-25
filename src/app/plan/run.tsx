import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, Keyframe } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RunTimeline, type StepStatus } from '@/components/agent/run-timeline';
import { StreamText } from '@/components/agent/stream-text';
import { MomentsMark } from '@/components/brand/moments-mark';
import type { Chapter } from '@/components/brand/particles/particle-field';
import { ParticleStage } from '@/components/brand/particles/particle-stage';
import { DotGrid } from '@/components/brand/textures';
import { SurfaceMark } from '@/components/system-bars/surface-mark';
import { ArrowRight, ICON_STROKE, X } from '@/components/icons/lucide';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { planReply, planSteps, stepsFor } from '@/data/agent-script';
import { daysUntil, momentById, progress, spend, useWorld } from '@/data/store';
import { haptic } from '@/lib/haptics';
import { moneyShort } from '@/lib/money';
import { alpha, cssEase, enter, GUTTER, kf, useTheme } from '@/theme';

const CHAPTERS: Chapter[] = ['cloud', ...planSteps.map((s) => s.shape), 'mark'];
const phaseIn = new Keyframe({ 0: { opacity: 0, transform: [{ translateY: 10 }] }, 100: { opacity: 1, transform: [{ translateY: 0 }] } }).duration(420);
const phaseOut = new Keyframe({ 0: { opacity: 1, transform: [{ translateY: 0 }] }, 100: { opacity: 0, transform: [{ translateY: -10 }] } }).duration(260);

type Phase = 'reading' | 'running' | 'arriving' | 'success';
const PHASE_LABEL: Record<Phase, string> = {
  reading: 'One moment — reading what you told us',
  running: 'One moment — we’re planning it with your S2S team',
  arriving: 'Bringing your plan together',
  success: 'Your plan is ready',
};

/**
 * The agent run (S2S agentic-experience run phases), for planning: the particle stage
 * re-forms for each step while the RunTimeline resolves, the reply streams in, and it lands
 * on the mark with a success burst.
 */
export default function PlanRun() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const w = useWorld();
  const moment = momentById(w, id ?? 'ava-30th') ?? w.moments[0];
  const [steps] = useState(() => stepsFor(moment, w.tasks));
  const reply =
    moment.id === 'ava-30th'
      ? planReply
      : `On it. ${moment.title}${moment.guests ? ` for ${moment.guests}` : ''}${moment.place === 'Your place' ? ' at yours' : ''} in ${moment.city} on US$${moment.budgetUsd.toLocaleString()} is very doable — here’s how we’d pull it off, and what we’ll need you to pick.`;
  const summary = { things: moment.items.length, estimate: spend(moment).estimate, needsYou: progress(moment).needs, days: daysUntil(moment.date) };
  const [status, setStatus] = useState<StepStatus[]>(planSteps.map(() => 'pending'));
  const [chapter, setChapter] = useState<Chapter>('cloud');
  const [phase, setPhase] = useState<Phase>('reading');
  const [replyGo, setReplyGo] = useState(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    let clock = 700;
    at(300, () => setReplyGo(true));
    steps.forEach((s, i) => {
      at(clock, () => {
        setPhase('running');
        setChapter(s.shape);
        setStatus((st) => st.map((v, k) => (k === i ? 'active' : v)));
        scroll.current?.scrollToEnd({ animated: true });
      });
      clock += s.ms;
      at(clock, () => {
        haptic.select();
        setStatus((st) => st.map((v, k) => (k === i ? 'done' : v)));
      });
      clock += 180;
    });
    at(clock + 100, () => {
      setPhase('arriving');
      setChapter('mark');
    });
    at(clock + 1700, () => {
      setPhase('success');
      haptic.success();
      setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 250);
    });
    return () => timers.forEach(clearTimeout);
  }, [steps]);

  const stageW = width - GUTTER * 2;
  const stageH = Math.min(300, stageW * 0.82);

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 140 }}>
        <View style={[styles.gutter, styles.top]}>
          <View style={{ flex: 1 }}>
            <Text variant="overline" tone="subtle">
              Planning with Shop2Ship
            </Text>
            <Text variant="title3" numberOfLines={1}>
              {moment.title}
            </Text>
          </View>
          <IconButton label="Close" onPress={() => router.replace('/home')}>
            <X size={20} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
        </View>

        {/* Particle stage */}
        <View style={styles.gutter}>
          <View style={[styles.stage, { height: stageH, backgroundColor: t.color.surface, boxShadow: t.shadow.float, borderColor: t.color.hairline }]}>
            <DotGrid />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                phase === 'success' && { animationName: kf.fadeIn, animationDuration: 600, animationDirection: 'reverse', animationFillMode: 'forwards', animationTimingFunction: cssEase.expo },
              ]}>
              <ParticleStage width={stageW} height={stageH} chapters={CHAPTERS} chapter={chapter} look="paper" fit={0.72} morphMs={1300} bg={t.color.surface} />
            </Animated.View>
            {phase === 'success' && (
              <Animated.View entering={FadeIn.duration(500)} style={styles.stageMark}>
                <MomentsMark size={stageH * 0.72} state="success" />
              </Animated.View>
            )}
          </View>
          <View style={styles.phase}>
            <Animated.View key={phase} entering={phaseIn} exiting={phaseOut} style={styles.phaseRow}>
              {phase !== 'success' && <MomentsMark size={28} state="thinking" />}
              <Text variant="callout" tone={phase === 'success' ? 'gold' : 'muted'}>
                {PHASE_LABEL[phase]}
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* Reply */}
        <View style={[styles.gutter, { marginTop: 8 }]}>
          <View style={[styles.bubble, { backgroundColor: t.color.surface, borderColor: t.color.hairline }]}>
            <StreamText text={reply} start={replyGo} variant="body" />
          </View>
        </View>

        {/* Timeline */}
        <View style={[styles.gutter, { marginTop: 22 }]}>
          <RunTimeline steps={steps} status={status} />
        </View>

        {/* Summary */}
        {phase === 'success' && (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={[styles.gutter, { marginTop: 24 }]}>
            <View style={[styles.summary, { backgroundColor: t.color.navy, boxShadow: t.shadow.cathedral }]}>
              <SurfaceMark />
              <Text variant="overline" color={t.color.gold}>
                Your plan is ready
              </Text>
              <Text variant="title2" color="#FFFFFF">
                {summary.things} things to sort
              </Text>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text variant="numeralSm" color={t.color.gold}>
                    {moneyShort(summary.estimate)}
                  </Text>
                  <Text variant="caption" color={alpha('#FFFFFF', 0.7)}>
                    landed estimate
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: alpha('#FFFFFF', 0.14) }]} />
                <View style={styles.stat}>
                  <Text variant="numeralSm" color="#FFFFFF">
                    {summary.needsYou}
                  </Text>
                  <Text variant="caption" color={alpha('#FFFFFF', 0.7)}>
                    need you
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: alpha('#FFFFFF', 0.14) }]} />
                <View style={styles.stat}>
                  <Text variant="numeralSm" color="#FFFFFF">
                    {summary.days}
                  </Text>
                  <Text variant="caption" color={alpha('#FFFFFF', 0.7)}>
                    days to go
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {phase === 'success' && (
        <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 14 }, enter(kf.riseIn, 300, 520, cssEase.expo)]}>
          <Button
            label="See your plan"
            variant="gold"
            size="lg"
            block
            trailing={<ArrowRight size={18} color={t.color.onGold} strokeWidth={ICON_STROKE} />}
            onPress={() => router.replace({ pathname: '/moment/[id]', params: { id: moment.id } })}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  stage: { borderRadius: 32, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderCurve: 'continuous' },
  stageMark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  phase: { height: 40, justifyContent: 'center', marginTop: 8 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bubble: { borderRadius: 22, borderTopLeftRadius: 8, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  summary: { borderRadius: 28, padding: 20, gap: 6 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  stat: { flex: 1, gap: 2 },
  divider: { width: 1, height: 36, marginHorizontal: 10 },
  footer: { position: 'absolute', left: GUTTER, right: GUTTER, bottom: 0 },
});
