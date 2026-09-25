import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MomentsMark } from '@/components/brand/moments-mark';
import { DotGrid } from '@/components/brand/textures';
import { SurfaceMark } from '@/components/system-bars/surface-mark';
import { ArrowRight, ICON_STROKE } from '@/components/icons/lucide';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressDots, type DotState } from '@/components/ui/progress-dots';
import { Text } from '@/components/ui/text';
import { alpha, gradient, ink, useTheme } from '@/theme';

/** Entry to the monthly tidy-up deck: ink card, check-circle progress, the mark in a glass tile. */
export function TidyBanner({ month, count, dots }: { month: string; count: number; dots: DotState[] }) {
  const t = useTheme();
  return (
    <PressableScale
      haptics="tap"
      to={0.98}
      onPress={() => router.push('/review')}
      accessibilityLabel={`Tidy up ${month}, ${count} loose ends`}
      style={[styles.card, { backgroundColor: ink[900], boxShadow: t.shadow.float }, gradient(t.gradient.inkSheen)]}>
        <SurfaceMark />
      <DotGrid color={alpha(ink[200], 0.14)} fade="bottom" />
      <View style={styles.row}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="overline" color={t.color.gold}>
            Monthly tidy-up
          </Text>
          <Text variant="title3" color={ink[50]}>
            Tidy up {month}
          </Text>
          <Text variant="footnote" color={ink[300]}>
            {count} loose ends to swipe through
          </Text>
        </View>
        <View style={[styles.tile, { backgroundColor: alpha('#FFFFFF', 0.08) }]}>
          <MomentsMark size={56} state="idle" variant="light" />
        </View>
      </View>
      <View style={styles.foot}>
        <ProgressDots items={dots} onColor={ink[50]} size={20} />
        <View style={[styles.go, { backgroundColor: t.color.gold }]}>
          <ArrowRight size={18} color={ink[950]} strokeWidth={ICON_STROKE} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 18, gap: 16, overflow: 'hidden', borderCurve: 'continuous' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: { width: 76, height: 76, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  foot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  go: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
