import { Platform, type TextStyle } from 'react-native';

/**
 * Google Sans Flex, cut into static instances by scripts/gen-fonts.py and registered in the
 * root layout via `useFonts`: a Text family (optical size 16) for UI and a Display family
 * (optical size 48) for big type, both with ROND 18. Each weight is its own family — never
 * combine these with `fontWeight`, or Android falls back to the system face.
 */
export const fonts = {
  regular: 'GoogleSansFlex-Text400',
  medium: 'GoogleSansFlex-Text500',
  semibold: 'GoogleSansFlex-Text600',
  bold: 'GoogleSansFlex-Text700',
  display: 'GoogleSansFlex-Display600',
  displayBold: 'GoogleSansFlex-Display700',
  // Legacy keys (the old Manrope/Fredoka names) — kept so older call sites resolve.
  extrabold: 'GoogleSansFlex-Display700',
  fun: 'GoogleSansFlex-Text500',
  funBold: 'GoogleSansFlex-Display600',
} as const;

/** Font files for `useFonts`, keyed by the family names above. */
export const fontFiles = {
  'GoogleSansFlex-Text400': require('@/assets/fonts/GoogleSansFlex-Text400.ttf'),
  'GoogleSansFlex-Text500': require('@/assets/fonts/GoogleSansFlex-Text500.ttf'),
  'GoogleSansFlex-Text600': require('@/assets/fonts/GoogleSansFlex-Text600.ttf'),
  'GoogleSansFlex-Text700': require('@/assets/fonts/GoogleSansFlex-Text700.ttf'),
  'GoogleSansFlex-Display600': require('@/assets/fonts/GoogleSansFlex-Display600.ttf'),
  'GoogleSansFlex-Display700': require('@/assets/fonts/GoogleSansFlex-Display700.ttf'),
};

type Variant =
  // The scale (YOBUMA's, tuned for Moments)
  | 'displayXL'
  | 'displayL'
  | 'headlineL'
  | 'headlineM'
  | 'titleL'
  | 'titleM'
  | 'titleS'
  | 'bodyL'
  | 'bodyM'
  | 'bodyS'
  | 'labelL'
  | 'labelM'
  | 'labelS'
  | 'numXL'
  | 'numL'
  | 'numM'
  | 'numS'
  // Older names, mapped onto the scale at their original sizes
  | 'display'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'bodyStrong'
  | 'callout'
  | 'footnote'
  | 'caption'
  | 'overline'
  | 'numeralXL'
  | 'numeral'
  | 'numeralSm'
  | 'wordmark'
  | 'playful'
  | 'button'
  | 'buttonSm';

const em = (size: number, value: number) => Math.round(size * value * 100) / 100;

const base = (family: string, size: number, lineHeight: number, tracking = 0): TextStyle => ({
  fontFamily: family,
  fontSize: size,
  lineHeight,
  letterSpacing: em(size, tracking),
  ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
});

const tnum = (s: TextStyle): TextStyle => ({ ...s, fontVariant: ['tabular-nums'] });

const scale = {
  displayXL: base(fonts.display, 44, 48, -0.035),
  displayL: base(fonts.display, 36, 40, -0.03),
  headlineL: base(fonts.display, 28, 34, -0.02),
  headlineM: base(fonts.semibold, 24, 30, -0.015),
  titleL: base(fonts.semibold, 20, 26, -0.01),
  titleM: base(fonts.semibold, 17, 22, -0.005),
  titleS: base(fonts.semibold, 15, 20),
  bodyL: base(fonts.regular, 16, 24),
  bodyM: base(fonts.regular, 14, 20),
  bodyS: base(fonts.regular, 13, 18),
  labelL: base(fonts.semibold, 16, 20),
  labelM: base(fonts.medium, 14, 18),
  labelS: base(fonts.medium, 12, 16, 0.01),
  numXL: tnum(base(fonts.display, 40, 44, -0.02)),
  numL: tnum(base(fonts.semibold, 28, 32, -0.01)),
  numM: tnum(base(fonts.semibold, 18, 22)),
  numS: tnum(base(fonts.semibold, 14, 18)),
} satisfies Record<string, TextStyle>;

export const type: Record<Variant, TextStyle> = {
  ...scale,
  display: base(fonts.display, 44, 48, -0.035),
  title1: base(fonts.display, 32, 36, -0.03),
  title2: scale.headlineM,
  title3: scale.titleL,
  headline: scale.titleM,
  body: scale.bodyL,
  bodyStrong: base(fonts.semibold, 16, 24),
  callout: base(fonts.medium, 14, 20),
  footnote: scale.bodyS,
  caption: base(fonts.medium, 12, 16),
  overline: { ...base(fonts.semibold, 11, 14, 0.08), textTransform: 'uppercase' },
  numeralXL: tnum(base(fonts.display, 72, 72, -0.03)),
  numeral: tnum(base(fonts.display, 56, 58, -0.03)),
  numeralSm: scale.numL,
  wordmark: base(fonts.display, 28, 30, -0.02),
  playful: base(fonts.medium, 15, 20),
  button: scale.labelL,
  buttonSm: base(fonts.semibold, 14, 18),
};

export type TypeVariant = Variant;

/** Variants big enough to cap Dynamic Type growth so layouts don't explode. */
export const cappedVariants: ReadonlySet<Variant> = new Set([
  'displayXL',
  'displayL',
  'headlineL',
  'numXL',
  'display',
  'title1',
  'numeralXL',
  'numeral',
  'wordmark',
]);
