import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Grain } from '@/components/brand/textures';
import { ChevronLeft, ICON_STROKE, Sparkles } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { ItemIcon } from '@/components/moment/item-icon';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { SectionHeader } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { WordReveal } from '@/components/ui/word-reveal';
import { art } from '@/data/art';
import { ideaBySlug } from '@/data/fixtures/ideas';
import { kindMeta } from '@/data/kinds';
import { moneyShort } from '@/lib/money';
import { alpha, cssEase, enter, gradient, GUTTER, kf, stagger, tints, useTheme } from '@/theme';

const HERO = 380;

export default function IdeaScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const idea = ideaBySlug(slug ?? '');
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.set(e.contentOffset.y);
  });
  const hero = useAnimatedStyle(() => {
    const v = y.get();
    return { transform: [{ translateY: v > 0 ? v * 0.4 : v }, { scale: v < 0 ? 1 + -v / HERO : 1 }] };
  });

  if (!idea) return null;
  const meta = kindMeta[idea.kind];
  const tn = tints[meta.tint];
  const a = art(idea.art);
  const bg = a?.bg ?? tn.bg;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/ideas'));

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        <View style={{ height: HERO, overflow: 'hidden', backgroundColor: bg }}>
          <Animated.View style={[StyleSheet.absoluteFill, hero]}>
            {a ? <Image accessibilityLabel="" accessible={false} source={a.source} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Character kind={meta.cast} size={200} pose="celebrate" />}
            <Grain opacity={0.06} />
          </Animated.View>
          <View style={[styles.fade, gradient(`linear-gradient(180deg, rgba(0,0,0,0) 50%, ${t.color.bg} 100%)`)]} />
        </View>

        <View style={[styles.gutter, { marginTop: -40 }]}>
          <View style={[styles.kind, { backgroundColor: tn.ink }]}>
            <Text variant="caption" color="#FFFFFF">
              {meta.label}
            </Text>
          </View>
          <WordReveal lines={[idea.title]} variant="display" style={{ marginTop: 10 }} />
          <Animated.View style={enter(kf.riseIn, 260)}>
            <Text variant="body" tone="muted" style={{ marginTop: 6 }}>
              {idea.blurb}
            </Text>
          </Animated.View>
          <View style={styles.stats}>
            <View style={[styles.stat, { backgroundColor: t.color.surface, boxShadow: t.shadow.plate }]}>
              <Text variant="caption" tone="muted">
                From
              </Text>
              <Text variant="title3">{moneyShort(idea.fromJmd)}</Text>
              <Text variant="caption" tone="subtle">
                landed
              </Text>
            </View>
            {idea.guests ? (
              <View style={[styles.stat, { backgroundColor: t.color.surface, boxShadow: t.shadow.plate }]}>
                <Text variant="caption" tone="muted">
                  Guests
                </Text>
                <Text variant="title3">{idea.guests}</Text>
                <Text variant="caption" tone="subtle">
                  adjustable
                </Text>
              </View>
            ) : null}
            <View style={[styles.stat, { backgroundColor: t.color.surface, boxShadow: t.shadow.plate }]}>
              <Text variant="caption" tone="muted">
                Things
              </Text>
              <Text variant="title3">{idea.included.length}</Text>
              <Text variant="caption" tone="subtle">
                sorted for you
              </Text>
            </View>
          </View>
        </View>

        <SectionHeader title="What’s included" style={[styles.gutter, styles.section]} />
        <View style={[styles.gutter, { gap: 10 }]}>
          {idea.included.map((it, i) => (
            <Animated.View key={it.label} style={[styles.inc, { backgroundColor: t.color.surface, borderColor: t.color.hairline }, enter(kf.riseIn, 120 + stagger(i, 50))]}>
              <ItemIcon icon={it.icon} size={42} />
              <Text variant="bodyStrong" style={{ flex: 1 }}>
                {it.label}
              </Text>
            </Animated.View>
          ))}
        </View>

        <SectionHeader title="A typical countdown" style={[styles.gutter, styles.section]} />
        <View style={styles.gutter}>
          {idea.timeline.map((s, i) => (
            <View key={s.label} style={styles.tl}>
              <View style={{ alignItems: 'center', width: 54 }}>
                <View style={[styles.tlBadge, { backgroundColor: s.days === 0 ? t.color.gold : alpha(t.color.text, 0.06) }]}>
                  <Text variant="caption" color={s.days === 0 ? t.color.onGold : t.color.textMuted}>
                    {s.days === 0 ? 'Day' : `D-${s.days}`}
                  </Text>
                </View>
                {i < idea.timeline.length - 1 && <View style={[styles.tlLine, { backgroundColor: alpha(t.color.text, 0.1) }]} />}
              </View>
              <Text variant="bodyStrong" style={{ flex: 1, paddingTop: 4, paddingBottom: 18 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>

      <View style={[styles.nav, { top: insets.top + 10 }]}>
        <IconButton label="Back" onPress={back}>
          <ChevronLeft size={22} color={t.color.text} strokeWidth={ICON_STROKE} />
        </IconButton>
      </View>

      <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 14, backgroundColor: t.color.bg }, enter(kf.riseIn, 400, 520, cssEase.expo)]}>
        <Button
          label="Plan this with S2S"
          variant="gold"
          size="lg"
          block
          leading={<Sparkles size={18} color={t.color.onGold} strokeWidth={ICON_STROKE} />}
          onPress={() => router.push({ pathname: '/plan/new', params: { idea: idea.slug } })}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 200 },
  kind: { alignSelf: 'flex-start', paddingHorizontal: 10, height: 26, borderRadius: 13, justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 18 },
  stat: { flex: 1, padding: 12, borderRadius: 20, gap: 1 },
  section: { marginTop: 28, marginBottom: 12 },
  inc: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  tl: { flexDirection: 'row', gap: 12 },
  tlBadge: { height: 28, minWidth: 48, borderRadius: 14, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  tlLine: { width: 2, flex: 1, marginVertical: 4, borderRadius: 1 },
  nav: { position: 'absolute', left: GUTTER },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: GUTTER, paddingTop: 12 },
});
