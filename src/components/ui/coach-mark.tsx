import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { ArrowLeft, ICON_STROKE } from '@/components/icons/lucide';
import { brand, ink } from '@/theme';

import { Button } from './button';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rr(x: number, y: number, w: number, h: number, r: number) {
  const q = Math.min(r, w / 2, h / 2);
  return `M${x + q} ${y} H${x + w - q} A${q} ${q} 0 0 1 ${x + w} ${y + q} V${y + h - q} A${q} ${q} 0 0 1 ${x + w - q} ${y + h} H${x + q} A${q} ${q} 0 0 1 ${x} ${y + h - q} V${y + q} A${q} ${q} 0 0 1 ${x + q} ${y} Z`;
}

/**
 * A spotlight coach mark (reference: "Step 3/3 … Got it!"): an even-odd scrim with a rounded
 * hole around the target, and a white bubble whose arrow points at it.
 */
export function CoachMark({
  target,
  step,
  total,
  text,
  onNext,
  onBack,
}: {
  target: Rect;
  step: number;
  total: number;
  text: string;
  onNext: () => void;
  onBack?: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const pad = 8;
  const hole = { x: target.x - pad, y: target.y - pad, w: target.width + pad * 2, h: target.height + pad * 2 };
  const above = hole.y > height * 0.45;
  const bubbleW = Math.min(320, width - 40);
  const cx = Math.max(20 + 24, Math.min(width - 20 - 24, hole.x + hole.w / 2));
  const bubbleX = Math.max(20, Math.min(width - bubbleW - 20, cx - bubbleW / 2));
  const arrowX = cx - bubbleX;

  return (
    <Animated.View entering={FadeIn.duration(260)} exiting={FadeOut.duration(200)} style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Path d={`M0 0 H${width} V${height} H0 Z ${rr(hole.x, hole.y, hole.w, hole.h, Math.min(28, hole.h / 2))}`} fillRule="evenodd" fill="rgba(1,8,18,0.62)" />
        <Path d={rr(hole.x, hole.y, hole.w, hole.h, Math.min(28, hole.h / 2))} fill="none" stroke={brand.gold} strokeWidth={2} strokeDasharray="6 6" />
      </Svg>
      <Animated.View
        layout={LinearTransition.springify().damping(20)}
        style={[
          styles.bubble,
          { width: bubbleW, left: bubbleX },
          above ? { bottom: height - hole.y + 16 } : { top: hole.y + hole.h + 16 },
        ]}>
        <View style={[styles.arrow, { left: arrowX - 10 }, above ? { bottom: -9 } : { top: -9, transform: [{ rotate: '180deg' }] }]}>
          <Svg width={20} height={10}>
            <Path d="M0 0 L10 10 L20 0 Z" fill="#FFFFFF" />
          </Svg>
        </View>
        <Text variant="callout" color={ink[400]}>
          Step {step}/{total}
        </Text>
        <Text variant="title3" color={ink[950]} style={{ marginTop: 4 }}>
          {text}
        </Text>
        <View style={styles.row}>
          {onBack ? (
            <PressableScale haptics="select" onPress={onBack} style={styles.back} accessibilityLabel="Previous tip">
              <ArrowLeft size={18} color={ink[500]} strokeWidth={ICON_STROKE} />
            </PressableScale>
          ) : (
            <View />
          )}
          <Button label={step === total ? 'Got it!' : 'Next'} variant="navy" size="md" onPress={onNext} style={{ backgroundColor: brand.navy }} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: { position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: 28, padding: 18, boxShadow: '0px 20px 50px -10px rgba(0,0,0,0.4)' },
  arrow: { position: 'absolute' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  back: { width: 48, height: 48, borderRadius: 24, backgroundColor: ink[50], alignItems: 'center', justifyContent: 'center' },
});
