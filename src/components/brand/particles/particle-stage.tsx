import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { brand, ink, useReduced, useTheme } from '@/theme';

import { ParticleField, type Chapter, type FieldLook } from './particle-field';
import { shapes } from './shapes';

const fadeIn = new Keyframe({ 0: { opacity: 0, transform: [{ scale: 0.94 }] }, 100: { opacity: 1, transform: [{ scale: 1 }] } }).duration(420);
const fadeOut = new Keyframe({ 0: { opacity: 1 }, 100: { opacity: 0 } }).duration(240);

/** Reduced-motion / no-Skia stand-in: the chapter drawn as crisp line art, crossfaded. */
function StaticShape({ chapter, size, look, bg }: { chapter: Chapter; size: number; look: FieldLook; bg: string }) {
  if (chapter === 'cloud') return null;
  const spec = shapes[chapter];
  const ink1 = look === 'ink' ? brand.gold : ink[900];
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <G rotation={spec.rotate ?? 0} origin="256, 256">
        {spec.parts.map((p, i) => {
          const color = p.mode === 'clear' ? bg : i % 3 === 2 ? brand.gold : ink1;
          const stroked = p.mode === 'stroke' || !!p.width;
          return stroked ? (
            <Path key={i} d={p.d} stroke={color} strokeWidth={p.width ?? 24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ) : (
            <Path key={i} d={p.d} fill={color} fillRule={chapter === 's2s' ? 'evenodd' : 'nonzero'} />
          );
        })}
      </G>
    </Svg>
  );
}

export interface ParticleStageProps {
  width: number;
  height: number;
  chapters: Chapter[];
  chapter: Chapter;
  look?: FieldLook;
  fit?: number;
  alive?: boolean;
  morphMs?: number;
  /** Background the stage sits on (for the static fallback's knock-outs). */
  bg?: string;
  onArrive?: (c: Chapter) => void;
  style?: StyleProp<ViewStyle>;
}

/** Picks the live Skia particle field, or the static line-art fallback. */
export const ParticleStage = memo(function ParticleStage(props: ParticleStageProps) {
  const reduced = useReduced();
  const t = useTheme();
  const skiaOk = !globalThis.__SKIA_DISABLED__;
  const { width, height, chapter, look = 'paper', fit = 0.78, style } = props;

  if (reduced || !skiaOk) {
    const size = Math.min(width, height) * fit;
    return (
      <View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, style]}>
        <Animated.View key={chapter} entering={fadeIn} exiting={fadeOut} style={StyleSheet.absoluteFill}>
          <View style={styles.center}>
            <StaticShape chapter={chapter} size={size} look={look} bg={props.bg ?? t.color.bg} />
          </View>
        </Animated.View>
      </View>
    );
  }
  return <ParticleField {...props} />;
});

const styles = StyleSheet.create({ center: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
