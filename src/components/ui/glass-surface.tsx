import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable } from 'expo-glass-effect';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

const liquid = Platform.OS === 'ios' && isGlassEffectAPIAvailable();

export interface GlassSurfaceProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  intensity?: number;
  /** Extra veil on top of the blur (keeps text legible over busy content). */
  veil?: boolean;
  interactive?: boolean;
}

/**
 * Frosted S2S glass. iOS 26 → native Liquid Glass; older iOS and web → BlurView
 * (backdrop-filter on web) + a translucent veil + a bright top edge.
 * NOTE: never fade a GlassView (or a parent) to opacity 0 — move it instead.
 */
export function GlassSurface({ children, style, radius = 32, intensity = 40, veil = true, interactive }: GlassSurfaceProps) {
  const t = useTheme();
  const flat = StyleSheet.flatten(style) ?? {};

  if (liquid) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive={interactive}
        colorScheme={'light'}
        style={[{ borderRadius: radius, overflow: 'hidden', boxShadow: t.shadow.glass }, flat]}>
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[{ borderRadius: radius, boxShadow: t.shadow.glass }, flat]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
        <BlurView intensity={intensity} tint={'systemChromeMaterialLight'} style={StyleSheet.absoluteFill} />
        {veil && <View style={[StyleSheet.absoluteFill, { backgroundColor: t.color.glassFill }]} />}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.color.glassStroke,
              boxShadow: `inset 0px 1px 0px ${t.color.glassHighlight}`,
            },
          ]}
        />
      </View>
      {children}
    </View>
  );
}
