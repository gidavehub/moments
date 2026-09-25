import { Platform, type ViewStyle } from 'react-native';

/**
 * CSS gradient string → a style that paints it natively (RN 0.86 `experimental_backgroundImage`)
 * and on web (RNW maps plain `backgroundImage`). One view, no extra native component.
 */
export function gradient(cssGradient: string): ViewStyle {
  return (
    Platform.OS === 'web'
      ? { backgroundImage: cssGradient }
      : { experimental_backgroundImage: cssGradient }
  ) as ViewStyle;
}

/** Android draws each boxShadow layer at real cost; in long lists keep only the soft layer. */
export function lite(shadow: string): string {
  if (Platform.OS !== 'android') return shadow;
  const layers = shadow.split(/,(?![^(]*\))/);
  return layers[layers.length - 1]?.trim() ?? shadow;
}

/** Web-only CSS escape hatch (backdrop blur etc.), typed as ViewStyle for convenience. */
export function webOnly(style: Record<string, unknown>): ViewStyle {
  return (Platform.OS === 'web' ? style : {}) as ViewStyle;
}

/** Plain-object absolute fill — safe to spread (RNW's StyleSheet.absoluteFill is not). */
export const absoluteFill = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } as const;
