import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { css } from 'react-native-reanimated';

import { S2SMark } from '@/components/brand/s2s-mark';
import { Avatar } from '@/components/ui/avatar';
import { SurfaceMark } from '@/components/system-bars/surface-mark';
import { StateChip } from '@/components/ui/state-chip';
import { Text } from '@/components/ui/text';
import { person, photoOf } from '@/data/people';
import { stores } from '@/data/stores';
import { alpha, cssEase, gradient, ink, useReduced, useTheme } from '@/theme';

const progressKf = css.keyframes({
  '0%': { transform: [{ scaleX: 0.08 }] },
  '100%': { transform: [{ scaleX: 1 }] },
});

/**
 * The S2S human tier, made visible: a person on your team is physically in a store that
 * can't be searched (members-only, local). Deep ink card with a live dot and aisle progress.
 */
export function WalkInCard({
  personId = 'keisha',
  storeId = 'pricesmart',
  note = 'Picking the drinks bar for Ava’s 30th',
  progress = 0.66,
  style,
}: {
  personId?: string;
  storeId?: string;
  note?: string;
  progress?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const reduced = useReduced();
  const p = person(personId);
  const s = stores[storeId];
  return (
    <View style={[styles.card, gradient(t.gradient.inkSheen), { backgroundColor: ink[900], boxShadow: t.shadow.float }, style]}>
      <SurfaceMark />
      <View style={styles.top}>
        <View>
          <Avatar crop={photoOf(personId)} name={p?.name} size={52} ring={t.color.gold} ringWidth={2.5} />
          <View style={[styles.badge, { backgroundColor: ink[950] }]}>
            <S2SMark size={22} state="searching" />
          </View>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <StateChip label="Live · in store now" tone="gold" live size="sm" />
          <Text variant="headline" color={ink[50]} style={{ marginTop: 4 }}>
            {p?.short} is at {s?.name} for you
          </Text>
          <Text variant="footnote" color={ink[300]}>
            {s?.membersOnly ? 'Members-only floor · ' : ''}
            {s?.area}
          </Text>
        </View>
      </View>
      <Text variant="callout" color={ink[200]}>
        {note}
      </Text>
      <View style={[styles.track, { backgroundColor: alpha(ink[300], 0.18) }]}>
        <Animated.View
          style={[
            styles.fill,
            { width: `${progress * 100}%`, backgroundColor: t.color.gold, transformOrigin: 'left' },
            !reduced && { animationName: progressKf, animationDuration: 1600, animationTimingFunction: cssEase.expo, animationFillMode: 'backwards', animationDelay: 300 },
          ]}
        />
      </View>
      <View style={styles.row}>
        <Text variant="caption" color={ink[300]}>
          4 of 6 aisles checked
        </Text>
        <Text variant="caption" color={t.color.gold}>
          Photos coming in
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 18, gap: 12, overflow: 'hidden', borderCurve: 'continuous' },
  top: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  badge: { position: 'absolute', right: -6, bottom: -6, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
});
