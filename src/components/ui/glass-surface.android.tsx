import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { useBlurTarget } from './blur-target';
import type { GlassSurfaceProps } from './glass-surface';

const canBlur = typeof Platform.Version === 'number' && Platform.Version >= 31;

/** Android: real blur on 12+ via BlurTargetView; a denser translucent veil below that. */
export function GlassSurface({ children, style, radius = 32, intensity = 40, veil = true }: GlassSurfaceProps) {
  const t = useTheme();
  const target = useBlurTarget();
  const flat = StyleSheet.flatten(style) ?? {};
  const blur = canBlur && target;

  return (
    <View style={[{ borderRadius: radius, boxShadow: t.shadow.glass }, flat]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
        {blur ? (
          <BlurView
            intensity={intensity}
            tint={'light'}
            blurTarget={target}
            blurMethod="dimezisBlurViewSdk31Plus"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        {veil && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: blur ? t.color.glassFill : 'rgba(255,255,255,0.94)' },
            ]}
          />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, borderWidth: StyleSheet.hairlineWidth, borderColor: t.color.glassStroke },
          ]}
        />
      </View>
      {children}
    </View>
  );
}
