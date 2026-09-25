import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, Keyframe, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VoiceWaveform } from '@/components/agent/voice-waveform';
import { Flag } from '@/components/icons/flag';
import { CalendarDays, Gift, ICON_STROKE, ImagePlus, Mic, PartyPopper, Sparkles, Square, Users, X } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { BudgetSlider } from '@/components/ui/budget-slider';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { WavePicker } from '@/components/ui/wave-picker';
import { TwoTone } from '@/components/ui/two-tone';
import { promptExamples, suggestionChips } from '@/data/agent-script';
import { ideaBySlug } from '@/data/fixtures/ideas';
import { usePrefs } from '@/data/prefs';
import { haptic } from '@/lib/haptics';
import { alpha, fonts, gradient, GUTTER, useReduced, useTheme } from '@/theme';

const lineIn = new Keyframe({ 0: { opacity: 0, transform: [{ translateY: 12 }] }, 100: { opacity: 1, transform: [{ translateY: 0 }] } }).duration(420);
const lineOut = new Keyframe({ 0: { opacity: 1, transform: [{ translateY: 0 }] }, 100: { opacity: 0, transform: [{ translateY: -12 }] } }).duration(300);

export type Intent = 'event' | 'gift' | 'date';

export interface PlanDraft {
  prompt: string;
  intent: Intent;
  guests: number;
  budgetUsd: number;
}
const INTENTS: { id: Intent; label: string; hint: string; prompt: string; Icon: typeof PartyPopper }[] = [
  { id: 'event', label: 'Plan an event', hint: 'A party, a shower, a dinner — the whole thing', prompt: 'Tell us the occasion, the headcount and the budget.', Icon: PartyPopper },
  { id: 'gift', label: 'Find a gift', hint: 'For someone you love, landed on time', prompt: 'Who is it for, and what do they love?', Icon: Gift },
  { id: 'date', label: 'Get ready for a date', hint: 'Christmas, back-to-school, a move', prompt: 'What’s the date, and what needs to be ready?', Icon: CalendarDays },
];

/**
 * The planner (S2S AgenticAskBar hero + polished request create): say what's coming up,
 * pick the kind of help, set guests and budget, and hand it to the agent + your S2S team.
 *
 * It has no entrance choreography of its own — the composer (or the route's presentation)
 * brings it in as one piece, which keeps opening smooth. `active` pauses its loops while it
 * waits pre-mounted; a new `resetKey` clears the draft for next time.
 */
export function Planner({
  idea,
  prompt,
  onClose,
  onSubmit,
  embedded = false,
  active = true,
  resetKey = 0,
}: {
  idea?: string;
  prompt?: string;
  onClose: () => void;
  onSubmit: (draft: PlanDraft) => void;
  /** Inside the composer: the composer's growing surface is the background. */
  embedded?: boolean;
  /** False while pre-mounted and hidden: loops rest. */
  active?: boolean;
  resetKey?: number;
}) {
  const t = useTheme();
  const reduced = useReduced();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const template = idea ? ideaBySlug(idea) : undefined;
  const city = usePrefs((p) => p.city);
  const dest = usePrefs((p) => p.destination);

  const [text, setText] = useState(prompt ?? (template ? `${template.title}${template.guests ? ` for ${template.guests}` : ''}` : ''));
  const [intent, setIntent] = useState<Intent>(template?.kind === 'gift' ? 'gift' : 'event');
  const [guests, setGuests] = useState(template?.guests ?? 25);
  const [budget, setBudget] = useState(800);
  const [recording, setRecording] = useState(false);
  const [ph, setPh] = useState(0);

  useEffect(() => {
    if (reduced || text || !active) return;
    const id = setInterval(() => setPh((n) => (n + 1) % promptExamples.length), 3200);
    return () => clearInterval(id);
  }, [reduced, text, active]);

  // A fresh draft after each plan (the composer keeps this mounted between opens).
  useEffect(() => {
    if (!resetKey) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setText('');
    setIntent('event');
    setGuests(25);
    setBudget(800);
    setRecording(false);
    setPh(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [resetKey]);

  const close = onClose;
  const submit = () => {
    haptic.press();
    onSubmit({ prompt: text.trim() || promptExamples[0], intent, guests, budgetUsd: budget });
  };

  return (
    <KeyboardAvoidingView style={[styles.fill, !embedded && { backgroundColor: t.color.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* A still, warm wash where the old aurora drifted — no per-frame work. */}
      <View style={[styles.wash, gradient(`linear-gradient(180deg, ${alpha(t.color.gold, 0.13)} 0%, ${alpha(t.color.gold, 0)} 100%)`)]} />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 130 }}>
        <View style={[styles.gutter, styles.top]}>
          <Character kind="mo" pose="wave" size={64} still={!active} />
          <View style={{ flex: 1 }} />
          <IconButton label="Close" onPress={close}>
            <X size={20} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
        </View>

        <View style={styles.gutter}>
          <TwoTone lead="What’s coming up? " strong="We’ll plan it with you." />
        </View>

        {/* Composer */}
        <View style={[styles.gutter, { marginTop: 20 }]}>
          <View style={[styles.composer, { backgroundColor: t.color.surface, borderColor: alpha(t.color.gold, 0.6), boxShadow: `${t.shadow.ring}, ${t.shadow.float}` }]}>
            <View style={{ minHeight: 76 }}>
              {!text && !recording && (
                <View style={[styles.phWrap, { pointerEvents: 'none' }]}>
                  <Animated.View key={ph} entering={lineIn} exiting={lineOut}>
                    <Text variant="body" tone="subtle">
                      {promptExamples[ph]}
                    </Text>
                  </Animated.View>
                </View>
              )}
              {recording ? (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.recording}>
                  <View style={[styles.recDot, { backgroundColor: t.color.discount }]} />
                  <VoiceWaveform active />
                  <Text variant="caption" tone="muted">
                    0:04
                  </Text>
                </Animated.View>
              ) : (
                <TextInput
                  value={text}
                  onChangeText={setText}
                  multiline
                  style={[styles.input, { color: t.color.text, fontFamily: fonts.medium }]}
                  accessibilityLabel="Describe your moment"
                />
              )}
            </View>
            <View style={styles.tools}>
              <PressableScale haptics="select" style={[styles.tool, { backgroundColor: t.color.state.neutral.bg }]} accessibilityLabel="Add a photo">
                <ImagePlus size={18} color={t.color.textMuted} strokeWidth={ICON_STROKE} />
              </PressableScale>
              <Chip label={city} size="sm" tone="navy" leading={<Flag code={dest} size={16} shape="circle" />} />
              <Chip label="Sat, Oct 17" size="sm" tone="navy" leading={<CalendarDays size={14} color={t.color.text} strokeWidth={ICON_STROKE} />} />
              <View style={{ flex: 1 }} />
              <PressableScale
                haptics="press"
                onPress={() => setRecording((r) => !r)}
                accessibilityLabel={recording ? 'Stop recording' : 'Record a voice note'}
                style={[styles.mic, { backgroundColor: recording ? t.color.navy : t.color.gold }]}>
                {recording ? <Square size={16} color="#FFFFFF" fill="#FFFFFF" /> : <Mic size={20} color={t.color.onGold} strokeWidth={ICON_STROKE} />}
              </PressableScale>
            </View>
          </View>
        </View>

        {/* Quick picks */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8, paddingVertical: 14 }}>
          {suggestionChips.map((c) => (
            <Chip key={c} label={c} size="sm" onPress={() => setText((s) => (s ? s : `${c} — `))} />
          ))}
        </ScrollView>

        {/* Intent */}
        <View style={[styles.gutter, { gap: 10 }]}>
          <Text variant="overline" tone="subtle">
            What kind of help?
          </Text>
          {INTENTS.map((it) => {
            const on = intent === it.id;
            return (
              <Animated.View key={it.id} layout={LinearTransition.springify().damping(20)}>
                <PressableScale
                  haptics="select"
                  to={0.985}
                  onPress={() => setIntent(it.id)}
                  accessibilityState={{ selected: on }}
                  style={[
                    styles.intent,
                    { backgroundColor: t.color.surface, borderColor: on ? t.color.gold : t.color.hairline, boxShadow: on ? `${t.shadow.ring}, ${t.shadow.plate}` : t.shadow.plate },
                  ]}>
                  <View style={[styles.intentIcon, { backgroundColor: on ? t.color.state.gold.bg : t.color.state.neutral.bg }]}>
                    <it.Icon size={20} color={on ? t.color.state.gold.fg : t.color.textMuted} strokeWidth={ICON_STROKE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="headline">{it.label}</Text>
                    <Text variant="footnote" tone="muted">
                      {it.hint}
                    </Text>
                    {on && (
                      <Animated.View entering={FadeIn.duration(300)}>
                        <Text variant="footnote" tone="gold" style={{ marginTop: 6 }}>
                          {it.prompt}
                        </Text>
                      </Animated.View>
                    )}
                  </View>
                  <View style={[styles.radio, { borderColor: on ? t.color.gold : t.color.border }]}>{on && <View style={[styles.radioDot, { backgroundColor: t.color.gold }]} />}</View>
                </PressableScale>
              </Animated.View>
            );
          })}
        </View>

        {/* Guests */}
        {intent === 'event' && (
          <Animated.View entering={FadeIn.duration(300)} style={[styles.card, { marginHorizontal: GUTTER, backgroundColor: t.color.surface, borderColor: t.color.hairline }]}>
            <View style={styles.cardHead}>
              <Users size={18} color={t.color.textMuted} strokeWidth={ICON_STROKE} />
              <Text variant="headline">How many guests?</Text>
            </View>
            <WavePicker min={2} max={80} value={guests} onChange={setGuests} width={width - GUTTER * 2 - 32} label="Guests" />
            <Text variant="caption" tone="muted" align="center">
              {guests} guests · we’ll size everything to fit
            </Text>
          </Animated.View>
        )}

        {/* Budget */}
        <View style={[styles.card, { marginHorizontal: GUTTER, backgroundColor: t.color.surface, borderColor: t.color.hairline }]}>
          <View style={styles.cardHead}>
            <Sparkles size={18} color={t.color.textMuted} strokeWidth={ICON_STROKE} />
            <Text variant="headline">Up to</Text>
          </View>
          <BudgetSlider value={budget} onChange={setBudget} />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: t.color.bg }]}>
        <Text variant="caption" tone="muted" align="center">
          A person on your S2S team checks every plan.
        </Text>
        <Button label="Plan it" variant="gold" size="lg" block leading={<Sparkles size={18} color={t.color.onGold} strokeWidth={ICON_STROKE} />} onPress={submit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  wash: { position: 'absolute', top: 0, left: 0, right: 0, height: 420, pointerEvents: 'none' },
  gutter: { paddingHorizontal: GUTTER },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  composer: { borderRadius: 30, borderWidth: 1.5, padding: 16, gap: 12, borderCurve: 'continuous' },
  phWrap: { position: 'absolute', top: 2, left: 0, right: 0 },
  input: { fontSize: 17, lineHeight: 24, minHeight: 76, textAlignVertical: 'top', padding: 0 },
  recording: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 76 },
  recDot: { width: 10, height: 10, borderRadius: 5 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tool: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  mic: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  intent: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, borderWidth: 1.5 },
  intentIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  card: { marginTop: 16, borderRadius: 26, padding: 16, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER, paddingTop: 10, gap: 10 },
});
