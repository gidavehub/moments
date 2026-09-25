import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { WalkInCard } from '@/components/home/walk-in-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import type { AgentStep } from '@/data/types';
import { alpha, cssEase, enter, kf, loop, useTheme } from '@/theme';

export type StepStatus = 'pending' | 'active' | 'done';

function StatusRing({ status }: { status: StepStatus }) {
  const t = useTheme();
  if (status === 'done') {
    return (
      <Animated.View style={[styles.ring, { backgroundColor: t.color.success }, enter(kf.popIn, 0, 420, cssEase.spring)]}>
        <Svg width={13} height={13} viewBox="0 0 24 24">
          <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FFFFFF" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Animated.View>
    );
  }
  return (
    <View style={styles.ring}>
      <View style={[StyleSheet.absoluteFill, styles.track, { borderColor: alpha(t.color.gold, 0.25) }]} />
      <Animated.View style={[StyleSheet.absoluteFill, styles.spin, { borderTopColor: t.color.gold }, loop(kf.spin, 1100, 0, cssEase.linear)]} />
    </View>
  );
}

const CHIP_W = [64, 86, 72, 96, 58];

/**
 * The S2S RunTimeline: steps appear as they start; the active one spins a gold ring over
 * shimmering skeleton chips, then resolves into glass result chips that rise in with a stagger.
 */
export function RunTimeline({ steps, status }: { steps: AgentStep[]; status: StepStatus[] }) {
  const t = useTheme();
  return (
    <Animated.View layout={LinearTransition.springify().damping(20)} style={{ gap: 16 }}>
      {steps.map((s, i) =>
        status[i] === 'pending' ? null : (
          <Animated.View key={s.id} entering={FadeIn.duration(360)} layout={LinearTransition.springify().damping(20)} style={styles.row}>
            <View style={styles.rail}>
              <StatusRing status={status[i]} />
              {i < steps.length - 1 && status[i + 1] !== 'pending' && <View style={[styles.line, { backgroundColor: alpha(t.color.text, 0.1) }]} />}
            </View>
            <View style={{ flex: 1, gap: 8, paddingBottom: 4 }}>
              <Text variant="bodyStrong" tone={status[i] === 'done' ? 'muted' : 'default'}>
                {status[i] === 'done' ? s.done : `${s.label}…`}
              </Text>
              <View style={styles.chips}>
                {status[i] === 'active'
                  ? s.chips.map((c, k) => <Skeleton key={c} width={CHIP_W[k % CHIP_W.length]} height={26} radius={13} delay={k * 120} />)
                  : s.chips.map((c, k) => (
                      <Animated.View
                        key={c}
                        style={[
                          styles.chip,
                          { backgroundColor: t.color.glassFill, borderColor: t.color.glassStroke, boxShadow: t.shadow.plate },
                          enter(kf.riseIn, k * 60, 460, cssEase.expo),
                        ]}>
                        <Text variant="caption">{c}</Text>
                      </Animated.View>
                    ))}
              </View>
              {s.sourced && (
                <Animated.View style={enter(kf.riseIn, 200, 520)}>
                  <WalkInCard personId={s.sourced.personId} storeId={s.sourced.storeId} note={s.sourced.note} progress={status[i] === 'done' ? 1 : 0.35} />
                </Animated.View>
              )}
            </View>
          </Animated.View>
        ),
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 26 },
  ring: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  track: { borderRadius: 12, borderWidth: 2.5 },
  spin: { borderRadius: 12, borderWidth: 2.5, borderColor: 'transparent' },
  line: { width: 2, flex: 1, marginTop: 6, borderRadius: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { height: 26, borderRadius: 13, paddingHorizontal: 10, justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
});
