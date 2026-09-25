import { Image, type ImageSource } from 'expo-image';
import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { flare, useTheme } from '@/theme';

import { Text } from './text';

export interface AvatarCrop {
  src: number;
  fx: number;
  fy: number;
  zoom: number;
}

export interface AvatarProps {
  source?: ImageSource | number;
  /** A focal-point crop of a larger photo (face avatars from delivery photos). */
  crop?: AvatarCrop;
  name?: string;
  size?: number;
  tint?: { bg: string; ink: string };
  ring?: string;
  ringWidth?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const initials = (name = '') =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function Avatar({ source, crop, name, size = 40, tint, ring, ringWidth = 2, children, style }: AvatarProps) {
  const bg = tint?.bg ?? flare[100];
  const fg = tint?.ink ?? flare[800];
  return (
    <View
      accessible={!!name}
      role={name ? 'img' : undefined}
      aria-label={name}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: ring ? ringWidth : 0,
          borderColor: ring,
        },
        styles.center,
        style,
      ]}>
      {crop ? (
        <CropImage crop={crop} size={size - (ring ? ringWidth * 2 : 0)} />
      ) : source ? (
        <Image accessibilityLabel="" accessible={false}
          source={source}
          style={{ width: size - (ring ? ringWidth * 2 : 0), height: size - (ring ? ringWidth * 2 : 0), borderRadius: size / 2 }}
          contentFit="cover"
          transition={200}
        />
      ) : children ? (
        children
      ) : (
        <Text variant="caption" color={fg} style={{ fontSize: Math.max(10, size * 0.36), lineHeight: size * 0.44 }}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

function CropImage({ crop, size }: { crop: AvatarCrop; size: number }) {
  const big = size * crop.zoom;
  const clamp = (v: number) => Math.min(0, Math.max(size - big, v));
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
      <Image accessibilityLabel="" accessible={false}
        source={crop.src}
        style={{ position: 'absolute', width: big, height: big, left: clamp(size / 2 - crop.fx * big), top: clamp(size / 2 - crop.fy * big) }}
        contentFit="cover"
        transition={200}
      />
    </View>
  );
}

export function AvatarStack({
  people,
  size = 30,
  max = 3,
  extra,
  ringColor,
  style,
}: {
  people: { name: string; source?: ImageSource | number; crop?: AvatarCrop }[];
  size?: number;
  max?: number;
  /** Override the "+N" label (e.g. "1.2K"). */
  extra?: string;
  ringColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const ring = ringColor ?? t.color.surface;
  const shown = people.slice(0, max);
  const rest = extra ?? (people.length > max ? `+${people.length - max}` : undefined);
  const names = shown.map((p) => p.name.split(' ')[0]);
  const more = people.length - shown.length;
  const label = more > 0 ? `${names.join(', ')} and ${extra ?? more} more` : names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
  return (
    // Read as one group ("Ava, Keisha and 2 more") rather than a row of separate faces.
    <View style={[styles.row, style]} accessible role="img" aria-label={label}>
      {shown.map((p, i) => (
        <Avatar key={p.name + i} name={p.name} source={p.source} crop={p.crop} size={size} ring={ring} style={{ marginLeft: i ? -size * 0.32 : 0, zIndex: 10 - i }} />
      ))}
      {rest ? (
        <View
          style={[
            styles.center,
            {
              marginLeft: -size * 0.32,
              height: size,
              minWidth: size,
              paddingHorizontal: 6,
              borderRadius: size / 2,
              backgroundColor: t.color.gold,
              borderWidth: 2,
              borderColor: ring,
            },
          ]}>
          <Text variant="caption" color={t.color.onGold} style={{ fontSize: 10 }}>
            {rest}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
