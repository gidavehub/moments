import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { alpha, radius, spring, useTheme } from '@/theme';

import { Text } from './text';

/** Pill segmented control with a spring-sliding thumb (Month | Agenda, Air | Sea…). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone = 'surface',
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  tone?: 'surface' | 'sunk';
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useSharedValue(0);
  const seg = w / options.length;

  useEffect(() => {
    x.set(withSpring(idx * seg, spring.snappy));
  }, [idx, seg, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width - 8)}
      style={[
        styles.track,
        { backgroundColor: tone === 'sunk' ? t.color.bgSunk : alpha(t.color.text, 0.05) },
        style,
      ]}>
      {w > 0 && (
        <Animated.View
          style={[
            styles.thumb,
            { width: seg },
            { backgroundColor: t.color.surface, boxShadow: t.shadow.lift },
            thumb,
          ]}
        />
      )}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (!on) {
                haptic.select();
                onChange(o.value);
              }
            }}
            style={styles.item}>
            <Text variant="callout" color={on ? (t.color.text) : t.color.textMuted}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radius.full, padding: 4, height: 44 },
  thumb: { position: 'absolute', top: 4, left: 4, bottom: 4, borderRadius: radius.full },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
