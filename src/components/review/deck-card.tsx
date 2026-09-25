import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Clock, Flag as FlagIcon, Frown, ICON_STROKE, MapPin } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { Text } from '@/components/ui/text';
import { kindMeta } from '@/data/kinds';
import type { Moment, TimelineTask } from '@/data/types';
import { daysBetween, fmt, parseYmd } from '@/lib/dates';
import { today } from '@/data/clock';
import { brand, ink, tints } from '@/theme';

const APath = Animated.createAnimatedComponent(Path);
const R = 30;

function bodyPath(w: number, h: number, c: number) {
  'worklet';
  return `M${R} 0 H${w - R} A${R} ${R} 0 0 1 ${w} ${R} V${h - c} L${w - c} ${h} H${R} A${R} ${R} 0 0 1 0 ${h - R} V${R} A${R} ${R} 0 0 1 ${R} 0 Z`;
}
function flapPath(w: number, h: number, c: number) {
  'worklet';
  // The corner folded across the line (w, h-c) → (w-c, h): its tip lands at (w-c, h-c).
  const k = c * 0.18;
  return `M${w} ${h - c} Q${w - c * 0.42 - k} ${h - c * 0.42 - k} ${w - c} ${h} L${w - c * 0.96} ${h - c * 0.96} Z`;
}
function shadowPath(w: number, h: number, c: number) {
  'worklet';
  return `M${w} ${h - c} L${w - c} ${h} L${w - c * 1.08} ${h - c * 0.86} Z`;
}

/**
 * One loose end, as a paper card (reference: the "Your moments" review deck): cast avatar with
 * a letter badge, snooze pill, title, place and time, and a page curl in the bottom-right
 * corner whose size `curl` animates as the card is dragged.
 */
export function DeckCard({ task, moment, width, height, curl }: { task: TimelineTask; moment?: Moment; width: number; height: number; curl: SharedValue<number> }) {
  const meta = moment ? kindMeta[moment.kind] : kindMeta.gift;
  const tn = tints[meta.tint];
  const due = parseYmd(task.due);
  const late = daysBetween(today(), due);
  const snoozed = task.snoozedUntil ? daysBetween(today(), parseYmd(task.snoozedUntil)) : 0;

  const body = useAnimatedProps(() => ({ d: bodyPath(width, height, curl.get()) }));
  const flap = useAnimatedProps(() => ({ d: flapPath(width, height, curl.get()) }));
  const shade = useAnimatedProps(() => ({ d: shadowPath(width, height, curl.get()) }));

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="flap" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.55" stopColor={ink[50]} />
            <Stop offset="1" stopColor={ink[200]} />
          </LinearGradient>
        </Defs>
        <APath animatedProps={body} fill="#FFFFFF" />
        <APath animatedProps={shade} fill={ink[900]} opacity={0.12} />
        <APath animatedProps={flap} fill="url(#flap)" />
      </Svg>

      <View style={styles.content}>
        <View style={styles.top}>
          <View style={[styles.avatar, { backgroundColor: tn.bg }]}>
            <Character kind={moment?.cast ?? 'mo'} size={78} sticker={false} still />
            <View style={[styles.letter, { backgroundColor: brand.gold }]}>
              <Text variant="caption" color={ink[950]}>
                {(moment?.title ?? 'M').replace(/^[^A-Za-z]*/, '')[0]}
              </Text>
            </View>
          </View>
          {snoozed > 0 ? (
            <View style={[styles.pill, { borderColor: ink[100] }]}>
              <Text variant="caption" color={ink[500]}>
                Snoozed for {snoozed} days
              </Text>
              <Frown size={14} color={ink[400]} strokeWidth={ICON_STROKE} />
            </View>
          ) : (
            <View style={[styles.pill, { borderColor: late < 0 ? '#F5C4C2' : ink[100] }]}>
              <Text variant="caption" color={late < 0 ? brand.discount : ink[500]}>
                {late < 0 ? `${-late} day${late === -1 ? '' : 's'} overdue` : late === 0 ? 'Due today' : `Due in ${late} days`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.titleRow}>
          <Text variant="title3" color={ink[950]} style={{ flex: 1 }}>
            {task.title}
          </Text>
          {late < 0 && <FlagIcon size={18} color={brand.discount} fill={brand.discount} strokeWidth={ICON_STROKE} />}
        </View>
        <Text variant="callout" color={ink[600]}>
          {moment?.title}
        </Text>
        <View style={styles.meta}>
          <MapPin size={15} color={ink[400]} strokeWidth={ICON_STROKE} />
          <Text variant="footnote" color={ink[500]} style={{ flex: 1 }} numberOfLines={1}>
            {task.place ?? moment?.place}
          </Text>
        </View>
        <View style={[styles.foot, { borderColor: ink[100] }]}>
          <Clock size={15} color={ink[400]} strokeWidth={ICON_STROKE} />
          <Text variant="footnote" color={ink[500]}>
            {fmt.long(due)}
            {task.time ? ` · ${task.time}` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20, paddingRight: 24, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  avatar: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'flex-end', overflow: 'visible' },
  letter: { position: 'absolute', top: -6, right: -6, width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingHorizontal: 12, borderRadius: 15, borderWidth: 1.5 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, marginRight: 50 },
});
