import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ICON_STROKE, X } from '@/components/icons/lucide';

import { IconButton } from './icon-button';
import { Text } from './text';

/** Sheets draw their own header (Android formSheets can't show a native one). */
export function SheetHeader({ eyebrow, title, subtitle, leading, onClose }: { eyebrow?: string; title: string; subtitle?: string; leading?: ReactNode; onClose?: () => void }) {
  return (
    <View style={styles.row}>
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        {eyebrow ? (
          <Text variant="overline" tone="subtle">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="title3">{title}</Text>
        {subtitle ? (
          <Text variant="footnote" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      <IconButton label="Close" size={38} variant="sunk" onPress={onClose ?? (() => router.back())}>
        <X size={18} strokeWidth={ICON_STROKE} color="#48719A" />
      </IconButton>
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 } });
