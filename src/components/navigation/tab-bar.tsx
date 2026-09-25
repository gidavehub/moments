import { TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View, type View as RNView } from 'react-native';
import Animated, { css, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { openComposerFrom } from '@/components/agent/composer-store';
import { TabIcon, type TabIconName } from '@/components/icons/tab-icons';
import { GlassSurface } from '@/components/ui/glass-surface';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { haptic } from '@/lib/haptics';
import { cssEase, ease, gradient, spring, useTheme } from '@/theme';

import { sparklePath } from '../brand/geometry';
import { TAB_BAR_HEIGHT, useChrome } from './chrome';

const ACTIVE_W = 106;
const IDLE_W = 46;

const labelIn = css.keyframes({
  from: { opacity: 0, transform: [{ translateX: -6 }, { scale: 0.9 }] },
  to: { opacity: 1, transform: [{ translateX: 0 }, { scale: 1 }] },
});

type TabButtonProps = TabTriggerSlotProps & { icon: TabIconName; label: string };

const TabButton = forwardRef<RNView, TabButtonProps>(function TabButton({ isFocused, icon, label, onPress, ...rest }, ref) {
  const t = useTheme();
  const w = useSharedValue(isFocused ? ACTIVE_W : IDLE_W);
  const on = useSharedValue(isFocused ? 1 : 0);
  useEffect(() => {
    w.set(withSpring(isFocused ? ACTIVE_W : IDLE_W, spring.snappy));
    on.set(withTiming(isFocused ? 1 : 0, { duration: 260, easing: ease.expo }));
  }, [isFocused, w, on]);
  const box = useAnimatedStyle(() => ({ width: w.get() }));
  const pill = useAnimatedStyle(() => ({ opacity: on.get(), transform: [{ scale: 0.8 + on.get() * 0.2 }] }));

  const fg = isFocused ? t.color.onGold : t.color.textMuted;
  return (
    <Pressable
      ref={ref}
      {...rest}
      onPress={(e) => {
        if (!isFocused) haptic.select();
        onPress?.(e);
      }}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}>
      <Animated.View style={[styles.tab, box]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.pill, { backgroundColor: t.color.gold }, gradient(t.gradient.flareSheen), pill]} />
        <View>
          <TabIcon name={icon} focused={!!isFocused} color={fg} accent={'#FFFFFF'} size={23} />
        </View>
        {isFocused ? (
          <Animated.View style={{ animationName: labelIn, animationDuration: 320, animationDelay: 60, animationTimingFunction: cssEase.expo, animationFillMode: 'backwards' }}>
            <Text variant="buttonSm" color={fg} numberOfLines={1}>
              {label}
            </Text>
          </Animated.View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
});

function PlanButton() {
  const t = useTheme();
  const spin = useSharedValue(0);
  const ref = useRef<View>(null);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get() * 90}deg` }] }));
  const bg = t.color.navy;
  const fg = t.color.gold;
  return (
    <View ref={ref} collapsable={false}>
      <PressableScale
        haptics="press"
        to={0.9}
        accessibilityLabel="Plan a moment"
        onPressIn={() => spin.set(withSpring(1, spring.bouncy))}
        onPressOut={() => spin.set(withSpring(0, spring.bouncy))}
        onPress={() => openComposerFrom(ref, 26)}
        style={[styles.plan, { backgroundColor: bg, boxShadow: t.shadow.lift }]}>
        <Animated.View style={style}>
          <Svg width={26} height={26} viewBox="0 0 26 26">
            <Path d="M13 5 V21 M5 13 H21" stroke={fg} strokeWidth={3} strokeLinecap="round" />
            <Path d={sparklePath(20.5, 5.5, 3.4)} fill={fg} />
          </Svg>
        </Animated.View>
      </PressableScale>
    </View>
  );
}

/** The floating glass pill: Home · Calendar · [Plan] · Ideas · You. Tucks away on scroll. */
export function TabBar() {
  const insets = useSafeAreaInsets();
  const chrome = useChrome();
  const tuck = useAnimatedStyle(() => ({
    transform: [{ translateY: (chrome?.hidden.get() ?? 0) * (TAB_BAR_HEIGHT + insets.bottom + 30) }],
  }));

  return (
    <Animated.View style={[{ pointerEvents: 'box-none' }, styles.dock, { bottom: Math.max(insets.bottom, 12) + 4 }, tuck]}>
      <GlassSurface radius={34} style={styles.bar}>
        <View style={styles.row}>
          <TabTrigger name="home" asChild>
            <TabButton icon="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="calendar" asChild>
            <TabButton icon="calendar" label="Calendar" />
          </TabTrigger>
          <PlanButton />
          <TabTrigger name="ideas" asChild>
            <TabButton icon="ideas" label="Ideas" />
          </TabTrigger>
          <TabTrigger name="you" asChild>
            <TabButton icon="you" label="You" />
          </TabTrigger>
        </View>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: { height: TAB_BAR_HEIGHT, justifyContent: 'center', paddingHorizontal: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tab: { height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden' },
  pill: { borderRadius: 25 },
  plan: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginHorizontal: 4 },
});
