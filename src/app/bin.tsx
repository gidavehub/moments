import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ICON_STROKE, Trash, Undo2 } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { ItemIcon } from '@/components/moment/item-icon';
import { Button } from '@/components/ui/button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SheetHeader } from '@/components/ui/sheet-header';
import { Text } from '@/components/ui/text';
import { actions, binned, useWorld } from '@/data/store';
import { fmt, parseYmd } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { GUTTER, useTheme } from '@/theme';

/** Binned tasks wait here until you confirm — restore one, or empty the lot. */
export default function Bin() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const w = useWorld();
  const items = binned(w);
  const [confirm, setConfirm] = useState(false);

  return (
    <View style={[styles.fill, { backgroundColor: t.color.surface }]}>
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingTop: 22, paddingBottom: insets.bottom + 120, gap: 16 }}>
        <SheetHeader
          eyebrow="Bin"
          title={items.length ? `${items.length} task${items.length > 1 ? 's' : ''} to delete` : 'The bin is empty'}
          subtitle="Nothing is removed until you confirm."
          leading={
            <View style={[styles.icon, { backgroundColor: t.color.discountSoft }]}>
              <Trash size={20} color={t.color.discount} strokeWidth={ICON_STROKE} />
            </View>
          }
        />
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Character kind="pip" pose="sleep" prop="zzz" size={150} />
            <Text variant="body" tone="muted" align="center">
              Swipe a task down in the tidy-up to bin it.
            </Text>
          </View>
        ) : (
          <Animated.View layout={LinearTransition.springify().damping(20)} style={{ gap: 10 }}>
            {items.map((task) => {
              const m = w.moments.find((x) => x.id === task.momentId);
              const icon = m?.items.find((i) => i.id === task.itemId)?.icon ?? 'gift';
              return (
                <Animated.View key={task.id} exiting={FadeOut.duration(200)} layout={LinearTransition.springify().damping(20)} style={[styles.row, { backgroundColor: t.color.bgSoft, borderColor: t.color.hairline }]}>
                  <ItemIcon icon={icon} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong" style={{ textDecorationLine: 'line-through', opacity: 0.7 }}>
                      {task.title}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {m?.title} · {fmt.monthDay(parseYmd(task.due))}
                    </Text>
                  </View>
                  <PressableScale
                    haptics="select"
                    onPress={() => actions.restoreTask(task.id)}
                    accessibilityLabel={`Restore ${task.title}`}
                    style={[styles.restore, { backgroundColor: t.color.surface, borderColor: t.color.border }]}>
                    <Undo2 size={16} color={t.color.text} strokeWidth={ICON_STROKE} />
                    <Text variant="caption">Restore</Text>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>
      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: t.color.surface, borderColor: t.color.hairline }]}>
          {confirm ? (
            <View style={styles.confirm}>
              <Button label="Keep them" variant="secondary" size="lg" onPress={() => setConfirm(false)} />
              <Button
                label={`Delete ${items.length}`}
                variant="danger"
                size="lg"
                style={{ flex: 1 }}
                onPress={() => {
                  haptic.heavy();
                  actions.emptyBin();
                  setConfirm(false);
                  setTimeout(() => router.back(), 300);
                }}
              />
            </View>
          ) : (
            <Button label="Empty bin" variant="danger" size="lg" block leading={<Trash size={17} color={t.color.discount} strokeWidth={ICON_STROKE} />} onPress={() => setConfirm(true)} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  icon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  restore: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 34, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  confirm: { flexDirection: 'row', gap: 10 },
});
