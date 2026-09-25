import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { css, type CSSKeyframesRule } from 'react-native-reanimated';

import { cssEase, type, useReduced, useTheme, type TypeVariant } from '@/theme';

import { Text } from './text';

const cache = new Map<number, CSSKeyframesRule>();
function riseFor(px: number) {
  const k = Math.round(px);
  let rule = cache.get(k);
  if (!rule) {
    rule = css.keyframes({
      from: { opacity: 0, transform: [{ translateY: k }] },
      to: { opacity: 1, transform: [{ translateY: 0 }] },
    });
    cache.set(k, rule);
  }
  return rule;
}
const fade = css.keyframes({ from: { opacity: 0 }, to: { opacity: 1 } });

export interface RevealLine {
  text: string;
  color?: string;
}

/**
 * Word-by-word headline reveal (the S2S landing `s2sWordRise`): each word rises out of a clip
 * over 760ms, 60ms apart. Lines can carry their own colour for the two-tone treatment.
 */
export function WordReveal({
  lines,
  variant = 'title1',
  delay = 0,
  step = 60,
  align = 'left',
  style,
  textStyle,
}: {
  lines: (RevealLine | string)[];
  variant?: TypeVariant;
  delay?: number;
  step?: number;
  align?: 'left' | 'center';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  const reduced = useReduced();
  const norm = lines.map((l) => (typeof l === 'string' ? { text: l } : l));
  const full = norm.map((l) => l.text).join(' ');
  const size = (type[variant].fontSize ?? 32) as number;
  const lh = (type[variant].lineHeight ?? size * 1.1) as number;
  const rise = riseFor(size * 0.9);

  const offsets = norm.map((_, li) => norm.slice(0, li).reduce((n, l) => n + l.text.split(' ').length, 0));
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={full} style={style}>
      {norm.map((line, li) => (
        <View
          key={li}
          style={[styles.line, align === 'center' && { justifyContent: 'center' }]}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden>
          {line.text.split(' ').map((word, wi, arr) => {
            const i = offsets[li] + wi;
            return (
              <View key={wi} style={[styles.clip, { height: lh + 6, marginRight: wi < arr.length - 1 ? size * 0.26 : 0 }]}>
                <Animated.View
                  style={
                    reduced
                      ? { animationName: fade, animationDuration: 150, animationFillMode: 'backwards' }
                      : {
                          animationName: rise,
                          animationDuration: 760,
                          animationDelay: delay + i * step,
                          animationTimingFunction: cssEase.expo,
                          animationFillMode: 'backwards',
                        }
                  }>
                  <Text variant={variant} color={line.color ?? t.color.text} style={textStyle}>
                    {word}
                  </Text>
                </Animated.View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', flexWrap: 'wrap' },
  clip: { overflow: 'hidden', paddingTop: 3 },
});
