import { memo } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { css } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useLive } from '@/hooks/use-live';
import { brand, cssEase } from '@/theme';

import { LOGO_PATHS } from './s2s-logo-paths';

export type S2SMarkState = 'static' | 'idle' | 'searching' | 'thinking';

const breathe = css.keyframes({
  '0%': { transform: [{ translateY: 0 }, { scale: 1 }] },
  '50%': { transform: [{ translateY: -2 }, { scale: 1.03 }] },
  '100%': { transform: [{ translateY: 0 }, { scale: 1 }] },
});
const orbit = css.keyframes({ from: { transform: [{ rotate: '0deg' }] }, to: { transform: [{ rotate: '360deg' }] } });
const halo = css.keyframes({
  from: { opacity: 0.8, transform: [{ scale: 0.7 }] },
  to: { opacity: 0, transform: [{ scale: 1.3 }] },
});

/** The real Shop2Ship cart-and-globe mark (verbatim paths), with a few live states. */
function S2SMarkImpl({
  size = 40,
  state = 'idle',
  style,
}: {
  size?: number;
  state?: S2SMarkState;
  style?: StyleProp<ViewStyle>;
}) {
  const live = useLive();
  const s = live ? state : 'static';
  const navy = brand.navy;

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Shop2Ship"
      style={[
        { width: size, height: size },
        s !== 'static' && {
          animationName: breathe,
          animationDuration: s === 'idle' ? 4500 : 1800,
          animationIterationCount: 'infinite',
          animationTimingFunction: cssEase.sine,
        },
        style,
      ]}>
      {s === 'searching' && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { animationName: orbit, animationDuration: 1800, animationIterationCount: 'infinite', animationTimingFunction: 'linear' },
          ]}>
          <Svg width="100%" height="100%" viewBox="0 0 512 512">
            <Circle cx={288} cy={222} r={150} fill="none" stroke={brand.gold} strokeWidth={14} strokeDasharray="60 36" strokeLinecap="round" opacity={0.75} />
          </Svg>
        </Animated.View>
      )}
      {s === 'thinking' &&
        [0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              StyleSheet.absoluteFill,
              {
                transformOrigin: '56% 43%',
                animationName: halo,
                animationDuration: 2400,
                animationDelay: i * 800,
                animationIterationCount: 'infinite',
                animationTimingFunction: cssEase.expo,
              },
            ]}>
            <Svg width="100%" height="100%" viewBox="0 0 512 512">
              <Circle cx={288} cy={222} r={140} fill="none" stroke={brand.gold} strokeWidth={10} />
            </Svg>
          </Animated.View>
        ))}
      <Svg width="100%" height="100%" viewBox="0 0 512 512">
        <Path d={LOGO_PATHS[0].d} fill={navy} fillRule="evenodd" />
        <Path d={LOGO_PATHS[1].d} fill={brand.gold} fillRule="evenodd" />
      </Svg>
    </Animated.View>
  );
}

export const S2SMark = memo(S2SMarkImpl);
