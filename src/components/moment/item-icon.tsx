import { View, type StyleProp, type ViewStyle } from 'react-native';

import {
  Cake,
  Camera,
  Gift,
  Heart,
  ICON_STROKE,
  LayoutGrid,
  Mail,
  MapPin,
  Music,
  Package,
  PartyPopper,
  ShoppingBag,
  Utensils,
  Zap,
  type LucideIcon,
} from '@/components/icons/lucide';
import type { ItemIcon as ItemIconName } from '@/data/types';
import { alpha, useTheme } from '@/theme';

const map: Record<ItemIconName, LucideIcon> = {
  decor: PartyPopper,
  cake: Cake,
  venue: MapPin,
  rentals: LayoutGrid,
  invites: Mail,
  food: Utensils,
  favours: Gift,
  photo: Camera,
  gift: Gift,
  games: Zap,
  music: Music,
  outfit: ShoppingBag,
  flowers: Heart,
  drinks: Utensils,
  barrel: Package,
};

/** A plan item's glyph in a soft tinted tile. */
export function ItemIcon({
  icon,
  size = 44,
  tone = 'neutral',
  style,
}: {
  icon: ItemIconName;
  size?: number;
  tone?: 'neutral' | 'gold' | 'green';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const Glyph = map[icon];
  const bg = tone === 'gold' ? t.color.state.gold.bg : tone === 'green' ? t.color.successSoft : alpha(t.color.text, 0.05);
  const fg = tone === 'gold' ? t.color.state.gold.fg : tone === 'green' ? t.color.state.green.fg : t.color.text;
  return (
    <View style={[{ width: size, height: size, borderRadius: size * 0.34, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Glyph size={size * 0.46} color={fg} strokeWidth={ICON_STROKE} />
    </View>
  );
}
