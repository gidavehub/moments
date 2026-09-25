import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MomentsMark } from '@/components/brand/moments-mark';
import { Clock, ICON_STROKE, Plane, Ship } from '@/components/icons/lucide';
import { ItemIcon } from '@/components/moment/item-icon';
import { StoreBadge } from '@/components/moment/store-badge';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { SheetHeader } from '@/components/ui/sheet-header';
import { Text } from '@/components/ui/text';
import { actions, momentById, useWorld } from '@/data/store';
import { stores } from '@/data/stores';
import { useCountUp } from '@/hooks/use-count-up';
import { fmt, parseYmd } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { money } from '@/lib/money';
import { GUTTER, useTheme } from '@/theme';

/** A landed quote: "All in, to Kingston" — the S2S quote breakdown with an air/sea switch. */
export default function QuoteSheet() {
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const w = useWorld();
  const m = momentById(w, id ?? '');
  const item = m?.items.find((i) => i.id === itemId);
  const [mode, setMode] = useState<'air' | 'sea'>('air');
  const [done, setDone] = useState(false);
  const q = item?.quote;
  const target = q ? (mode === 'sea' && q.sea ? q.sea.total : q.total) : 0;
  const shown = useCountUp(target, 900);

  if (!m || !item || !q) return null;

  const accept = () => {
    haptic.success();
    actions.approveQuote(m.id, item.id);
    setDone(true);
    setTimeout(() => router.back(), 1200);
  };

  if (done) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: t.color.surface }]}>
        <MomentsMark size={120} state="success" />
        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <Text variant="title2" align="center" style={{ marginTop: 18 }}>
            Quote accepted
          </Text>
          <Text variant="body" tone="muted" align="center">
            It’s in your order. The order owns delivery updates now.
          </Text>
        </Animated.View>
      </View>
    );
  }

  const rows: [string, number][] = [
    ['Items', q.sourceSubtotal],
    ['Shipping and handling', mode === 'sea' && q.sea ? Math.round(q.shipping * 0.45) : q.shipping],
    ['Duties and taxes', q.importCosts],
    ['S2S service', q.serviceFee],
  ];

  return (
    <View style={[styles.fill, { backgroundColor: t.color.surface }]}>
      <ScrollView contentContainerStyle={{ padding: GUTTER, paddingTop: 22, paddingBottom: 150, gap: 18 }} showsVerticalScrollIndicator={false}>
        <SheetHeader eyebrow={m.title} title={item.title} leading={<ItemIcon icon={item.icon} size={46} tone="gold" />} />

        <View style={[styles.total, { backgroundColor: t.color.state.gold.bg }]}>
          <Text variant="overline" color={t.color.state.gold.fg}>
            All in, to {m.city}
          </Text>
          <Text variant="display" color={t.color.state.gold.fg} style={{ fontVariant: ['tabular-nums'] }}>
            {money(shown)}
          </Text>
          <View style={styles.row}>
            <Clock size={14} color={t.color.state.gold.fg} strokeWidth={ICON_STROKE} />
            <Text variant="footnote" color={t.color.state.gold.fg}>
              Held until {fmt.long(parseYmd(q.holdsUntil))}
            </Text>
          </View>
        </View>

        {q.sea && (
          <Segmented
            options={[
              { value: 'air', label: `Air · ${q.airEta}` },
              { value: 'sea', label: `Sea · ${q.sea.eta}` },
            ]}
            value={mode}
            onChange={setMode}
          />
        )}

        <View style={{ gap: 12 }}>
          {q.lines.map((l) => (
            <View key={l.title} style={[styles.line, { borderColor: t.color.hairline }]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="bodyStrong">{l.title}</Text>
                <StoreBadge store={stores[l.storeId]} />
              </View>
              <Text variant="callout" tone="muted">
                × {l.qty}
              </Text>
              <Text variant="callout">{money(l.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.breakdown, { backgroundColor: t.color.bgSoft }]}>
          {rows.map(([label, v]) => (
            <View key={label} style={styles.between}>
              <Text variant="callout" tone="muted">
                {label}
              </Text>
              <Text variant="callout">{v ? money(v) : 'Included'}</Text>
            </View>
          ))}
          <View style={[styles.rule, { backgroundColor: t.color.hairline }]} />
          <View style={styles.between}>
            <Text variant="headline">Landed total</Text>
            <Text variant="headline">{money(target)}</Text>
          </View>
        </View>

        <View style={styles.row}>
          {mode === 'air' ? <Plane size={15} color={t.color.textMuted} strokeWidth={ICON_STROKE} /> : <Ship size={15} color={t.color.textMuted} strokeWidth={ICON_STROKE} />}
          <Text variant="footnote" tone="muted" style={{ flex: 1 }}>
            {mode === 'air' ? q.airEta : q.sea?.eta} · Duty and GCT worked out by your S2S team, card fees included.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: t.color.surface, borderColor: t.color.hairline }]}>
        <Button label="Ask a question" variant="secondary" size="lg" onPress={() => router.back()} />
        <Button label="Accept quote" variant="gold" size="lg" style={{ flex: 1 }} onPress={accept} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  total: { borderRadius: 26, padding: 18, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  breakdown: { borderRadius: 22, padding: 16, gap: 12 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rule: { height: StyleSheet.hairlineWidth },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: GUTTER, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
});
