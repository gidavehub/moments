import { type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import type { TypeVariant } from '@/theme/typography';

import { Text } from './text';

/**
 * The signature headline: a muted lead-in, then the payoff in full ink —
 * "Big days, **planned for you.**" (YOBUMA's two-tone display treatment).
 */
export function TwoTone({
  lead,
  strong,
  variant = 'displayL',
  leadColor,
  strongColor,
  align,
  style,
}: {
  lead: string;
  strong: string;
  variant?: TypeVariant;
  leadColor?: string;
  strongColor?: string;
  align?: 'left' | 'center';
  style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  return (
    <Text variant={variant} align={align} color={leadColor ?? t.color.textSubtle} style={style} accessibilityRole="header">
      {lead}
      <Text variant={variant} color={strongColor ?? t.color.text}>
        {strong}
      </Text>
    </Text>
  );
}
