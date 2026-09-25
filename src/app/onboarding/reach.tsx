import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ICON_STROKE, Mail, Smartphone } from '@/components/icons/lucide';
import { OnboardingFrame } from '@/components/onboarding/frame';
import { Avatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import { photoOf } from '@/data/people';
import { setPrefs, usePrefs } from '@/data/prefs';
import { brand, enter, kf, stagger, useTheme } from '@/theme';

function WhatsApp({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5Z"
        fill={brand.whatsapp}
      />
      <Path
        d="M9.2 7.6c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.1.6.5 0 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.3-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5v-.5l-.9-2Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export default function ReachStep() {
  const t = useTheme();
  const ch = usePrefs((p) => p.channels);
  const rows = [
    { key: 'whatsapp' as const, icon: <WhatsApp />, label: 'WhatsApp', hint: 'English or Patwa. A real person picks it up.' },
    { key: 'push' as const, icon: <Smartphone size={20} color={t.color.textMuted} strokeWidth={ICON_STROKE} />, label: 'Push notifications', hint: 'When something needs you' },
    { key: 'email' as const, icon: <Mail size={20} color={t.color.textMuted} strokeWidth={ICON_STROKE} />, label: 'Email', hint: 'Quotes and receipts' },
  ];
  return (
    <OnboardingFrame
      step={3}
      lead="How should your S2S team "
      strong="reach you?"
      sub="A real person on your S2S team — never a bot you can’t talk back to."
      cta="Finish"
      onNext={() => router.push('/onboarding/done')}>

      <Animated.View style={[styles.bubbleWrap, enter(kf.riseIn, 260)]}>
        <Avatar crop={photoOf('keisha')} name="Keisha" size={40} ring={brand.whatsapp} />
        <View style={[styles.bubble, { backgroundColor: '#E7F8EC' }]}>
          <Text variant="caption" color={brand.whatsapp}>
            Keisha · S2S team
          </Text>
          <Text variant="callout">Mawnin Ava! Mi find di cake — gold drip, serves 30. Yuh want mi hold it? 🎂</Text>
        </View>
      </Animated.View>

      <View style={[styles.group, { backgroundColor: t.color.surface, borderColor: t.color.hairline, boxShadow: t.shadow.plate }]}>
        {rows.map((r, i) => (
          <Animated.View key={r.key} style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: t.color.hairline }, enter(kf.riseIn, 380 + stagger(i, 70))]}>
            <View style={[styles.icon, { backgroundColor: t.color.state.neutral.bg }]}>{r.icon}</View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{r.label}</Text>
              <Text variant="footnote" tone="muted">
                {r.hint}
              </Text>
            </View>
            <Toggle label={r.label} value={ch[r.key]} onChange={(v) => setPrefs({ channels: { ...ch, [r.key]: v } })} />
          </Animated.View>
        ))}
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 22 },
  bubble: { flex: 1, padding: 12, borderRadius: 20, borderBottomLeftRadius: 6, gap: 2 },
  group: { marginTop: 22, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
