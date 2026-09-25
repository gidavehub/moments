import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { cappedVariants, type, useTheme, type ThemeColors, type TypeVariant } from '@/theme';

type Tone = 'default' | 'muted' | 'subtle' | 'inverse' | 'gold' | 'success' | 'discount' | 'onGold' | 'onPrimary';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: Tone;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

const toneColor = (c: ThemeColors, tone: Tone) =>
  ({
    default: c.text,
    muted: c.textMuted,
    subtle: c.textSubtle,
    inverse: c.textInverse,
    gold: c.goldText,
    success: c.success,
    discount: c.discount,
    onGold: c.onGold,
    onPrimary: c.onPrimary,
  })[tone];

export function Text({ variant = 'body', tone = 'default', color, align, style, ...rest }: TextProps) {
  const theme = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={cappedVariants.has(variant) ? 1.25 : 1.6}
      {...rest}
      style={[
        type[variant],
        { color: color ?? toneColor(theme.color, tone) },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}

export const AnimatedText = Animated.createAnimatedComponent(Text);
