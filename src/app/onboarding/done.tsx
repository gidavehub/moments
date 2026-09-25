import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MomentsMark } from '@/components/brand/moments-mark';
import { Aurora, DotGrid } from '@/components/brand/textures';
import { Character } from '@/components/mascot/character';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { WordReveal } from '@/components/ui/word-reveal';
import { setPrefs, usePrefs } from '@/data/prefs';
import { haptic } from '@/lib/haptics';
import { cssEase, enter, GUTTER, kf, useTheme } from '@/theme';

/** The whole cast celebrates — confetti, the mark bursting, and home. */
export default function Done() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const name = usePrefs((p) => p.name);
  useEffect(() => {
    const id = setTimeout(() => haptic.success(), 400);
    return () => clearTimeout(id);
  }, []);

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 16 }]}>
      <Aurora intensity={1.2} />
      <DotGrid />
      <View style={styles.center}>
        <MomentsMark size={120} state="success" />
        <View style={styles.cast}>
          {(['bloop', 'tiers', 'mo', 'pip', 'dot'] as const).map((k, i) => (
            <Animated.View key={k} style={[{ marginHorizontal: -10, zIndex: k === 'mo' ? 5 : 1 }, enter(kf.popIn, 300 + i * 110, 520, cssEase.spring)]}>
              <Character kind={k} pose="celebrate" prop={k === 'mo' ? 'confetti' : 'none'} size={k === 'mo' ? 118 : 84} />
            </Animated.View>
          ))}
        </View>
        <WordReveal lines={[`You’re all set, ${name || 'friend'}.`]} variant="title1" align="center" delay={700} />
        <Animated.View style={enter(kf.riseIn, 1000)}>
          <Text variant="body" tone="muted" align="center" style={{ marginTop: 10, paddingHorizontal: 12 }}>
            We’re already on Mom’s birthday and your 30th. Keisha from your S2S team says hi.
          </Text>
        </Animated.View>
      </View>
      <Animated.View style={[styles.gutter, enter(kf.riseIn, 1200)]}>
        <Button
          label="Take me home"
          variant="gold"
          size="lg"
          block
          onPress={() => {
            setPrefs({ onboarded: true });
            router.replace('/home');
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: GUTTER, gap: 14 },
  cast: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 12 },
  gutter: { paddingHorizontal: GUTTER },
});
