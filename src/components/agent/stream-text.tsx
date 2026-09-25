import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { steps } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { kf, useReduced, useTheme, type TypeVariant } from '@/theme';

/** Streams a reply word by word (S2S: 24ms/word after a 420ms beat) with a blinking gold caret. */
export function StreamText({
  text,
  start = true,
  delay = 420,
  perWord = 34,
  variant = 'body',
  onDone,
  style,
}: {
  text: string;
  start?: boolean;
  delay?: number;
  perWord?: number;
  variant?: TypeVariant;
  onDone?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const reduced = useReduced();
  const words = text.split(' ');
  const [n, setN] = useState(reduced ? words.length : 0);

  useEffect(() => {
    if (!start || reduced) {
      if (reduced) onDone?.();
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < words.length) timer = setTimeout(tick, perWord + (/[.,—]$/.test(words[i - 1]) ? 120 : 0));
      else onDone?.();
    };
    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, text]);

  const streaming = n < words.length;
  return (
    <View style={[styles.wrap, style]} accessibilityLabel={text}>
      <Text variant={variant}>
        {words.slice(0, n).join(' ')}
        {streaming ? ' ' : ''}
      </Text>
      {streaming && start ? (
        <Animated.View
          style={[
            styles.caret,
            { backgroundColor: t.color.gold },
            { animationName: kf.caret, animationDuration: 900, animationIterationCount: 'infinite', animationTimingFunction: steps(2) },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
  caret: { width: 3, height: 18, borderRadius: 2, marginLeft: 2, marginBottom: 3 },
});
