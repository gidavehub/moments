import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ArrowUpRight, Check, Clock, ICON_STROKE, MapPin } from '@/components/icons/lucide';
import { ItemIcon } from '@/components/moment/item-icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { actions } from '@/data/store';
import type { Moment, TimelineTask } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { alpha, cssEase, enter, gradient, kf, stagger, useTheme } from '@/theme';

/**
 * Agenda row (events app "Upcoming Event" cards): thumbnail, title, time and place, an ↗ button.
 * `highlight` paints the next thing in gold.
 */
export function AgendaCard({ task, moment, highlight, index = 0 }: { task: TimelineTask; moment?: Moment; highlight?: boolean; index?: number }) {
  const t = useTheme();
  const item = moment?.items.find((i) => i.id === task.itemId);
  const fg = highlight ? t.color.onGold : t.color.text;
  const sub = highlight ? alpha(t.color.onGold, 0.72) : t.color.textMuted;

  return (
    <Animated.View style={enter(kf.riseIn, 80 + stagger(index, 60), 520, cssEase.expo)}>
      <PressableScale
        haptics="tap"
        to={0.98}
        onPress={() => moment && router.push({ pathname: '/moment/[id]', params: { id: moment.id } })}
        style={[
          styles.card,
          highlight
            ? [{ backgroundColor: t.color.gold, boxShadow: t.shadow.glow }, gradient(t.gradient.flareSheen)]
            : { backgroundColor: t.color.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: t.color.hairline, boxShadow: t.shadow.plate },
        ]}>
        <PressableScale
          haptics="none"
          to={0.85}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done }}
          accessibilityLabel={`Mark ${task.title} done`}
          onPress={() => {
            haptic.success();
            actions.toggleTask(task.id);
          }}>
          {task.done ? (
            <View style={[styles.done, { backgroundColor: highlight ? t.color.navy : t.color.success }]}>
              <Check size={22} color="#FFFFFF" strokeWidth={3} />
            </View>
          ) : (
            <ItemIcon icon={item?.icon ?? 'gift'} size={50} tone={highlight ? 'neutral' : 'neutral'} style={highlight ? { backgroundColor: 'rgba(255,255,255,0.45)' } : undefined} />
          )}
        </PressableScale>
        <View style={styles.body}>
          <Text variant="headline" color={fg} numberOfLines={1} style={task.done ? styles.struck : null}>
            {task.title}
          </Text>
          <View style={styles.meta}>
            <Clock size={13} color={sub} strokeWidth={ICON_STROKE} />
            <Text variant="footnote" color={sub}>
              {task.time ?? 'Any time'}
            </Text>
            <Text variant="footnote" color={sub}>
              ·
            </Text>
            {task.place ? <MapPin size={13} color={sub} strokeWidth={ICON_STROKE} /> : null}
            <Text variant="footnote" color={sub} numberOfLines={1} style={{ flexShrink: 1 }}>
              {task.place ?? moment?.title}
            </Text>
          </View>
        </View>
        <View style={[styles.go, { backgroundColor: highlight ? 'rgba(255,255,255,0.5)' : alpha(t.color.text, 0.06) }]}>
          <ArrowUpRight size={18} color={fg} strokeWidth={ICON_STROKE} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 24, borderCurve: 'continuous' },
  done: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  go: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  struck: { textDecorationLine: 'line-through', opacity: 0.6 },
});
