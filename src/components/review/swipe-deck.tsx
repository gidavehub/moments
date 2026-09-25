import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui/text';
import type { Moment, TimelineTask } from '@/data/types';
import { brand, ease, spring } from '@/theme';

import { DeckCard } from './deck-card';

export type SwipeDir = 'later' | 'done' | 'bin';
export interface SwipeDeckHandle {
  fling: (dir: SwipeDir) => void;
}

const TILT = [-3, 3.5, -4.5];
const REST_CURL = 46;

function Stamp({ label, color, rotate, mode, tx, ty, width, height }: { label: string; color: string; rotate: number; mode: SwipeDir; tx: SharedValue<number>; ty: SharedValue<number>; width: number; height: number }) {
  const style = useAnimatedStyle(() => ({
    opacity:
      mode === 'done'
        ? interpolate(tx.get(), [20, width * 0.3], [0, 1], Extrapolation.CLAMP)
        : mode === 'later'
          ? interpolate(tx.get(), [-20, -width * 0.3], [0, 1], Extrapolation.CLAMP)
          : interpolate(ty.get(), [30, height * 0.3], [0, 1], Extrapolation.CLAMP),
  }));
  return (
    <Animated.View style={[styles.stamp, { borderColor: color, transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <Text variant="title3" color={color}>
        {label}
      </Text>
    </Animated.View>
  );
}

function BackCard({ index, progress, children }: { index: number; progress: SharedValue<number>; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => {
    const p = progress.get();
    const pos = Math.max(0, index - p);
    return {
      transform: [
        { translateY: pos * 14 },
        { scale: 1 - pos * 0.05 },
        { rotate: `${interpolate(pos, [0, 1, 2], [TILT[0], TILT[1], TILT[2]], Extrapolation.CLAMP)}deg` },
      ],
    };
  });
  return <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 10 - index }, style]}>{children}</Animated.View>;
}

/**
 * Tilted stack of loose ends. Drag the top card: right = done, left = later, down = bin.
 * The stamps fade in with the drag, the corner curl peels wider, and the next card rises.
 */
export const SwipeDeck = forwardRef<
  SwipeDeckHandle,
  { tasks: TimelineTask[]; moments: Moment[]; width: number; height: number; onSwipe: (task: TimelineTask, dir: SwipeDir) => void; onDragStart?: () => void }
>(function SwipeDeck({ tasks, moments, width, height, onSwipe, onDragStart }, ref) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const curl = useSharedValue(REST_CURL);
  const back = useSharedValue(0);
  const busy = useSharedValue(0);

  const top = tasks[0];
  const finish = (dir: SwipeDir) => {
    if (top) onSwipe(top, dir);
    tx.set(0);
    ty.set(0);
    curl.set(REST_CURL);
    back.set(0);
    busy.set(0);
  };

  const fling = (dir: SwipeDir) => {
    'worklet';
    if (busy.get()) return;
    busy.set(1);
    const toX = dir === 'done' ? width * 1.6 : dir === 'later' ? -width * 1.6 : 0;
    const toY = dir === 'bin' ? height * 1.6 : -40;
    back.set(withTiming(1, { duration: 360, easing: ease.expo }));
    tx.set(withTiming(toX, { duration: 360, easing: ease.exit }));
    ty.set(
      withTiming(toY, { duration: 360, easing: ease.exit }, (done) => {
        if (done) scheduleOnRN(finish, dir);
      }),
    );
  };

  useImperativeHandle(ref, () => ({ fling: (dir) => fling(dir) }));

  const pan = Gesture.Pan()
    .onBegin(() => {
      if (onDragStart) scheduleOnRN(onDragStart);
    })
    .onUpdate((e) => {
      if (busy.get()) return;
      tx.set(e.translationX);
      ty.set(e.translationY);
      const d = Math.min(1, Math.hypot(e.translationX, e.translationY) / (width * 0.6));
      curl.set(REST_CURL + d * 70);
      back.set(d);
    })
    .onEnd((e) => {
      if (busy.get()) return;
      if (e.translationX > width * 0.33 || e.velocityX > 800) fling('done');
      else if (e.translationX < -width * 0.33 || e.velocityX < -800) fling('later');
      else if (e.translationY > height * 0.35 || e.velocityY > 900) fling('bin');
      else {
        tx.set(withSpring(0, spring.snappy));
        ty.set(withSpring(0, spring.snappy));
        curl.set(withSpring(REST_CURL, spring.soft));
        back.set(withSpring(0, spring.snappy));
      }
    });

  const topStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.get() },
      { translateY: ty.get() },
      { rotate: `${TILT[0] + interpolate(tx.get(), [-width, width], [-14, 14], Extrapolation.CLAMP)}deg` },
    ],
  }));
  const restCurl = useSharedValue(REST_CURL);

  const shadow = { boxShadow: '0px 30px 60px -18px rgba(1,6,14,0.55), 0px 8px 16px 0px rgba(1,6,14,0.18)' };

  return (
    <View style={{ width, height }}>
      {tasks.slice(1, 3).map((task, i) => (
        <BackCard key={task.id} index={i + 1} progress={back}>
          <View style={[styles.cardWrap, shadow]}>
            <DeckCard task={task} moment={moments.find((m) => m.id === task.momentId)} width={width} height={height} curl={restCurl} />
          </View>
        </BackCard>
      ))}
      {top && (
        <GestureDetector gesture={pan}>
          <Animated.View key={top.id} style={[StyleSheet.absoluteFill, { zIndex: 20 }, topStyle]}>
            <View style={[styles.cardWrap, shadow]}>
              <DeckCard task={top} moment={moments.find((m) => m.id === top.momentId)} width={width} height={height} curl={curl} />
            </View>
            <View style={[{ pointerEvents: 'none' }, StyleSheet.absoluteFill, styles.stamps]}>
              <View style={styles.stampLeft}>
                <Stamp label="DONE" color={brand.success} rotate={-12} mode="done" tx={tx} ty={ty} width={width} height={height} />
              </View>
              <View style={styles.stampRight}>
                <Stamp label="LATER" color={brand.gold} rotate={12} mode="later" tx={tx} ty={ty} width={width} height={height} />
              </View>
              <View style={styles.stampBottom}>
                <Stamp label="BIN" color={brand.discount} rotate={-4} mode="bin" tx={tx} ty={ty} width={width} height={height} />
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cardWrap: { borderRadius: 30 },
  stamps: { padding: 22 },
  stamp: { borderWidth: 3, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.85)' },
  stampLeft: { position: 'absolute', top: 110, left: 22 },
  stampRight: { position: 'absolute', top: 110, right: 22 },
  stampBottom: { position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center' },
});
