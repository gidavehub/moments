import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { S2SMark } from '@/components/brand/s2s-mark';
import { ArrowRight, Check, ICON_STROKE, MessageCircle, Package } from '@/components/icons/lucide';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StateChip } from '@/components/ui/state-chip';
import { Text } from '@/components/ui/text';
import { optionImage } from '@/data/art';
import { photoOf } from '@/data/people';
import { isWorking, needsYou, stateLabel, stateTone } from '@/data/store';
import { stores } from '@/data/stores';
import type { Moment, PlanItem } from '@/data/types';
import { fmt, parseYmd } from '@/lib/dates';
import { money } from '@/lib/money';
import { alpha, cssEase, enter, kf, stagger, useTheme } from '@/theme';

import { ItemIcon } from './item-icon';
import { OptionTile } from './option-tile';

/**
 * One thing the moment needs — the S2S request "want" card:
 * header (icon, title, chips, state) → the body for its state (working strip / shortlist /
 * quote / chosen / in your order) → the next action.
 */
export function PlanItemCard({ moment, item, index = 0, onAsk }: { moment: Moment; item: PlanItem; index?: number; onAsk?: (item: PlanItem) => void }) {
  const t = useTheme();
  const tone = stateTone(item.state);
  const gold = needsYou(item);
  const openItem = () => router.push({ pathname: '/moment/[id]/item/[itemId]', params: { id: moment.id, itemId: item.id } });
  const openQuote = () => router.push({ pathname: '/moment/[id]/quote', params: { id: moment.id, itemId: item.id } });
  const chosen = item.options?.filter((o) => item.chosen?.includes(o.id)) ?? [];

  return (
    <Animated.View layout={LinearTransition.springify().damping(20)} style={enter(kf.riseIn, 80 + stagger(index, 50), 520, cssEase.expo)}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: t.color.surface,
            borderColor: gold ? alpha(t.color.gold, 0.7) : t.color.hairline,
            boxShadow: gold ? `${t.shadow.ring}, ${t.shadow.lift}` : t.shadow.plate,
          },
        ]}>
        {/* Header */}
        <PressableScale haptics="tap" to={0.99} onPress={item.quote && item.state === 'quote-ready' ? openQuote : openItem} style={styles.head}>
          <ItemIcon icon={item.icon} size={46} tone={tone === 'gold' ? 'gold' : tone === 'green' ? 'green' : 'neutral'} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text variant="headline">{item.title}</Text>
            <View style={styles.chips}>
              <StateChip label={stateLabel[item.state]} tone={tone} live={isWorking(item)} size="sm" />
              {item.chips.slice(0, 2).map((c) => (
                <View key={c} style={[styles.meta, { backgroundColor: alpha(t.color.text, 0.045) }]}>
                  <Text variant="caption" tone="muted" style={{ fontSize: 11 }}>
                    {c}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </PressableScale>

        {/* Working strip */}
        {isWorking(item) && (
          <View style={[styles.working, { backgroundColor: alpha(t.color.text, 0.035) }]}>
            <S2SMark size={30} state={item.state === 'researching' ? 'searching' : 'thinking'} />
            <Text variant="footnote" tone="muted" style={{ flex: 1 }}>
              {item.workingNote ?? (item.state === 'researching' ? 'S2S is searching the catalogue and live stores.' : 'Your S2S team is reviewing this.')}
            </Text>
            {item.sourcedBy && <Avatar crop={photoOf(item.sourcedBy.personId)} size={28} name="Keisha" />}
          </View>
        )}

        {/* Shortlist */}
        {item.state === 'options-ready' && item.options && (
          <View style={{ gap: 10 }}>
            <View style={styles.between}>
              <Text variant="callout">
                {item.options.length} {item.options.length === 1 ? 'option' : 'options'} for you
                <Text variant="footnote" tone="muted">
                  {`  ·  ${item.selection === 'multiple' ? 'Pick as many as you need' : 'Pick one'}`}
                </Text>
              </Text>
            </View>
            <View style={styles.grid}>
              {item.options.slice(0, 2).map((o) => (
                <OptionTile key={o.id} option={o} compact style={styles.half} onPress={openItem} shape={item.selection === 'multiple' ? 'square' : 'round'} />
              ))}
            </View>
            {item.totalResults ? (
              <Text variant="caption" tone="subtle">
                Shortlisted from {item.totalResults} · {item.options.length > 2 ? `${item.options.length - 2} more inside` : 'all shown'}
              </Text>
            ) : null}
          </View>
        )}

        {/* Quote */}
        {item.state === 'quote-ready' && item.quote && (
          <PressableScale haptics="tap" to={0.99} onPress={openQuote} style={[styles.quote, { backgroundColor: t.color.state.gold.bg }]}>
            <View style={{ flex: 1 }}>
              <Text variant="overline" color={t.color.state.gold.fg}>
                All in, landed
              </Text>
              <Text variant="title2" color={t.color.state.gold.fg}>
                {money(item.quote.total)}
              </Text>
              <Text variant="caption" color={alpha(t.color.state.gold.fg, 0.8)}>
                Held until {fmt.monthDay(parseYmd(item.quote.holdsUntil))} · {item.quote.lines.length} line{item.quote.lines.length > 1 ? 's' : ''}
              </Text>
            </View>
            <ArrowRight size={20} color={t.color.state.gold.fg} strokeWidth={ICON_STROKE} />
          </PressableScale>
        )}

        {/* Chosen */}
        {item.state === 'selected' && chosen.length > 0 && (
          <View style={[styles.chosen, { backgroundColor: t.color.successSoft }]}>
            <View style={styles.thumbs}>
              {chosen.slice(0, 3).map((o, i) => {
                const src = optionImage(o.image);
                return (
                  <View key={o.id} style={[styles.thumb, { marginLeft: i ? -12 : 0, borderColor: t.color.surface, backgroundColor: t.color.bgSoft }]}>
                    {src ? <Image accessibilityLabel="" accessible={false} source={src} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Check size={16} color={t.color.success} />}
                  </View>
                );
              })}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="callout" color={t.color.state.green.fg}>
                {chosen.length > 1 ? `${chosen.length} picked` : 'You picked this'}
              </Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>
                {chosen.map((o) => o.title).join(' · ')}
              </Text>
            </View>
            <Text variant="callout" color={t.color.state.green.fg}>
              {money(chosen.reduce((s, o) => s + o.landed, 0))}
            </Text>
          </View>
        )}

        {/* In your order */}
        {item.state === 'order-linked' && (
          <View style={[styles.chosen, { backgroundColor: t.color.successSoft }]}>
            <View style={[styles.orderIcon, { backgroundColor: t.color.success }]}>
              <Package size={16} color="#FFFFFF" strokeWidth={ICON_STROKE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="callout" color={t.color.state.green.fg}>
                {item.linkedOrder ?? 'In your order'}
              </Text>
              <Text variant="caption" tone="muted">
                The order now owns delivery updates.
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {item.state === 'options-ready' && (
            <Button label={item.selection === 'multiple' ? 'Pick what you need' : 'Pick an option'} size="sm" variant="gold" onPress={openItem} />
          )}
          {item.state === 'quote-ready' && <Button label="Review quote" size="sm" variant="gold" onPress={openQuote} />}
          {item.sourcedBy && stores[item.sourcedBy.storeId]?.coverage === 'sourced' && isWorking(item) && (
            <Chip label={`${stores[item.sourcedBy.storeId]?.name} · walk-in`} size="sm" tone="outline" />
          )}
          <PressableScale haptics="select" onPress={() => onAsk?.(item)} style={styles.ask} accessibilityLabel={`Ask about ${item.title}`} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
            <MessageCircle size={15} color={t.color.textMuted} strokeWidth={ICON_STROKE} />
            <Text variant="caption" tone="muted">
              Ask about this
            </Text>
          </PressableScale>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, borderWidth: 1.5, padding: 14, gap: 14, borderCurve: 'continuous' },
  head: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  meta: { height: 22, borderRadius: 11, paddingHorizontal: 8, justifyContent: 'center' },
  working: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  quote: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18 },
  chosen: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16 },
  thumbs: { flexDirection: 'row' },
  thumb: { width: 34, height: 34, borderRadius: 11, borderWidth: 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  orderIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  ask: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto', paddingVertical: 6 },
});
