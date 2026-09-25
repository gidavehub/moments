import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, type View as RNView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MomentsMark } from '@/components/brand/moments-mark';
import { DotGrid } from '@/components/brand/textures';
import { Check, CircleArrowLeft, ICON_STROKE, Sparkles, Trash, X } from '@/components/icons/lucide';
import { Character } from '@/components/mascot/character';
import { SwipeDeck, type SwipeDeckHandle, type SwipeDir } from '@/components/review/swipe-deck';
import { SurfaceMark } from '@/components/system-bars/surface-mark';
import { Button } from '@/components/ui/button';
import { CoachMark, type Rect } from '@/components/ui/coach-mark';
import { IconButton } from '@/components/ui/icon-button';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ProgressDots, type DotState } from '@/components/ui/progress-dots';
import { Text } from '@/components/ui/text';
import { today } from '@/data/clock';
import { usePrefs } from '@/data/prefs';
import { actions, binned, reviewTasks, useWorld } from '@/data/store';
import type { TimelineTask } from '@/data/types';
import { addDays, fmt } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { alpha, brand, enter, gradient, GUTTER, ink, kf } from '@/theme';

const TIPS = [
  { key: 'later', text: 'Swipe left or tap Later to shift it to a better time' },
  { key: 'done', text: 'Swipe right or tap Done when it’s sorted' },
  { key: 'bin', text: 'Your deleted tasks stay in the bin until you confirm their removal' },
] as const;

/**
 * The monthly tidy-up (reference: "Your moments" task deck), in S2S ink and gold: a tilted
 * deck of loose ends, Later / Done, a bin bar, an intro sheet and a three-step coach mark.
 */
export default function Review() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const w = useWorld();
  const name = usePrefs((p) => p.name);
  const [queue] = useState(() => reviewTasks(w).map((x) => x.id));
  const [handled, setHandled] = useState<Record<string, SwipeDir>>({});
  const [intro, setIntro] = useState(true);
  const [tip, setTip] = useState(-1);
  const [rects, setRects] = useState<Partial<Record<(typeof TIPS)[number]['key'], Rect>>>({});
  const [toast, setToast] = useState<string | null>(null);
  const deck = useRef<SwipeDeckHandle>(null);
  const laterRef = useRef<RNView>(null);
  const doneRef = useRef<RNView>(null);
  const binRef = useRef<RNView>(null);

  const tasks = queue.map((id) => w.tasks.find((x) => x.id === id)).filter((x): x is TimelineTask => !!x && !handled[x.id]);
  const inBin = binned(w).length;
  const dots: DotState[] = queue.map((id, i) => (handled[id] ? 'done' : i === Object.keys(handled).length ? 'half' : 'todo'));

  const measureAll = () => {
    const pairs = [
      ['later', laterRef],
      ['done', doneRef],
      ['bin', binRef],
    ] as const;
    pairs.forEach(([k, r]) => r.current?.measureInWindow((x, y, width, height) => setRects((prev) => ({ ...prev, [k]: { x, y, width, height } }))));
  };

  const onSwipe = (task: TimelineTask, dir: SwipeDir) => {
    setHandled((h) => ({ ...h, [task.id]: dir }));
    if (dir === 'done') {
      haptic.success();
      actions.completeTask(task.id);
    } else if (dir === 'later') {
      haptic.tap();
      actions.snoozeTask(task.id, 3);
      setToast(`Moved to ${fmt.short(addDays(today(), 3))}`);
      setTimeout(() => setToast(null), 1800);
    } else {
      haptic.warn();
      actions.binTask(task.id);
    }
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  const deckW = width - 56;
  const deckH = 330;

  return (
    <View style={[styles.fill, { backgroundColor: ink[900] }, gradient('linear-gradient(170deg, #143755 0%, #0D3052 45%, #081F37 100%)')]}>
      <SurfaceMark priority={0} />
      <DotGrid color={alpha(ink[200], 0.1)} fade="radial" />

      {/* Header */}
      <View style={[styles.gutter, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headRow}>
          <View style={{ flex: 1 }}>
            <Animated.View style={enter(kf.riseIn, 80)}>
              <Text variant="title1" color="#FFFFFF">
                Good day,{'\n'}
                {name}
              </Text>
            </Animated.View>
          </View>
          <IconButton label="Close" onPress={close} style={{ backgroundColor: alpha('#FFFFFF', 0.12), borderColor: alpha('#FFFFFF', 0.18) }}>
            <X size={20} color="#FFFFFF" strokeWidth={ICON_STROKE} />
          </IconButton>
        </View>
        <Animated.View style={[{ marginTop: 16, gap: 6 }, enter(kf.riseIn, 200)]}>
          <Text variant="headline" color={ink[100]}>
            Take a moment to tidy {fmt.monthLong(today())}
          </Text>
          <View style={styles.inline}>
            <Sparkles size={16} color={brand.gold} strokeWidth={ICON_STROKE} />
            <Text variant="callout" color={ink[200]}>
              <Text variant="callout" color="#FFFFFF">
                {tasks.length} loose ends
              </Text>{' '}
              left this month
            </Text>
          </View>
        </Animated.View>
        <Animated.View style={[{ marginTop: 18 }, enter(kf.fadeIn, 320)]}>
          <ProgressDots items={dots} onColor="#FFFFFF" size={24} />
        </Animated.View>
      </View>

      {/* Deck */}
      <View style={styles.deckArea}>
        {tasks.length ? (
          <Animated.View entering={FadeIn.delay(300).duration(500)}>
            <SwipeDeck ref={deck} tasks={tasks} moments={w.moments} width={deckW} height={deckH} onSwipe={onSwipe} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.done}>
            <Character kind="mo" pose="celebrate" prop="confetti" size={170} />
            <Text variant="title2" color="#FFFFFF" align="center">
              All tidy.
            </Text>
            <Text variant="body" color={ink[200]} align="center">
              {Object.values(handled).filter((d) => d === 'done').length} done ·{' '}
              {Object.values(handled).filter((d) => d === 'later').length} moved · {Object.values(handled).filter((d) => d === 'bin').length} in the bin
            </Text>
            <Button label="Back to home" variant="gold" size="lg" onPress={close} style={{ marginTop: 10 }} />
          </Animated.View>
        )}
      </View>

      {/* Later / Done */}
      {tasks.length > 0 && (
        <View style={[styles.gutter, styles.actions]}>
          <View ref={laterRef} collapsable={false}>
            <PressableScale haptics="tap" onPress={() => deck.current?.fling('later')} style={styles.action} accessibilityLabel="Later">
              <CircleArrowLeft size={18} color={ink[100]} strokeWidth={ICON_STROKE} />
              <Text variant="callout" color={ink[100]}>
                Later
              </Text>
            </PressableScale>
          </View>
          <View ref={doneRef} collapsable={false}>
            <PressableScale haptics="tap" onPress={() => deck.current?.fling('done')} style={styles.action} accessibilityLabel="Done">
              <Check size={18} color={ink[100]} strokeWidth={ICON_STROKE} />
              <Text variant="callout" color={ink[100]}>
                Done
              </Text>
            </PressableScale>
          </View>
        </View>
      )}

      {/* Bin bar */}
      <View style={[styles.binBar, { bottom: insets.bottom + 16 }]}>
        <View style={{ flex: 1, paddingLeft: 8 }}>
          <Text variant="title3" color={ink[950]}>
            {inBin}
          </Text>
          <Text variant="footnote" color={ink[500]}>
            Tasks to delete
          </Text>
        </View>
        <View ref={binRef} collapsable={false}>
          <Button
            label="Open bin"
            variant="danger"
            size="md"
            leading={<Trash size={16} color={brand.discount} strokeWidth={ICON_STROKE} />}
            onPress={() => router.push('/bin')}
            style={{ backgroundColor: '#FDE7E6' }}
          />
        </View>
      </View>

      {toast && (
        <Animated.View entering={FadeInDown.springify()} exiting={FadeOut} style={[styles.toast, { top: insets.top + 10 }]}>
          <Text variant="callout" color={ink[950]}>
            {toast}
          </Text>
        </Animated.View>
      )}

      {/* Intro sheet */}
      {intro && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={[StyleSheet.absoluteFill, styles.scrim]}>
          <Animated.View entering={SlideInDown.springify().damping(20)} exiting={SlideOutDown.duration(260)} style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
            <SurfaceMark tone="light" priority={2} />
            <View style={styles.grabber} />
            <View style={[styles.iconTile, { backgroundColor: ink[50] }]}>
              <MomentsMark size={70} state="idle" variant="navy" />
            </View>
            <Text variant="title1" color={ink[950]} align="center" style={{ marginTop: 18 }}>
              Your moments
            </Text>
            <Text variant="body" color={ink[700]} align="center" style={{ marginTop: 10 }}>
              We’ve organised this month’s tasks for easy review. Clean up what’s no longer relevant — or shift it to a better time.
            </Text>
            <Button
              label="Let’s go"
              variant="navy"
              size="lg"
              block
              style={{ marginTop: 24, backgroundColor: brand.navy }}
              onPress={() => {
                setIntro(false);
                setTimeout(() => {
                  measureAll();
                  setTip(0);
                }, 450);
              }}
            />
          </Animated.View>
        </Animated.View>
      )}

      {/* Coach marks */}
      {tip >= 0 && tip < TIPS.length && rects[TIPS[tip].key] && (
        <CoachMark
          key={tip}
          target={rects[TIPS[tip].key]!}
          step={tip + 1}
          total={TIPS.length}
          text={TIPS[tip].text}
          onBack={tip > 0 ? () => setTip((n) => n - 1) : undefined}
          onNext={() => setTip((n) => n + 1)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  headRow: { flexDirection: 'row', alignItems: 'flex-start' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deckArea: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -10 },
  done: { alignItems: 'center', gap: 8, paddingHorizontal: 40 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 118 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, paddingHorizontal: 18, borderRadius: 23, backgroundColor: alpha('#FFFFFF', 0.1), borderWidth: 1, borderColor: alpha('#FFFFFF', 0.16) },
  binBar: { position: 'absolute', left: GUTTER, right: GUTTER, height: 76, borderRadius: 38, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, boxShadow: '0px 18px 40px -10px rgba(0,0,0,0.45)' },
  toast: { position: 'absolute', alignSelf: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, boxShadow: '0px 10px 30px -8px rgba(0,0,0,0.4)' },
  scrim: { backgroundColor: 'rgba(1,8,18,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingTop: 12, alignItems: 'center' },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: ink[100], marginBottom: 18 },
  iconTile: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center' },
});

