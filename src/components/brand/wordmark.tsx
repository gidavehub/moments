import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { css } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { brand, cssEase, ink, useReduced } from '@/theme';

import { WORDMARK_GLYPHS, WORDMARK_HEIGHT, WORDMARK_WIDTH } from './wordmark-paths';

const rise = css.keyframes({
  '0%': { opacity: 0, transform: [{ translateY: 18 }, { scale: 0.92 }] },
  '60%': { opacity: 1, transform: [{ translateY: -2 }, { scale: 1.02 }] },
  '100%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
});
const fade = css.keyframes({ from: { opacity: 0, transform: [{ translateY: 6 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } });

/** "moments" in Google Sans Flex Display 600, baked to paths. `reveal` lifts the letters in one by one. */
export const Wordmark = memo(function Wordmark({
  height = 36,
  color,
  reveal = false,
  delay = 0,
  lockup = false,
  align = 'center',
  style,
}: {
  height?: number;
  color?: string;
  reveal?: boolean;
  delay?: number;
  /** Adds "by Shop2Ship" beneath. */
  lockup?: boolean;
  align?: 'center' | 'left';
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReduced();
  const fill = color ?? (brand.navy);
  const width = (WORDMARK_WIDTH / WORDMARK_HEIGHT) * height;
  const animate = reveal && !reduced;

  return (
    <View style={[{ alignItems: align === 'center' ? 'center' : 'flex-start' }, style]} accessible accessibilityRole="header" accessibilityLabel="Moments by Shop2Ship">
      <View style={{ width, height }}>
        {WORDMARK_GLYPHS.map((g, i) => (
          <Animated.View
            key={i}
            style={[
              StyleSheet.absoluteFill,
              animate && {
                transformOrigin: `${(g.cx / WORDMARK_WIDTH) * 100}% 100%`,
                animationName: rise,
                animationDuration: 720,
                animationDelay: delay + i * 55,
                animationTimingFunction: cssEase.expo,
                animationFillMode: 'backwards',
              },
            ]}>
            <Svg width="100%" height="100%" viewBox={`0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}`}>
              <Path d={g.d} fill={fill} />
            </Svg>
          </Animated.View>
        ))}
      </View>
      {lockup && (
        <Animated.View
          style={[
            styles.lockup,
            animate && {
              animationName: fade,
              animationDuration: 600,
              animationDelay: delay + WORDMARK_GLYPHS.length * 55 + 200,
              animationTimingFunction: cssEase.expo,
              animationFillMode: 'backwards',
            },
          ]}>
          <Text variant="caption" color={ink[500]} style={{ fontSize: Math.max(11, height * 0.3), letterSpacing: 0.4 }}>
            by Shop<Text variant="caption" color={brand.gold} style={{ fontSize: Math.max(11, height * 0.3) }}>2</Text>Ship
          </Text>
        </Animated.View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({ lockup: { marginTop: 6 } });
