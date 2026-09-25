import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MomentsMark, type MarkState } from '@/components/brand/moments-mark';
import type { Chapter } from '@/components/brand/particles/particle-field';
import { ParticleStage } from '@/components/brand/particles/particle-stage';
import { S2SMark } from '@/components/brand/s2s-mark';
import { Aurora, DotGrid, Grain } from '@/components/brand/textures';
import { Flag } from '@/components/icons/flag';
import { Character } from '@/components/mascot/character';
import type { PoseName } from '@/components/mascot/poses';
import { ArrowUpRight, Bell, ChevronLeft, ICON_STROKE, Plus, Sparkles, Trash } from '@/components/icons/lucide';
import { Avatar, AvatarStack } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { FolderCard } from '@/components/ui/folder-card';
import { HalfDonut } from '@/components/ui/half-donut';
import { IconButton } from '@/components/ui/icon-button';
import { ProgressDots } from '@/components/ui/progress-dots';
import { ProgressRing } from '@/components/ui/progress-ring';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { Skeleton } from '@/components/ui/skeleton';
import { StateChip } from '@/components/ui/state-chip';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Surface } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import { UnderlineTabs } from '@/components/ui/underline-tabs';
import { WordReveal } from '@/components/ui/word-reveal';
import { setPrefs, usePrefs } from '@/data/prefs';
import { GUTTER, ink, tints, useTheme } from '@/theme';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.block}>
      <Text variant="overline" tone="subtle">
        {title}
      </Text>
      {children}
    </View>
  );
}

const MARK_STATES: MarkState[] = ['idle', 'thinking', 'planning', 'success', 'arriving', 'static'];
const CHAPTERS: Chapter[] = ['cloud', 'gift', 'calendar', 'mark', 'envelope', 'checklist', 'store', 'buyer', 'tag', 's2s', 'heart'];
const POSES: PoseName[] = ['idle', 'wave', 'pointUp', 'think', 'celebrate', 'carry', 'sleep', 'run'];

export default function Gallery() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const motion = usePrefs((p) => p.reduceMotion);
  const [step, setStep] = useState(1);
  const [seg, setSeg] = useState<'month' | 'agenda'>('month');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [on, setOn] = useState(true);
  const [chip, setChip] = useState('Birthday');
  const [replay, setReplay] = useState(0);
  const [pose, setPose] = useState<PoseName>('wave');
  const [chapter, setChapter] = useState<Chapter>('gift');
  const ic = t.color.text;

  return (
    <ScrollView
      style={{ backgroundColor: t.color.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 80, paddingHorizontal: GUTTER, gap: 28 }}>
      <View style={styles.row}>
        <IconButton label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}>
          <ChevronLeft color={ic} size={22} strokeWidth={ICON_STROKE} />
        </IconButton>
        <Text variant="title2">Gallery</Text>
      </View>

      <Block title="Motion">
        <View style={styles.between}>
          <Text variant="callout">Reduce motion</Text>
          <Toggle label="Reduce motion" value={motion === 'on'} onChange={(v) => setPrefs({ reduceMotion: v ? 'on' : 'system' })} />
        </View>
      </Block>

      <Block title="Moments mark">
        <View style={styles.wrap}>
          {MARK_STATES.map((s) => (
            <View key={`${s}-${replay}`} style={styles.markCell}>
              <MomentsMark size={92} state={s} />
              <Text variant="caption" tone="muted">
                {s}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <Button label="Replay" size="sm" variant="secondary" onPress={() => setReplay((n) => n + 1)} />
          <MomentsMark size={40} state="static" variant="mono" color={ink[400]} />
          <View style={{ backgroundColor: ink[950], borderRadius: 16, padding: 8 }}>
            <MomentsMark size={56} state="static" variant="light" />
          </View>
          <S2SMark size={48} state="idle" />
          <S2SMark size={48} state="searching" />
        </View>
      </Block>

      <Block title="Particles">
        <View style={[styles.stage, { backgroundColor: t.color.surface }]}>
          <ParticleStage width={335} height={300} chapters={CHAPTERS} chapter={chapter} look={'paper'} fit={0.8} />
        </View>
        <View style={styles.wrap}>
          {CHAPTERS.map((c) => (
            <Chip key={c} label={c} size="sm" selected={chapter === c} onPress={() => setChapter(c)} />
          ))}
        </View>
      </Block>

      <Block title="Cast">
        <View style={styles.wrap}>
          {(['mo', 'dot', 'tiers', 'bloop', 'pip'] as const).map((k) => (
            <Character key={k} kind={k} pose={pose} size={100} prop={pose === 'carry' && k === 'mo' ? 'bag' : pose === 'celebrate' ? 'confetti' : pose === 'sleep' ? 'zzz' : pose === 'pointUp' ? 'sparkles' : 'none'} />
          ))}
        </View>
        <View style={styles.wrap}>
          {POSES.map((p) => (
            <Chip key={p} label={p} size="sm" selected={pose === p} onPress={() => setPose(p)} />
          ))}
        </View>
        <Character kind="mo" pose={pose} size={200} prop={pose === 'carry' ? 'bag' : pose === 'celebrate' ? 'confetti' : pose === 'sleep' ? 'zzz' : pose === 'run' ? 'calendar' : 'none'} style={{ alignSelf: 'center' }} />
      </Block>

      <Block title="Type">
        <WordReveal key={replay} lines={['Big days,', { text: 'handled.', color: ink[300] }]} variant="display" />
        <Text variant="title1">Good day, Ava</Text>
        <Text variant="title3">Your move</Text>
        <Text variant="body" tone="muted">
          A person on your S2S team checks every plan.
        </Text>
        <View style={styles.row}>
          <Text variant="numeral" color={t.color.goldText}>
            24
          </Text>
          <Text variant="headline">days to go</Text>
        </View>
        <Text variant="overline" tone="subtle">
          Landed to Kingston
        </Text>
      </Block>

      <Block title="Buttons">
        <Button label="Let's plan" variant="primary" size="lg" block />
        <Button label="Plan it" variant="gold" size="lg" block leading={<Sparkles color={t.color.onGold} size={18} strokeWidth={ICON_STROKE} />} />
        <View style={styles.row}>
          <Button label="Secondary" variant="secondary" />
          <Button label="Glass" variant="glass" />
        </View>
        <View style={styles.row}>
          <Button label="Open bin" variant="danger" size="sm" leading={<Trash color={t.color.discount} size={15} strokeWidth={ICON_STROKE} />} />
          <Button label="Ghost" variant="ghost" size="sm" />
          <Button label="Navy" variant="navy" size="sm" />
        </View>
        <View style={styles.row}>
          <IconButton label="Notifications" badge>
            <Bell color={ic} size={20} strokeWidth={ICON_STROKE} />
          </IconButton>
          <IconButton label="Add" variant="gold" size={56}>
            <Plus color={t.color.onGold} size={26} strokeWidth={2.6} />
          </IconButton>
          <IconButton label="Open" variant="surface" size={36}>
            <ArrowUpRight color={ic} size={18} strokeWidth={ICON_STROKE} />
          </IconButton>
          <IconButton label="Open" variant="navy" size={36}>
            <ArrowUpRight color="#fff" size={18} strokeWidth={ICON_STROKE} />
          </IconButton>
        </View>
      </Block>

      <Block title="Chips">
        <View style={styles.wrap}>
          {['Birthday', 'Baby shower', 'Wedding', 'Holidays'].map((c) => (
            <Chip key={c} label={c} selected={chip === c} onPress={() => setChip(c)} />
          ))}
          <Chip label="Deliver to Jamaica" tone="glass" leading={<Flag code="JM" size={18} shape="circle" />} />
          <Chip label="3 options" tone="gold" size="sm" />
        </View>
        <View style={styles.wrap}>
          <StateChip label="Ready to pick" tone="gold" />
          <StateChip label="With your S2S team" tone="neutral" live />
          <StateChip label="Chosen" tone="green" />
          <StateChip label="Closed" tone="muted" />
        </View>
      </Block>

      <Block title="People">
        <View style={styles.row}>
          <Avatar name="Ava Brown" size={48} />
          <Avatar name="Keisha Campbell" size={48} tint={tints.babyShower} />
          <Avatar name="Mo" size={48} ring={t.color.gold} />
          <AvatarStack people={[{ name: 'Ava B' }, { name: 'Jordan K' }, { name: 'Tia M' }, { name: 'R L' }, { name: 'S P' }]} size={32} />
          <AvatarStack people={[{ name: 'Ava B' }, { name: 'Jordan K' }]} extra="1.2K" size={32} />
        </View>
      </Block>

      <Block title="Progress">
        <ProgressDots items={['done', 'done', 'done', 'half', 'todo', 'todo', 'todo', 'todo']} />
        <View style={styles.row}>
          <ProgressRing value={6 / 9} size={56} stroke={5}>
            <Text variant="caption">6/9</Text>
          </ProgressRing>
          <ProgressRing value={0.35} size={44} color={t.color.success} />
          <HalfDonut
            width={180}
            thickness={16}
            total={126000}
            segments={[
              { key: 'decor', value: 18000, color: t.color.gold },
              { key: 'food', value: 34000, color: tints.babyShower.deep },
              { key: 'cake', value: 9000, color: tints.dinner.deep },
              { key: 'venue', value: 31000, color: tints.gift.deep },
            ]}>
            <Text variant="numeralSm">J$92k</Text>
          </HalfDonut>
        </View>
        <StepIndicator steps={['About you', 'Your dates', 'Deliver to', 'Reach me']} current={step} />
        <View style={styles.row}>
          <Button label="Back" size="sm" variant="secondary" onPress={() => setStep((s) => Math.max(0, s - 1))} />
          <Button label="Next" size="sm" onPress={() => setStep((s) => Math.min(3, s + 1))} />
        </View>
      </Block>

      <Block title="Controls">
        <Segmented
          options={[
            { value: 'month', label: 'Month' },
            { value: 'agenda', label: 'Agenda' },
          ]}
          value={seg}
          onChange={setSeg}
        />
        <UnderlineTabs
          options={[
            { value: 'upcoming', label: 'Upcoming', count: 4 },
            { value: 'past', label: 'Past' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <View style={styles.between}>
          <Text variant="callout">WhatsApp updates</Text>
          <Toggle label="WhatsApp updates" value={on} onChange={setOn} />
        </View>
      </Block>

      <Block title="Surfaces">
        <Surface padded elevation="lift" style={{ gap: 10 }}>
          <SectionHeader title="Your move" eyebrow="Needs you" count={3} accent action="See all" />
          <Skeleton width="70%" />
          <Skeleton width="40%" delay={200} />
          <View style={styles.row}>
            <Skeleton width={64} height={28} radius={14} delay={300} />
            <Skeleton width={90} height={28} radius={14} delay={400} />
          </View>
        </Surface>
        <FolderCard
          tabWidth={132}
          tab={
            <Text variant="caption" tone="muted">
              Sat · 17 Oct
            </Text>
          }>
          <Text variant="headline">Ava&apos;s 30th</Text>
          <Text variant="footnote" tone="muted">
            Rooftop · Kingston · 25 guests
          </Text>
        </FolderCard>
        <View style={styles.row}>
          {(['JM', 'TT', 'GM', 'GH'] as const).map((c) => (
            <Flag key={c} code={c} size={26} />
          ))}
          {(['JM', 'TT', 'GM', 'GH'] as const).map((c) => (
            <Flag key={`${c}c`} code={c} size={26} shape="circle" />
          ))}
        </View>
      </Block>

      <Block title="Textures">
        <View style={[styles.texture, { backgroundColor: t.color.bgSoft }]}>
          <Aurora />
          <DotGrid />
          <Text variant="headline" style={{ margin: 16 }}>
            Aurora + dot grid
          </Text>
        </View>
        <View style={[styles.texture, { backgroundColor: tints.birthday.bg }]}>
          <Grain opacity={0.14} />
          <Text variant="headline" color={tints.birthday.ink} style={{ margin: 16 }}>
            Grain on tint
          </Text>
        </View>
      </Block>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  block: { gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  markCell: { alignItems: 'center', gap: 6, width: 100 },
  texture: { height: 160, borderRadius: 24, overflow: 'hidden' },
  stage: { height: 300, borderRadius: 28, overflow: 'hidden', alignItems: 'center' },
});
