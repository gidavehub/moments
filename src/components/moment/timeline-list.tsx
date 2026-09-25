import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { today } from '@/data/clock';
import { actions } from '@/data/store';
import type { TimelineTask } from '@/data/types';
import { fmt, parseYmd, relativeDay, ymd } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { alpha, kf, loop, useTheme } from '@/theme';

/** The countdown plan: tasks worked back from the day, a breathing gold "today" marker between past and future. */
export function TimelineList({ tasks }: { tasks: TimelineTask[] }) {
  const t = useTheme();
  const now = ymd(today());
  const sorted = [...tasks].filter((x) => !x.binned).sort((a, b) => a.due.localeCompare(b.due));
  const todayIdx = sorted.findIndex((x) => x.due >= now);

  return (
    <View>
      {sorted.map((task, i) => {
        const past = task.due < now;
        const isToday = task.due === now;
        const showMarker = i === todayIdx;
        const last = i === sorted.length - 1;
        return (
          <View key={task.id}>
            {showMarker && (
              <View style={styles.marker}>
                <Animated.View style={[styles.markerDot, { backgroundColor: t.color.gold, boxShadow: t.shadow.ring }, loop(kf.pulseDot, 2400)]} />
                <Text variant="overline" tone="gold">
                  Today · {fmt.monthDay(today())}
                </Text>
                <View style={[styles.markerLine, { backgroundColor: alpha(t.color.gold, 0.4) }]} />
              </View>
            )}
            <View style={styles.row}>
              <View style={styles.rail}>
                <PressableScale
                  haptics="none"
                  to={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.done }}
                  accessibilityLabel={task.title}
                  onPress={() => {
                    if (!task.done) haptic.success();
                    else haptic.select();
                    actions.toggleTask(task.id);
                  }}
                  style={[
                    styles.check,
                    task.done
                      ? { backgroundColor: t.color.success, borderColor: t.color.success }
                      : { backgroundColor: t.color.surface, borderColor: isToday ? t.color.gold : alpha(t.color.text, past ? 0.3 : 0.18) },
                  ]}>
                  {task.done && (
                    <Svg width={12} height={12} viewBox="0 0 24 24">
                      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FFFFFF" strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </PressableScale>
                {!last && <View style={[styles.line, { backgroundColor: alpha(t.color.text, 0.1) }]} />}
              </View>
              <View style={styles.body}>
                <Text variant="caption" tone={isToday ? 'gold' : past && !task.done ? 'discount' : 'subtle'}>
                  {fmt.short(parseYmd(task.due))} · {relativeDay(today(), parseYmd(task.due))}
                  {task.time && !isToday ? ` · ${task.time}` : ''}
                </Text>
                <Text variant="bodyStrong" style={task.done ? { textDecorationLine: 'line-through', opacity: 0.55 } : null}>
                  {task.title}
                </Text>
                {task.place ? (
                  <Text variant="footnote" tone="muted">
                    {task.place}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 26 },
  check: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  line: { width: 2, flex: 1, marginVertical: 4, borderRadius: 1 },
  body: { flex: 1, paddingBottom: 18, gap: 2 },
  marker: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, marginLeft: 6 },
  markerDot: { width: 12, height: 12, borderRadius: 6 },
  markerLine: { flex: 1, height: 1.5, borderRadius: 1 },
});
