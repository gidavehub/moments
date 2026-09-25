import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { MomentsMark } from '@/components/brand/moments-mark';
import { Wordmark } from '@/components/brand/wordmark';
import { Aurora } from '@/components/brand/textures';
import { COUNTRY_NAMES, Flag } from '@/components/icons/flag';
import { ChevronRight, ICON_STROKE, LayoutGrid, Mail, MessageCircle, RotateCcw, Smartphone, Sparkles, Trash } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { useChromeInsets, useChromeScroll } from '@/components/navigation/chrome';
import { Avatar } from '@/components/ui/avatar';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SectionHeader } from '@/components/ui/section-header';
import { Segmented } from '@/components/ui/segmented';
import { StateChip } from '@/components/ui/state-chip';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import { today } from '@/data/clock';
import { people, photoOf } from '@/data/people';
import { setPrefs, usePrefs } from '@/data/prefs';
import { actions, binned, spend, useWorld } from '@/data/store';
import { addDays, daysBetween, fmt } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { moneyShort } from '@/lib/money';
import { enter, GUTTER, kf, stagger, useTheme } from '@/theme';

function nextBirthday(md: string) {
  const now = today();
  const [m, d] = md.split('-').map(Number);
  let next = new Date(now.getFullYear(), m - 1, d);
  if (daysBetween(now, next) < 0) next = new Date(now.getFullYear() + 1, m - 1, d);
  return next;
}

function Row({ icon, label, detail, right, onPress, danger }: { icon: ReactNode; label: string; detail?: string; right?: ReactNode; onPress?: () => void; danger?: boolean }) {
  const t = useTheme();
  const body = (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: danger ? t.color.discountSoft : t.color.state.neutral.bg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" color={danger ? t.color.discount : undefined}>
          {label}
        </Text>
        {detail ? (
          <Text variant="footnote" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={t.color.textSubtle} strokeWidth={ICON_STROKE} /> : null)}
    </View>
  );
  return onPress ? (
    <PressableScale haptics="tap" to={0.985} onPress={onPress}>
      {body}
    </PressableScale>
  ) : (
    body
  );
}

function Group({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={[styles.group, { backgroundColor: t.color.surface, borderColor: t.color.hairline, boxShadow: t.shadow.plate }]}>{children}</View>;
}

export default function You() {
  const t = useTheme();
  const w = useWorld();
  const prefs = usePrefs();
  const insets = useChromeInsets();
  const onScroll = useChromeScroll();
  const inBin = binned(w).length;
  const total = w.moments.reduce((s, m) => s + spend(m).estimate, 0);
  const sorted = w.moments.reduce((s, m) => s + m.items.filter((i) => i.state === 'selected' || i.state === 'order-linked').length, 0);
  const dates = Object.values(people)
    .filter((p) => p.birthday && p.id !== 'ava')
    .map((p) => ({ p, next: nextBirthday(p.birthday!) }))
    .sort((a, b) => a.next.getTime() - b.next.getTime());
  const ic = t.color.textMuted;

  return (
    <View style={[styles.fill, { backgroundColor: t.color.bg }]}>
      <View style={[styles.aurora, { pointerEvents: 'none' }]}>
        <Aurora intensity={0.7} />
      </View>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom }}>
        {/* Profile */}
        <View style={[styles.gutter, styles.profile]}>
          <Avatar crop={photoOf('ava')} name="Ava Brown" size={84} ring={t.color.gold} ringWidth={3} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="title2">{prefs.name} Brown</Text>
            <View style={styles.inline}>
              <Flag code={prefs.destination} size={16} shape="circle" />
              <Text variant="footnote" tone="muted">
                {prefs.city}, {COUNTRY_NAMES[prefs.destination]}
              </Text>
            </View>
            <View style={[styles.plus, { backgroundColor: t.color.state.gold.bg }]}>
              <Sparkles size={13} color={t.color.state.gold.fg} strokeWidth={ICON_STROKE} />
              <Text variant="caption" color={t.color.state.gold.fg} numberOfLines={1}>
                S2S Plus · 2024
              </Text>
            </View>
          </View>
          <Character kind="mo" pose="wave" size={78} />
        </View>

        <View style={[styles.gutter, styles.stats]}>
          {[
            [`${w.moments.length}`, 'moments'],
            [moneyShort(total), 'planned, landed'],
            [`${sorted}`, 'things sorted'],
          ].map(([v, l], i) => (
            <Animated.View key={l} style={[styles.stat, { backgroundColor: t.color.surface, boxShadow: t.shadow.plate }, enter(kf.riseIn, 120 + stagger(i, 60))]}>
              <Text variant="numeralSm" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={v.length > 4 && styles.statLong}>
                {v}
              </Text>
              <Text variant="caption" tone="muted">
                {l}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* People and dates */}
        <SectionHeader title="People and dates" eyebrow="We’ll remind you — and plan it" style={[styles.gutter, styles.section]} />
        <View style={styles.gutter}>
          <Group>
            {dates.map(({ p, next }, i) => {
              const n = daysBetween(today(), next);
              return (
                <View key={p.id}>
                  {i > 0 && <View style={[styles.sep, { backgroundColor: t.color.hairline }]} />}
                  <Row
                    icon={<Avatar crop={photoOf(p.id)} name={p.name} size={40} />}
                    label={p.name}
                    detail={`${p.relation} · ${fmt.monthDay(next)}`}
                    right={<StateChip label={n < 14 ? `In ${n} days` : `${fmt.monthShort(addDays(next, 0))}`} tone={n < 14 ? 'gold' : 'muted'} size="sm" />}
                    onPress={() => router.push('/plan/new')}
                  />
                </View>
              );
            })}
          </Group>
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" style={[styles.gutter, styles.section]} />
        <View style={[styles.gutter, { gap: 12 }]}>
          <Group>
            <Row icon={<Flag code={prefs.destination} size={20} shape="circle" />} label="Deliver to" detail={`${prefs.city}, ${COUNTRY_NAMES[prefs.destination]}`} onPress={() => router.push('/onboarding/destination')} />
            <View style={[styles.sep, { backgroundColor: t.color.hairline }]} />
            <Row
              icon={<MessageCircle size={18} color={ic} strokeWidth={ICON_STROKE} />}
              label="WhatsApp updates"
              detail="English or Patwa. A real person picks it up."
              right={<Toggle label="WhatsApp" value={prefs.channels.whatsapp} onChange={(v) => setPrefs({ channels: { ...prefs.channels, whatsapp: v } })} />}
            />
            <View style={[styles.sep, { backgroundColor: t.color.hairline }]} />
            <Row
              icon={<Smartphone size={18} color={ic} strokeWidth={ICON_STROKE} />}
              label="Push notifications"
              right={<Toggle label="Push" value={prefs.channels.push} onChange={(v) => setPrefs({ channels: { ...prefs.channels, push: v } })} />}
            />
            <View style={[styles.sep, { backgroundColor: t.color.hairline }]} />
            <Row
              icon={<Mail size={18} color={ic} strokeWidth={ICON_STROKE} />}
              label="Email"
              right={<Toggle label="Email" value={prefs.channels.email} onChange={(v) => setPrefs({ channels: { ...prefs.channels, email: v } })} />}
            />
          </Group>

          <Group>
            <View style={styles.pad}>
              <Text variant="bodyStrong">Budget style</Text>
              <Text variant="footnote" tone="muted" style={{ marginBottom: 10 }}>
                How your S2S team shortlists for you
              </Text>
              <Segmented
                options={[
                  { value: 'thrifty', label: 'Thrifty' },
                  { value: 'balanced', label: 'Balanced' },
                  { value: 'splurge', label: 'Splurge' },
                ]}
                value={prefs.budgetStyle}
                onChange={(v) => setPrefs({ budgetStyle: v })}
              />
            </View>
            <View style={[styles.sep, { backgroundColor: t.color.hairline }]} />
            <Row
              icon={<Sparkles size={18} color={ic} strokeWidth={ICON_STROKE} />}
              label="Reduce motion"
              detail="Calmer transitions, no particles"
              right={<Toggle label="Reduce motion" value={prefs.reduceMotion === 'on'} onChange={(v) => setPrefs({ reduceMotion: v ? 'on' : 'system' })} />}
            />
          </Group>

          <Group>
            <Row icon={<Trash size={18} color={t.color.discount} strokeWidth={ICON_STROKE} />} label="Bin" detail={inBin ? `${inBin} task${inBin > 1 ? 's' : ''} waiting to be removed` : 'Empty'} onPress={() => router.push('/bin')} danger />
            <View style={[styles.sep, { backgroundColor: t.color.hairline }]} />
            <Row
              icon={<RotateCcw size={18} color={ic} strokeWidth={ICON_STROKE} />}
              label="Replay intro and onboarding"
              onPress={() => {
                setPrefs({ onboarded: false });
                router.replace('/splash');
              }}
            />
            <View style={[styles.sep, { backgroundColor: t.color.hairline }]} />
            <Row
              icon={<RotateCcw size={18} color={ic} strokeWidth={ICON_STROKE} />}
              label="Reset the demo"
              detail="Puts every moment back how it started"
              onPress={() => {
                haptic.warn();
                actions.reset();
              }}
            />
            {__DEV__ && (
              <>
                <View style={[styles.sep, { backgroundColor: t.color.hairline }]} />
                <Row icon={<LayoutGrid size={18} color={ic} strokeWidth={ICON_STROKE} />} label="Component gallery" onPress={() => router.push('/dev/gallery')} />
              </>
            )}
          </Group>
        </View>

        {/* About */}
        <View style={[styles.gutter, styles.about]}>
          <MomentsMark size={64} state="idle" />
          <Wordmark height={26} lockup />
          <Text variant="caption" tone="subtle" align="center">
            Every price landed — shipping, duty and fees in.{'\n'}Version 1.0 · Made in Kingston
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  aurora: { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  gutter: { paddingHorizontal: GUTTER },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  plus: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, height: 24, borderRadius: 12 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stat: { flex: 1, padding: 12, borderRadius: 20, gap: 2 },
  statLong: { fontSize: 22, lineHeight: 28 },
  section: { marginTop: 28, marginBottom: 12 },
  group: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  pad: { padding: 14 },
  about: { alignItems: 'center', gap: 10, marginTop: 36 },
});

