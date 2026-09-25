import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DotGrid } from '@/components/brand/textures';
import { ArrowRight, ICON_STROKE } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { enter, GUTTER, kf, useTheme } from '@/theme';

/** A link that goes nowhere: Dot is asleep on the job, and home is one tap away. */
export default function NotFound() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg, paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <DotGrid />
      <View style={styles.center}>
        <Character kind="dot" pose="sleep" prop="zzz" size={170} />
        <Animated.View style={[styles.copy, enter(kf.riseIn, 120)]}>
          <Text variant="title1" align="center">
            Nothing planned here
          </Text>
          <Text variant="body" tone="muted" align="center">
            This page took the day off. Everything you’re planning is right where you left it.
          </Text>
        </Animated.View>
      </View>
      <View style={styles.gutter}>
        <Button
          label="Take me home"
          variant="gold"
          size="lg"
          block
          trailing={<ArrowRight size={18} color={t.color.onGold} strokeWidth={ICON_STROKE} />}
          onPress={() => router.replace('/home')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: GUTTER + 8 },
  copy: { gap: 8, alignItems: 'center' },
  gutter: { paddingHorizontal: GUTTER },
});
