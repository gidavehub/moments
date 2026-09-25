import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Grain } from '@/components/brand/textures';
import { Character } from '@/components/mascot/character';
import { ItemIcon } from '@/components/moment/item-icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { art } from '@/data/art';
import { kindMeta } from '@/data/kinds';
import type { Idea } from '@/data/types';
import { moneyShort } from '@/lib/money';
import { alpha, tints, useTheme } from '@/theme';

/** A tall occasion card (mental-health "search by sections"): clay art, title, from-price. */
export function IdeaCard({ idea, style, tall = true }: { idea: Idea; style?: StyleProp<ViewStyle>; tall?: boolean }) {
  const t = useTheme();
  const meta = kindMeta[idea.kind];
  const tn = tints[meta.tint];
  const a = art(idea.art);
  const bg = a?.bg ?? tn.bg;
  return (
    <PressableScale
      haptics="tap"
      to={0.97}
      onPress={() => router.push({ pathname: '/idea/[slug]', params: { slug: idea.slug } })}
      accessibilityLabel={idea.title}
      style={[styles.card, { backgroundColor: bg, boxShadow: t.shadow.lift }, style]}>
      <View style={{ height: tall ? 190 : 140 }}>
        {a ? <Image accessibilityLabel="" accessible={false} source={a.source} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} /> : <Character kind={meta.cast} size={110} still />}
        <Grain opacity={0.05} />
        {idea.tag ? (
          <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.85)' }]}>
            <Text variant="caption" color={tn.ink} style={{ fontSize: 10 }}>
              {idea.tag}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text variant="headline" color={tn.ink} numberOfLines={2}>
          {idea.title}
        </Text>
        <Text variant="caption" color={alpha(tn.ink, 0.75)}>
          {idea.guests ? `For ${idea.guests} · ` : ''}from {moneyShort(idea.fromJmd)} landed
        </Text>
      </View>
    </PressableScale>
  );
}

/** A wide template card with the items it includes. */
export function TemplateCard({ idea }: { idea: Idea }) {
  const t = useTheme();
  const a = art(idea.art);
  const tn = tints[kindMeta[idea.kind].tint];
  return (
    <PressableScale
      haptics="tap"
      to={0.97}
      onPress={() => router.push({ pathname: '/idea/[slug]', params: { slug: idea.slug } })}
      style={[styles.template, { backgroundColor: t.color.surface, borderColor: t.color.hairline, boxShadow: t.shadow.plate }]}>
      <View style={[styles.tThumb, { backgroundColor: a?.bg ?? tn.bg }]}>{a ? <Image accessibilityLabel="" accessible={false} source={a.source} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}</View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text variant="headline" numberOfLines={1}>
          {idea.title}
        </Text>
        <Text variant="footnote" tone="muted" numberOfLines={2}>
          {idea.blurb}
        </Text>
        <View style={styles.icons}>
          {idea.included.slice(0, 5).map((it) => (
            <ItemIcon key={it.label} icon={it.icon} size={26} />
          ))}
          <Text variant="caption" tone="subtle">
            {idea.included.length} things
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, overflow: 'hidden', borderCurve: 'continuous' },
  tag: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, height: 22, borderRadius: 11, justifyContent: 'center' },
  body: { padding: 12, paddingTop: 10, gap: 3 },
  template: { width: 300, flexDirection: 'row', gap: 12, padding: 12, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth },
  tThumb: { width: 84, height: 104, borderRadius: 18, overflow: 'hidden' },
  icons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
