import { router } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Character } from '@/components/mascot/character';
import { OnboardingFrame } from '@/components/onboarding/frame';
import { setPrefs, usePrefs } from '@/data/prefs';
import { cssEase, enter, fonts, kf, useTheme } from '@/theme';

export default function NameStep() {
  const t = useTheme();
  const name = usePrefs((p) => p.name);
  return (
    <OnboardingFrame
      step={0}
      lead="Hi, I’m Mo. What should we "
      strong="call you?"
      sub="Your S2S team uses it on WhatsApp and in every plan."
      cta="Continue"
      onNext={() => router.push('/onboarding/dates')}>
      <Animated.View style={[styles.hero, enter(kf.popIn, 160, 520, cssEase.spring)]}>
        <Character kind="mo" pose="wave" size={150} />
      </Animated.View>
      <Animated.View style={enter(kf.riseIn, 220)}>
        <View style={[styles.field, { backgroundColor: t.color.surface, borderColor: t.color.gold, boxShadow: `${t.shadow.ring}, ${t.shadow.plate}` }]}>
          <TextInput
            value={name}
            onChangeText={(v) => setPrefs({ name: v })}
            placeholder="Your first name"
            placeholderTextColor={t.color.textSubtle}
            autoFocus={false}
            style={[styles.input, { color: t.color.text, fontFamily: fonts.bold }]}
            accessibilityLabel="Your first name"
          />
        </View>
      </Animated.View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: -12, marginBottom: 12 },
  field: { height: 62, borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 18, justifyContent: 'center', borderCurve: 'continuous' },
  input: { fontSize: 22 },
});
