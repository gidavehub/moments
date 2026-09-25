import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowUp, ICON_STROKE, Paperclip, X } from '@/components/icons/lucide';
import { Chip } from '@/components/ui/chip';
import { GlassSurface } from '@/components/ui/glass-surface';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { haptic } from '@/lib/haptics';
import { fonts, gradient, useTheme } from '@/theme';

/**
 * Pinned "Message your S2S team" bar (S2S request page reply bar). "Ask about this" on an item
 * drops a quote chip above the input and changes the placeholder. Floats over a screen by
 * default; in the chat it sits in the layout (`docked={false}`) with quick replies above it.
 */
export function ReplyBar({
  quoted,
  onClear,
  onSend,
  onAttach,
  replies,
  docked = true,
  attachments = 0,
}: {
  quoted?: string;
  onClear?: () => void;
  onSend: (text: string) => void;
  onAttach?: () => void;
  /** Quick replies (S2S clarification suggestions) — tap to send. */
  replies?: string[];
  docked?: boolean;
  /** Photos waiting to go with the next message. */
  attachments?: number;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0 || attachments > 0;
  const send = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={[{ pointerEvents: 'box-none' }, docked ? styles.dock : styles.inline, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {replies?.length ? (
        <Animated.View entering={FadeInDown.springify().damping(18)} exiting={FadeOutDown.duration(180)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.replies}>
            {replies.map((r) => (
              <Chip key={r} label={r} size="sm" tone="outline" onPress={() => onSend(r)} />
            ))}
          </ScrollView>
        </Animated.View>
      ) : null}
      {quoted ? (
        <Animated.View entering={FadeInDown.springify().damping(18)} exiting={FadeOutDown.duration(200)} style={[styles.quote, { backgroundColor: t.color.state.gold.bg, borderColor: t.color.gold }]}>
          <View style={[styles.quoteBar, { backgroundColor: t.color.gold }]} />
          <Text variant="caption" color={t.color.state.gold.fg} numberOfLines={1} style={{ flex: 1 }}>
            About: {quoted}
          </Text>
          <PressableScale haptics="select" onPress={() => onClear?.()} accessibilityLabel="Remove quote">
            <X size={16} color={t.color.state.gold.fg} strokeWidth={ICON_STROKE} />
          </PressableScale>
        </Animated.View>
      ) : null}
      <GlassSurface radius={30} style={styles.bar}>
        <View style={styles.row}>
          <PressableScale
            haptics="select"
            onPress={onAttach}
            style={[styles.icon, { backgroundColor: attachments ? t.color.state.gold.bg : t.color.state.neutral.bg }]}
            accessibilityLabel={attachments ? `${attachments} photo${attachments > 1 ? 's' : ''} attached` : 'Attach a photo'}>
            <Paperclip size={18} color={attachments ? t.color.state.gold.fg : t.color.textMuted} strokeWidth={ICON_STROKE} />
            {attachments ? (
              <View style={[styles.badge, { backgroundColor: t.color.gold, borderColor: t.color.surface }]}>
                <Text variant="caption" color={t.color.onGold} style={styles.badgeText}>
                  {attachments}
                </Text>
              </View>
            ) : null}
          </PressableScale>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={quoted ? 'Ask about the item above' : 'Message your S2S team'}
            placeholderTextColor={t.color.textSubtle}
            style={[styles.input, { color: t.color.text, fontFamily: fonts.medium }]}
            returnKeyType="send"
            onSubmitEditing={() => {
              haptic.tap();
              send();
            }}
          />
          <PressableScale
            haptics="press"
            disabled={!canSend}
            onPress={send}
            accessibilityLabel="Send"
            style={[styles.send, canSend ? [{ backgroundColor: t.color.gold }, gradient(t.gradient.flareSheen)] : { backgroundColor: t.color.state.neutral.bg }]}>
            <ArrowUp size={20} color={canSend ? t.color.onGold : t.color.textSubtle} strokeWidth={2.6} />
          </PressableScale>
        </View>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 12, right: 12, bottom: 0, gap: 8 },
  quote: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, marginHorizontal: 6 },
  quoteBar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  bar: { height: 60, justifyContent: 'center', paddingHorizontal: 8 },
  inline: { paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  replies: { gap: 8, paddingHorizontal: 6 },
  badge: { position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { fontSize: 10, lineHeight: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: 15, paddingVertical: 8 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
