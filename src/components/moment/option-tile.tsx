import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Star } from '@/components/icons/lucide';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { optionImage } from '@/data/art';
import { stores } from '@/data/stores';
import type { Option } from '@/data/types';
import { money } from '@/lib/money';
import { alpha, spring, useTheme } from '@/theme';

import { ItemIcon } from './item-icon';
import { StoreBadge } from './store-badge';

function Tick({ on, shape }: { on: boolean; shape: 'round' | 'square' }) {
  const t = useTheme();
  const s = useSharedValue(on ? 1 : 0);
  useEffect(() => {
    s.set(withSpring(on ? 1 : 0, spring.bouncy));
  }, [on, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: 0.6 + s.get() * 0.4 }], opacity: 0.35 + s.get() * 0.65 }));
  const r = shape === 'round' ? 12 : 7;
  return (
    <Animated.View
      style={[
        styles.tick,
        { borderRadius: r, backgroundColor: on ? t.color.gold : 'rgba(255,255,255,0.85)', borderColor: on ? t.color.gold : alpha('#000', 0.15) },
        style,
      ]}>
      {on && (
        <Svg width={14} height={14} viewBox="0 0 24 24">
          <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={t.color.onGold} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      )}
    </Animated.View>
  );
}

/** A shortlisted option: product shot, store, landed price, a "Top pick" glass badge, a tick. */
export function OptionTile({
  option,
  selected,
  shape = 'round',
  onPress,
  onLongPress,
  compact,
  style,
}: {
  option: Option;
  selected?: boolean;
  shape?: 'round' | 'square';
  onPress?: () => void;
  onLongPress?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const src = optionImage(option.image);
  const store = stores[option.storeId];
  return (
    <PressableScale
      haptics="select"
      to={0.97}
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityState={{ selected }}
      accessibilityLabel={`${option.title}, ${money(option.landed)} landed`}
      style={[
        styles.tile,
        { backgroundColor: t.color.surface, borderColor: selected ? t.color.gold : t.color.hairline, boxShadow: selected ? `${t.shadow.ring}, ${t.shadow.plate}` : t.shadow.plate },
        style,
      ]}>
      <View style={[styles.img, { height: compact ? 96 : 128, backgroundColor: t.color.bgSoft }]}>
        {src ? <Image accessibilityLabel="" accessible={false} source={src} style={StyleSheet.absoluteFill} contentFit="contain" transition={250} /> : <ItemIcon icon="gift" size={48} />}
        {option.topPick && (
          <View style={[styles.badge, { backgroundColor: 'rgba(8,31,55,0.78)' }]}>
            <Star size={10} color={t.color.gold} fill={t.color.gold} />
            <Text variant="caption" color="#FFFFFF" style={{ fontSize: 10 }}>
              Top pick
            </Text>
          </View>
        )}
        {onPress && (
          <View style={styles.tickWrap}>
            <Tick on={!!selected} shape={shape} />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <StoreBadge store={store} />
        <Text variant="footnote" numberOfLines={2} style={{ minHeight: 34 }}>
          {option.title}
        </Text>
        <View style={styles.priceRow}>
          <Text variant="headline">{money(option.landed)}</Text>
          {option.rating ? (
            <View style={styles.rating}>
              <Star size={11} color={t.color.goldText} fill={t.color.gold} />
              <Text variant="caption" tone="muted">
                {option.rating}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {option.eta}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: 20, borderWidth: 1.5, overflow: 'hidden', borderCurve: 'continuous' },
  img: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  badge: { position: 'absolute', left: 8, top: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, height: 20, borderRadius: 10 },
  tickWrap: { position: 'absolute', right: 8, top: 8 },
  tick: { width: 24, height: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 10, gap: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
