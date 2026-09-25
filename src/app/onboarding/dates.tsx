import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { CalendarDays, ICON_STROKE, Plus, X } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { OnboardingFrame } from '@/components/onboarding/frame';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { TwoTone } from '@/components/ui/two-tone';
import { people, photoOf } from '@/data/people';
import { haptic } from '@/lib/haptics';
import { cssEase, enter, kf, stagger, useTheme } from '@/theme';

const FOUND = [
  { id: 'pearl', label: 'Mom’s birthday', date: 'Oct 3' },
  { id: 'ava', label: 'Your 30th', date: 'Oct 17' },
  { id: 'tia', label: 'Tia’s birthday', date: 'Dec 2' },
  { id: 'shanice', label: 'Shanice’s baby shower', date: 'Nov 7' },
  { id: 'winston', label: 'Mom and Dad’s anniversary', date: 'Feb 14' },
];

/** DoMore "These are your top bands" → "These are the dates we found", with remove × rows. */
export default function DatesStep() {
  const t = useTheme();
  const [connected, setConnected] = useState(false);
  const [dates, setDates] = useState(FOUND);

  return (
    <OnboardingFrame step={1} cta={connected ? 'Save these dates' : 'Skip for now'} onNext={() => router.push('/onboarding/destination')}>
      {!connected ? (
        <Animated.View exiting={FadeOut.duration(200)}>
          <Animated.View style={[styles.hero, enter(kf.popIn, 100, 520, cssEase.spring)]}>
            <Character kind="dot" pose="pointUp" prop="sparkles" size={190} />
          </Animated.View>
          <TwoTone lead="Which moments " strong="matter to you?" align="center" />
          <Animated.View style={enter(kf.riseIn, 350)}>
            <Text variant="body" tone="muted" align="center" style={{ marginTop: 10 }}>
              Connect your calendar and we’ll spot the birthdays and big days — then start planning before you remember to.
            </Text>
          </Animated.View>
          <Animated.View style={[{ gap: 10, marginTop: 26 }, enter(kf.riseIn, 480)]}>
            <Button
              label="Connect Google Calendar"
              variant="gold"
              size="lg"
              block
              leading={<CalendarDays size={18} color={t.color.onGold} strokeWidth={ICON_STROKE} />}
              onPress={() => {
                haptic.success();
                setConnected(true);
              }}
            />
            <Button label="Add dates yourself" variant="secondary" size="lg" block leading={<Plus size={18} color={t.color.text} strokeWidth={ICON_STROKE} />} onPress={() => setConnected(true)} />
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(360)}>
          <TwoTone lead="These are the " strong="dates we found" />
          <Text variant="body" tone="muted" style={{ marginTop: 8 }}>
            If we got one wrong, remove it with the ×.
          </Text>
          <Animated.View layout={LinearTransition.springify().damping(20)} style={{ marginTop: 20 }}>
            {dates.map((d, i) => (
              <Animated.View
                key={d.id}
                layout={LinearTransition.springify().damping(20)}
                exiting={FadeOut.duration(220)}
                style={[styles.row, { borderColor: t.color.hairline }, enter(kf.riseIn, 120 + stagger(i, 70))]}>
                <Avatar crop={photoOf(d.id)} name={people[d.id]?.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Text variant="headline">{d.label}</Text>
                  <Text variant="footnote" tone="muted">
                    {d.date} · every year
                  </Text>
                </View>
                <PressableScale
                  haptics="select"
                  to={0.85}
                  accessibilityLabel={`Remove ${d.label}`}
                  onPress={() => setDates((all) => all.filter((x) => x.id !== d.id))}
                  style={[styles.remove, { backgroundColor: t.color.text }]}>
                  <X size={14} color={t.color.bg} strokeWidth={3} />
                </PressableScale>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.View>
      )}
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  remove: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
