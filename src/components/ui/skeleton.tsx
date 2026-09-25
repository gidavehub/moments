import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { css } from 'react-native-reanimated';

import { cssEase, gradient, useReduced, useTheme } from '@/theme';

const sweep = css.keyframes({
  from: { transform: [{ translateX: -160 }] },
  to: { transform: [{ translateX: 360 }] },
});

/** S2S skeleton: a navy-6% plate with a white sheen sweeping across every 1.9s. */
export function Skeleton({
  width = '100%',
  height = 12,
  radius = 6,
  delay = 0,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const reduced = useReduced();
  return (
    <View style={[{ width, height, borderRadius: radius, backgroundColor: t.color.skeleton, overflow: 'hidden' }, style]}>
      {!reduced && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { width: 140 },
            gradient(`linear-gradient(90deg, rgba(255,255,255,0) 0%, ${t.color.skeletonShine} 50%, rgba(255,255,255,0) 100%)`),
            {
              animationName: sweep,
              animationDuration: 1900,
              animationDelay: delay,
              animationIterationCount: 'infinite',
              animationTimingFunction: cssEase.inOut,
            },
          ]}
        />
      )}
    </View>
  );
}
