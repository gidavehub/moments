import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { alpha, spring, useTheme } from '@/theme';

import { Text } from './text';

/** DoMore "Upcoming | Past" tabs — a gold underline that springs between labels. */
export function UnderlineTabs<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const seg = w / options.length;
  const x = useSharedValue(0);
  useEffect(() => {
    x.set(withSpring(idx * seg, spring.snappy));
  }, [idx, seg, x]);
  const bar = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[styles.wrap, { borderColor: alpha(t.color.text, 0.1) }, style]}>
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
            <Text variant="callout" tone={on ? 'default' : 'muted'}>
              {o.label}
              {o.count != null ? <Text variant="caption" tone="subtle">{`  ${o.count}`}</Text> : null}
            </Text>
          </Pressable>
        );
      })}
      {w > 0 && <Animated.View style={[styles.bar, { width: seg, backgroundColor: t.color.gold }, bar]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderBottomWidth: 1.5 },
  item: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  bar: { position: 'absolute', bottom: -1.5, left: 0, height: 3, borderRadius: 2 },
});
