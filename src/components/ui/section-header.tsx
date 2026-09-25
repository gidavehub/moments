import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './text';

/** "Your move · 3            See all" — title with optional eyebrow, count and action. */
export function SectionHeader({
  title,
  eyebrow,
  count,
  action,
  onAction,
  accent,
  leading,
  style,
}: {
  title: string;
  eyebrow?: string;
  count?: number;
  action?: string;
  onAction?: () => void;
  /** Gold heading treatment for "Your move" sections. */
  accent?: boolean;
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        {eyebrow ? (
          <Text variant="overline" tone={accent ? 'gold' : 'subtle'}>
            {eyebrow}
          </Text>
        ) : null}
        <View style={styles.titleRow}>
          {leading}
          <Text variant="title3" color={accent ? t.color.goldText : undefined}>
            {title}
          </Text>
          {count != null ? (
            <View style={[styles.count, { backgroundColor: accent ? t.color.gold : t.color.state.neutral.bg }]}>
              <Text variant="caption" color={accent ? t.color.onGold : t.color.textMuted}>
                {count}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text variant="callout" tone="muted">
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  left: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
});
