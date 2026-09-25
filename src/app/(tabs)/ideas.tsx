import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { ArrowUpRight, ICON_STROKE, Search, SlidersHorizontal } from '@/components/icons/lucide';
import { IdeaCard, TemplateCard } from '@/components/ideas/idea-card';
import { Character } from '@/components/mascot/character';
import { useChromeInsets, useChromeScroll } from '@/components/navigation/chrome';
import { SurfaceMark } from '@/components/system-bars/surface-mark';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SectionHeader } from '@/components/ui/section-header';
import { Text } from '@/components/ui/text';
import { WordReveal } from '@/components/ui/word-reveal';
import { art } from '@/data/art';
import { ideaBySlug, ideas, occasions } from '@/data/fixtures/ideas';
import type { MomentKind } from '@/data/types';
import { moneyShort } from '@/lib/money';
import { cssEase, enter, fonts, gradient, GUTTER, ink, kf, stagger, useTheme } from '@/theme';

export default function Ideas() {
  const t = useTheme();
  const insets = useChromeInsets();
  const onScroll = useChromeScroll();
  const [kind, setKind] = useState<MomentKind | 'all'>('all');
  const [q, setQ] = useState('');

  const shown = useMemo(
    () => ideas.filter((i) => (kind === 'all' || i.kind === kind) && (!q || `${i.title} ${i.blurb}`.toLowerCase().includes(q.toLowerCase()))),
    [kind, q],
  );
  const featured = ideaBySlug('rooftop-birthday')!;
  const fa = art(featured.art);

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom }}>
        <View style={styles.gutter}>
          <Text variant="overline" tone="subtle">
            Ideas
          </Text>
          <WordReveal lines={['What are we', { text: 'celebrating?', color: ink[300] }]} variant="title1" />
        </View>

        <Animated.View style={[styles.gutter, styles.searchRow, enter(kf.riseIn, 200)]}>
          <View style={[styles.search, { backgroundColor: t.color.surface, borderColor: t.color.hairline, boxShadow: t.shadow.plate }]}>
            <Search size={18} color={t.color.textSubtle} strokeWidth={ICON_STROKE} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search ideas"
              placeholderTextColor={t.color.textSubtle}
              style={[styles.input, { color: t.color.text, fontFamily: fonts.medium }]}
            />
          </View>
          <IconButton label="Filters" variant="navy" size={50}>
            <SlidersHorizontal size={19} color="#FFFFFF" strokeWidth={ICON_STROKE} />
          </IconButton>
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8, paddingVertical: 16 }}>
          {occasions.map((o, i) => {
            const a = art(o.art);
            return (
              <Animated.View key={o.kind} style={enter(kf.popIn, 240 + stagger(i, 40), 420, cssEase.spring)}>
                <Chip
                  label={o.label}
                  selected={kind === o.kind}
                  onPress={() => setKind(o.kind)}
                  leading={a ? <Image accessibilityLabel="" accessible={false} source={a.source} style={[styles.chipArt, { backgroundColor: a.bg }]} contentFit="cover" /> : undefined}
                />
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* Featured */}
        {kind === 'all' && !q && (
          <View style={styles.gutter}>
            <PressableScale
              haptics="tap"
              to={0.98}
              onPress={() => router.push({ pathname: '/idea/[slug]', params: { slug: featured.slug } })}
              style={[styles.featured, { backgroundColor: fa?.bg ?? t.color.state.gold.bg, boxShadow: t.shadow.float }]}>
              {fa && <Image accessibilityLabel="" accessible={false} source={fa.source} style={styles.featuredArt} contentFit="cover" />}
              <View style={[styles.featuredFoot, gradient('linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(8,31,55,0.78) 100%)')]}>
                <SurfaceMark />
                <View style={{ flex: 1 }}>
                  <Text variant="overline" color={t.color.gold}>
                    Trending in Kingston
                  </Text>
                  <Text variant="title2" color="#FFFFFF">
                    {featured.title}
                  </Text>
                  <Text variant="footnote" color="rgba(255,255,255,0.8)">
                    For {featured.guests} · from {moneyShort(featured.fromJmd)} landed
                  </Text>
                </View>
                <View style={[styles.go, { backgroundColor: t.color.gold }]}>
                  <ArrowUpRight size={20} color={t.color.onGold} strokeWidth={ICON_STROKE} />
                </View>
              </View>
            </PressableScale>
          </View>
        )}

        <SectionHeader title="Plan by occasion" eyebrow={`${shown.length} ideas`} style={[styles.gutter, styles.section]} />
        <Animated.View layout={LinearTransition.springify().damping(20)} style={[styles.gutter, styles.grid]}>
          {shown.map((idea, i) => (
            <Animated.View key={idea.slug} entering={FadeIn.delay(i * 50)} layout={LinearTransition.springify().damping(20)} style={styles.cell}>
              <IdeaCard idea={idea} />
            </Animated.View>
          ))}
          {!shown.length && (
            <Animated.View entering={FadeIn.duration(300)} style={[styles.empty, { backgroundColor: t.color.bgSunk }]}>
              <Character kind="pip" pose="think" size={92} />
              <View style={{ flex: 1, gap: 8 }}>
                <View>
                  <Text variant="headline">No idea like that yet</Text>
                  <Text variant="footnote" tone="muted">
                    Describe it and your S2S team will plan it anyway.
                  </Text>
                </View>
                <Button
                  label={q ? `Plan “${q.trim().slice(0, 18)}${q.trim().length > 18 ? '…' : ''}”` : 'Plan something new'}
                  size="sm"
                  variant="gold"
                  onPress={() => router.push({ pathname: '/plan/new', params: q ? { prompt: q.trim() } : {} })}
                />
              </View>
            </Animated.View>
          )}
        </Animated.View>

        <SectionHeader title="Start from a template" eyebrow="Your S2S team fills in the rest" style={[styles.gutter, styles.section]} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12, paddingBottom: 6 }}>
          {ideas.slice(2, 7).map((idea) => (
            <TemplateCard key={idea.slug} idea={idea} />
          ))}
        </ScrollView>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  empty: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 24 },
  search: { flex: 1, height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, fontSize: 15 },
  chipArt: { width: 26, height: 26, borderRadius: 13 },
  featured: { height: 250, borderRadius: 30, overflow: 'hidden', borderCurve: 'continuous' },
  featuredArt: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  featuredFoot: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18, paddingTop: 50, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  go: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 28, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '47.9%' },
});
