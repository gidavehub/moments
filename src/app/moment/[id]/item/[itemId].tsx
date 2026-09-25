import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MomentsMark } from '@/components/brand/moments-mark';
import { ExternalLink, ICON_STROKE, RefreshCw } from '@/components/icons/lucide';
import { ItemIcon } from '@/components/moment/item-icon';
import { OptionTile } from '@/components/moment/option-tile';
import { StoreBadge } from '@/components/moment/store-badge';
import { Button } from '@/components/ui/button';
import { SheetHeader } from '@/components/ui/sheet-header';
import { Text } from '@/components/ui/text';
import { actions, momentById, useWorld } from '@/data/store';
import { stores } from '@/data/stores';
import { haptic } from '@/lib/haptics';
import { money } from '@/lib/money';
import { alpha, GUTTER, useTheme } from '@/theme';

/** The options shortlist (S2S request item + candidate sheet): pick one / pick any, see details, confirm. */
export default function ItemSheet() {
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const w = useWorld();
  const m = momentById(w, id ?? '');
  const item = m?.items.find((i) => i.id === itemId);
  const multiple = item?.selection === 'multiple';
  const [picked, setPicked] = useState<string[]>(item?.chosen ?? []);
  const [focus, setFocus] = useState<string | undefined>(item?.options?.find((o) => o.topPick)?.id ?? item?.options?.[0]?.id);
  const [done, setDone] = useState(false);

  if (!m || !item) return null;
  const options = item.options ?? [];
  const focused = options.find((o) => o.id === focus);
  const total = options.filter((o) => picked.includes(o.id)).reduce((s, o) => s + o.landed, 0);

  const toggle = (oid: string) => {
    setFocus(oid);
    setPicked((p) => (multiple ? (p.includes(oid) ? p.filter((x) => x !== oid) : [...p, oid]) : p[0] === oid ? [] : [oid]));
  };

  const confirm = () => {
    haptic.success();
    actions.pickOptions(m.id, item.id, picked);
    setDone(true);
    setTimeout(() => router.back(), 1100);
  };

  if (done) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: t.color.surface }]}>
        <MomentsMark size={120} state="success" />
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Text variant="title2" align="center" style={{ marginTop: 18 }}>
            Added to your plan
          </Text>
          <Text variant="body" tone="muted" align="center">
            {money(total)} landed · Keisha will lock it in
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: t.color.surface }]}>
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingTop: 22, paddingBottom: 160, gap: 18 }} showsVerticalScrollIndicator={false}>
        <SheetHeader
          eyebrow={m.title}
          title={item.title}
          subtitle={`${options.length} ${options.length === 1 ? 'option' : 'options'} for you — ${multiple ? 'Pick as many as you need' : 'Pick one'}${item.totalResults ? ` · shortlisted from ${item.totalResults}` : ''}`}
          leading={<ItemIcon icon={item.icon} size={46} tone="gold" />}
        />

        <View style={styles.grid}>
          {options.map((o, i) => (
            <Animated.View key={o.id} entering={FadeInDown.delay(80 + i * 60).springify().damping(18)} style={styles.cell}>
              <OptionTile option={o} selected={picked.includes(o.id)} shape={multiple ? 'square' : 'round'} onPress={() => toggle(o.id)} />
            </Animated.View>
          ))}
        </View>

        {focused && (
          <Animated.View key={focused.id} entering={FadeIn.duration(300)} layout={LinearTransition} style={[styles.details, { backgroundColor: t.color.bgSoft, borderColor: t.color.hairline }]}>
            <StoreBadge store={stores[focused.storeId]} size="md" />
            <Text variant="headline">{focused.title}</Text>
            {focused.description ? (
              <Text variant="body" tone="muted">
                {focused.description}
              </Text>
            ) : null}
            {focused.specs?.length ? (
              <View style={styles.specs}>
                {focused.specs.map((s) => (
                  <View key={s.label} style={[styles.spec, { backgroundColor: t.color.surface, borderColor: t.color.hairline }]}>
                    <Text variant="caption" tone="subtle">
                      {s.label}
                    </Text>
                    <Text variant="callout">{s.value}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.between}>
              <View>
                <Text variant="caption" tone="subtle">
                  US${focused.shelfUsd.toFixed(2)} on the shelf
                </Text>
                <Text variant="title3">{money(focused.landed)} landed</Text>
              </View>
              <Button
                label={`View on ${stores[focused.storeId]?.name.split(' ')[0]}`}
                size="sm"
                variant="secondary"
                trailing={<ExternalLink size={14} color={t.color.text} strokeWidth={ICON_STROKE} />}
              />
            </View>
          </Animated.View>
        )}

        <Button
          label="None of these — ask again"
          variant="ghost"
          size="sm"
          leading={<RefreshCw size={15} color={t.color.textMuted} strokeWidth={ICON_STROKE} />}
          onPress={() => {
            actions.askAgain(m.id, item.id);
            router.back();
          }}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: t.color.surface, borderColor: t.color.hairline }]}>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            {picked.length ? `${picked.length} picked` : 'Nothing picked yet'}
          </Text>
          <Text variant="title3" color={picked.length ? t.color.text : alpha(t.color.text, 0.35)}>
            {money(total)}
          </Text>
        </View>
        <Button
          label={multiple ? (picked.length > 1 ? `Add ${picked.length} to the plan` : 'Add to the plan') : 'Choose this'}
          variant="gold"
          size="lg"
          disabled={!picked.length}
          onPress={confirm}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47.8%' },
  details: { borderRadius: 24, padding: 16, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spec: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: GUTTER, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
});
