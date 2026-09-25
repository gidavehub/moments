import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ChevronRight, ICON_STROKE } from '@/components/icons/lucide';
import { ItemIcon } from '@/components/moment/item-icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StateChip } from '@/components/ui/state-chip';
import { Text } from '@/components/ui/text';
import { optionImage } from '@/data/art';
import { stateLabel } from '@/data/store';
import type { Moment, PlanItem } from '@/data/types';
import { money } from '@/lib/money';
import { cssEase, enter, kf, stagger, useTheme } from '@/theme';

/** A "Your move" row — gold-ringed (S2S polished request list), the next step as the main line. */
export function NeedsYouRow({ moment, item, index = 0 }: { moment: Moment; item: PlanItem; index?: number }) {
  const t = useTheme();
  const quote = item.state === 'quote-ready';
  const count = item.options?.length ?? 0;
  const line = quote ? money(item.quote?.total ?? 0) : `${count} option${count === 1 ? '' : 's'}`;
  const thumbs = (item.options ?? []).slice(0, 2);

  return (
    <Animated.View style={enter(kf.riseIn, 60 + stagger(index, 55), 520, cssEase.expo)}>
      <PressableScale
        haptics="tap"
        to={0.98}
        onPress={() =>
          router.push(
            quote
              ? { pathname: '/moment/[id]/quote', params: { id: moment.id, itemId: item.id } }
              : { pathname: '/moment/[id]/item/[itemId]', params: { id: moment.id, itemId: item.id } },
          )
        }
        style={[styles.row, { backgroundColor: t.color.surface, borderColor: t.color.gold, boxShadow: `${t.shadow.ring}, ${t.shadow.plate}` }]}>
        <ItemIcon icon={item.icon} size={46} tone="gold" />
        <View style={styles.body}>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {moment.title}
          </Text>
          <Text variant="headline" numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.meta}>
            <StateChip label={stateLabel[item.state]} tone="gold" size="sm" />
            <Text variant="footnote" tone="muted" numberOfLines={1} style={{ flexShrink: 1 }}>
              {line}
            </Text>
          </View>
        </View>
        {thumbs.length > 0 && !quote ? (
          <View style={styles.thumbs}>
            {thumbs.map((o, i) => {
              const src = optionImage(o.image);
              return (
                <View key={o.id} style={[styles.thumb, { marginLeft: i ? -14 : 0, borderColor: t.color.surface, backgroundColor: t.color.bgSunk, zIndex: 5 - i }]}>
                  {src ? <Image accessibilityLabel="" accessible={false} source={src} style={StyleSheet.absoluteFill} contentFit="cover" /> : <ItemIcon icon={item.icon} size={30} />}
                </View>
              );
            })}
          </View>
        ) : (
          <ChevronRight size={20} color={t.color.textSubtle} strokeWidth={ICON_STROKE} />
        )}
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 24, borderWidth: 1.5, borderCurve: 'continuous' },
  body: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  thumbs: { flexDirection: 'row' },
  thumb: { width: 36, height: 36, borderRadius: 12, borderWidth: 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
