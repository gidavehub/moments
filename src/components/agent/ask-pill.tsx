import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Keyframe } from 'react-native-reanimated';

import { Character } from '@/components/mascot/character';
import { ICON_STROKE, Mic } from '@/components/icons/lucide';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { promptExamples } from '@/data/agent-script';
import { alpha, gradient, useReduced, useTheme } from '@/theme';

import { openComposerFrom } from './composer-store';

const lineIn = new Keyframe({ 0: { opacity: 0, transform: [{ translateY: 14 }] }, 100: { opacity: 1, transform: [{ translateY: 0 }] } }).duration(420);
const lineOut = new Keyframe({ 0: { opacity: 1, transform: [{ translateY: 0 }] }, 100: { opacity: 0, transform: [{ translateY: -14 }] } }).duration(320);

/**
 * The resting composer (S2S AgenticAskBar, "hero" variant): a pill with Mo, a rotating
 * example of what you could say, and a voice button. Opens the planner.
 */
export function AskPill() {
  const t = useTheme();
  const reduced = useReduced();
  const [i, setI] = useState(0);
  const ref = useRef<View>(null);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % promptExamples.length), 3400);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <View ref={ref} collapsable={false}>
      <PressableScale
        haptics="press"
        to={0.985}
        onPress={() => openComposerFrom(ref, 34)}
        accessibilityLabel="Plan something with Shop2Ship"
        style={[styles.pill, { backgroundColor: t.color.surface, borderColor: alpha(t.color.gold, 0.55), boxShadow: `${t.shadow.ring}, ${t.shadow.lift}` }]}>
        <View style={[styles.avatar, { backgroundColor: t.color.state.gold.bg }]}>
          <Character kind="mo" pose="idle" size={40} sticker={false} still />
        </View>
        <View style={styles.copy}>
          <Text variant="caption" tone="gold">
            What’s coming up?
          </Text>
          <View style={styles.lineClip}>
            <Animated.View key={i} entering={lineIn} exiting={lineOut} style={styles.line}>
              <Text variant="callout" tone="muted" numberOfLines={1}>
                {promptExamples[i]}
              </Text>
            </Animated.View>
          </View>
        </View>
        <View style={[styles.mic, { backgroundColor: t.color.gold }, gradient(t.gradient.flareSheen)]}>
          <Mic size={20} color={t.color.onGold} strokeWidth={ICON_STROKE} />
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, paddingRight: 8, borderRadius: 34, borderWidth: 1.5 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  copy: { flex: 1, gap: 1 },
  lineClip: { height: 22, overflow: 'hidden' },
  line: { position: 'absolute', left: 0, right: 0 },
  mic: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
