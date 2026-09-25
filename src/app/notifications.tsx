import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { S2SMark } from '@/components/brand/s2s-mark';
import { ChevronLeft, ICON_STROKE } from '@/components/icons/lucide';
import { ItemIcon } from '@/components/moment/item-icon';
import { Avatar } from '@/components/ui/avatar';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StateChip } from '@/components/ui/state-chip';
import { Text } from '@/components/ui/text';
import { photoOf } from '@/data/people';
import type { ItemIcon as ItemIconName } from '@/data/types';
import { enter, GUTTER, kf, stagger, useTheme } from '@/theme';

type Note = { id: string; moment: string; momentId: string; itemId?: string; title: string; body: string; at: string; icon?: ItemIconName; who?: string; tone: 'gold' | 'green' | 'neutral'; unread?: boolean };

const GROUPS: { label: string; items: Note[] }[] = [
  {
    label: 'Today',
    items: [
      { id: 'n1', moment: 'Ava’s 30th', momentId: 'ava-30th', itemId: 'venue', title: 'Rooftop quote ready', body: 'J$66,300 landed, held until Oct 2.', at: '8:40 AM', icon: 'venue', tone: 'gold', unread: true },
      { id: 'n2', moment: 'Mom’s birthday', momentId: 'mom-birthday', itemId: 'gift', title: '4 gift ideas for Mom', body: 'Keisha called the spa in Mandeville — they’ll print your message.', at: '7:55 AM', who: 'keisha', tone: 'gold', unread: true },
      { id: 'n3', moment: 'Ava’s 30th', momentId: 'ava-30th', title: 'Keisha is at PriceSmart', body: 'Members-only floor — picking your drinks bar now.', at: '7:30 AM', who: 'keisha', tone: 'neutral' },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      { id: 'n4', moment: 'Ava’s 30th', momentId: 'ava-30th', itemId: 'cake', title: '3 cakes shortlisted', body: 'Tasted at three bakeries in Half Way Tree.', at: '4:12 PM', icon: 'cake', tone: 'gold' },
      { id: 'n5', moment: 'Shanice’s baby shower', momentId: 'garden-shower', title: 'Rentals are being checked', body: 'Chairs and tables for 30, Hope Gardens.', at: '10:54 AM', icon: 'rentals', tone: 'neutral' },
    ],
  },
  {
    label: 'This week',
    items: [{ id: 'n6', moment: 'Ava’s 30th', momentId: 'ava-30th', itemId: 'favours', title: 'Favour boxes are in your order', body: 'Order S2S-10496 · tracking starts when they ship.', at: 'Mon', icon: 'favours', tone: 'green' }],
  },
];

export default function Notifications() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const offsets = GROUPS.map((_, gi) => GROUPS.slice(0, gi).reduce((a, g) => a + g.items.length, 0));
  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 40, paddingHorizontal: GUTTER }}>
        <View style={styles.head}>
          <IconButton label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}>
            <ChevronLeft size={22} color={t.color.text} strokeWidth={ICON_STROKE} />
          </IconButton>
          <Text variant="title2">Updates</Text>
          <S2SMark size={34} state="idle" style={{ marginLeft: 'auto' }} />
        </View>
        {GROUPS.map((g, gi) => (
          <View key={g.label} style={{ marginTop: 22, gap: 10 }}>
            <Text variant="overline" tone="subtle">
              {g.label}
            </Text>
            {g.items.map((it, k) => {
              const i = offsets[gi] + k;
              return (
                <Animated.View key={it.id} style={enter(kf.riseIn, 80 + stagger(i, 50))}>
                  <PressableScale
                    haptics="tap"
                    to={0.985}
                    onPress={() => router.push({ pathname: '/moment/[id]', params: { id: it.momentId } })}
                    style={[
                      styles.row,
                      { backgroundColor: t.color.surface, borderColor: it.unread ? t.color.gold : t.color.hairline, boxShadow: it.unread ? `${t.shadow.ring}, ${t.shadow.plate}` : t.shadow.plate },
                    ]}>
                    {it.who ? <Avatar crop={photoOf(it.who)} size={44} name="Keisha" /> : <ItemIcon icon={it.icon ?? 'gift'} size={44} tone={it.tone === 'gold' ? 'gold' : it.tone === 'green' ? 'green' : 'neutral'} />}
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.between}>
                        <Text variant="caption" tone="muted">
                          {it.moment}
                        </Text>
                        <Text variant="caption" tone="subtle">
                          {it.at}
                        </Text>
                      </View>
                      <Text variant="headline">{it.title}</Text>
                      <Text variant="footnote" tone="muted">
                        {it.body}
                      </Text>
                      {it.unread && <StateChip label="Your move" tone="gold" size="sm" style={{ marginTop: 6 }} />}
                    </View>
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 22, borderWidth: 1.2 },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
});
