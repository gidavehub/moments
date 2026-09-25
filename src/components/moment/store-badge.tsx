import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Store as StoreIcon, Users } from '@/components/icons/lucide';
import { Text } from '@/components/ui/text';
import type { Store } from '@/data/types';
import { useTheme } from '@/theme';

const logos: Record<string, number> = {
  amazon: require('@/assets/logos/amazon.png'),
  walmart: require('@/assets/logos/walmart.png'),
  ebay: require('@/assets/logos/ebay.png'),
  shein: require('@/assets/logos/shein.png'),
  temu: require('@/assets/logos/temu.png'),
  aliexpress: require('@/assets/logos/aliexpress.png'),
  target: require('@/assets/logos/target.png'),
  bestbuy: require('@/assets/logos/bestbuy.png'),
};

/** Store name with its logo; sourced (walked-in) stores get a person glyph. */
export function StoreBadge({ store, size = 'sm' }: { store?: Store; size?: 'sm' | 'md' }) {
  const t = useTheme();
  if (!store) return null;
  const d = size === 'sm' ? 16 : 20;
  const logo = store.logo ? logos[store.logo] : undefined;
  return (
    <View style={styles.row}>
      <View style={[styles.logo, { width: d, height: d, borderRadius: d / 3, backgroundColor: logo ? '#FFFFFF' : t.color.state.gold.bg }]}>
        {logo ? (
          <Image accessibilityLabel="" accessible={false} source={logo} style={{ width: d - 3, height: d - 3 }} contentFit="contain" />
        ) : store.coverage === 'sourced' ? (
          <Users size={d * 0.62} color={t.color.state.gold.fg} strokeWidth={2.4} />
        ) : (
          <StoreIcon size={d * 0.62} color={t.color.state.gold.fg} strokeWidth={2.4} />
        )}
      </View>
      <Text variant="caption" tone="muted" numberOfLines={1} style={{ flexShrink: 1 }}>
        {store.name}
        {store.coverage === 'sourced' ? ' · walk-in' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
