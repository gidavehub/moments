import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowRight, ChevronLeft, ICON_STROKE } from '@/components/icons/lucide';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Text } from '@/components/ui/text';
import { TwoTone } from '@/components/ui/two-tone';
import { alpha, enter, gradient, GUTTER, kf, spring, useTheme } from '@/theme';

export const STEPS = ['About you', 'Your dates', 'Deliver to', 'Reach me'];

/** Step pills: the current step stretches to 18pt; done and current are ink, the rest outline. */
function StepPills({ step }: { step: number }) {
  return (
    <View style={styles.pills} accessibilityRole="progressbar" accessibilityLabel={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
      {STEPS.map((s, i) => (
        <Pill key={s} state={i < step ? 'done' : i === step ? 'current' : 'todo'} />
      ))}
    </View>
  );
}

function Pill({ state }: { state: 'done' | 'current' | 'todo' }) {
  const t = useTheme();
  const style = useAnimatedStyle(() => ({ width: withSpring(state === 'current' ? 18 : 6, spring.standard) }));
  return <Animated.View style={[styles.pill, { backgroundColor: state === 'todo' ? alpha(t.color.navy, 0.16) : t.color.navy }, style]} />;
}

/**
 * Onboarding step chrome (YOBUMA's auth frame): a muted back circle and step pills, a two-tone
 * title with a subtitle, the step's content, and a docked gold action that content fades under.
 */
export function OnboardingFrame({
  step,
  lead,
  strong,
  sub,
  children,
  cta,
  onNext,
  secondary,
}: {
  step: number;
  /** Two-tone title: muted lead-in, then the payoff. */
  lead?: string;
  strong?: string;
  sub?: string;
  children: ReactNode;
  cta: string;
  onNext: () => void;
  secondary?: ReactNode;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={[styles.fill, { backgroundColor: t.color.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.head, { paddingTop: insets.top, height: insets.top + 64 }]}>
        <IconButton label="Back" size={44} variant="sunk" onPress={() => (router.canGoBack() ? router.back() : router.replace('/onboarding'))}>
          <ChevronLeft size={20} color={t.color.text} strokeWidth={ICON_STROKE} />
        </IconButton>
        <StepPills step={step} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: GUTTER + 4, paddingTop: 8, paddingBottom: insets.bottom + 150 }}>
        {lead && strong ? (
          <View style={styles.title}>
            <Animated.View style={enter(kf.riseIn, 60)}>
              <TwoTone lead={lead} strong={strong} />
            </Animated.View>
            {sub ? (
              <Animated.View style={enter(kf.riseIn, 105)}>
                <Text variant="bodyL" tone="muted">
                  {sub}
                </Text>
              </Animated.View>
            ) : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={[styles.fade, gradient(`linear-gradient(180deg, ${alpha(t.color.bg, 0)} 0%, ${t.color.bg} 100%)`)]} />
        <View style={[styles.actions, { backgroundColor: t.color.bg }]}>
          {secondary}
          <Button label={cta} variant="gold" size="lg" block onPress={onNext} trailing={<ArrowRight size={20} color={t.color.onGold} strokeWidth={2.4} />} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  pills: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 4 },
  pill: { height: 6, borderRadius: 3 },
  title: { gap: 10, marginBottom: 28 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  fade: { height: 18 },
  actions: { paddingHorizontal: GUTTER, paddingTop: 12, gap: 8 },
});
