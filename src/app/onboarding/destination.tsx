import { router } from 'expo-router';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { COUNTRY_NAMES, Flag, type CountryCode } from '@/components/icons/flag';
import { ICON_STROKE, MapPin } from '@/components/icons/lucide';
import { OnboardingFrame } from '@/components/onboarding/frame';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { setPrefs, usePrefs } from '@/data/prefs';
import { cssEase, enter, fonts, kf, stagger, useTheme } from '@/theme';

const CITIES: Record<CountryCode, string> = { JM: 'Kingston', TT: 'Port of Spain', GM: 'Banjul', GH: 'Accra' };

export default function DestinationStep() {
  const t = useTheme();
  const dest = usePrefs((p) => p.destination);
  const city = usePrefs((p) => p.city);
  return (
    <OnboardingFrame
      step={2}
      lead="Where do we "
      strong="deliver the moment?"
      sub="Every price we show is landed — shipping, duty and fees worked out to your door."
      cta="Continue"
      onNext={() => router.push('/onboarding/reach')}>
      <View style={styles.grid}>
        {(['JM', 'TT', 'GM', 'GH'] as CountryCode[]).map((c, i) => {
          const on = dest === c;
          return (
            <Animated.View key={c} style={[styles.cell, enter(kf.popIn, 200 + stagger(i, 70), 420, cssEase.spring)]}>
              <PressableScale
                haptics="select"
                to={0.96}
                onPress={() => setPrefs({ destination: c, city: CITIES[c] })}
                accessibilityState={{ selected: on }}
                style={[
                  styles.card,
                  { backgroundColor: t.color.surface, borderColor: on ? t.color.gold : t.color.hairline, boxShadow: on ? `${t.shadow.ring}, ${t.shadow.lift}` : t.shadow.plate },
                ]}>
                <Flag code={c} size={44} />
                <Text variant="headline" style={{ marginTop: 10 }}>
                  {COUNTRY_NAMES[c]}
                </Text>
                <Text variant="caption" tone="muted">
                  {CITIES[c]}
                </Text>
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
      <Animated.View style={[styles.field, { backgroundColor: t.color.surface, borderColor: t.color.hairline }, enter(kf.riseIn, 520)]}>
        <MapPin size={18} color={t.color.textMuted} strokeWidth={ICON_STROKE} />
        <TextInput
          value={city}
          onChangeText={(v) => setPrefs({ city: v })}
          placeholder="City or parish"
          placeholderTextColor={t.color.textSubtle}
          style={[styles.input, { color: t.color.text, fontFamily: fonts.semibold }]}
        />
      </Animated.View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 22 },
  cell: { width: '47.8%' },
  card: { padding: 16, borderRadius: 24, borderWidth: 1.5 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, height: 56, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 16 },
});
