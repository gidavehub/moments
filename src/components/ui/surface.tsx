import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { radius as R, useTheme, type ShadowName } from '@/theme';

export interface SurfaceProps extends ViewProps {
  children?: ReactNode;
  elevation?: ShadowName;
  tone?: 'surface' | 'soft' | 'sunk' | 'raised' | 'transparent';
  radius?: number;
  padded?: boolean | number;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** A card. White on paper, deep navy on ink, with S2S navy-tinted depth. */
export function Surface({
  children,
  elevation = 'plate',
  tone = 'surface',
  radius = R.card,
  padded,
  bordered = true,
  style,
  ...rest
}: SurfaceProps) {
  const t = useTheme();
  const bg = {
    surface: t.color.surface,
    soft: t.color.bgSoft,
    sunk: t.color.bgSunk,
    raised: t.color.surfaceRaised,
    transparent: 'transparent',
  }[tone];

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius,
          borderCurve: 'continuous',
          boxShadow: t.shadow[elevation],
          padding: padded === true ? 16 : typeof padded === 'number' ? padded : 0,
        },
        bordered && { borderWidth: StyleSheet.hairlineWidth, borderColor: t.color.hairline },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}
