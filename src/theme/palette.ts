/**
 * Raw Shop2Ship palette — copied verbatim from shop2ship-ui/tailwind-preset.cjs so Moments
 * stays in the S2S family. Components never read these directly; they go through the
 * semantic theme in `themes.ts`.
 */

export const brand = {
  navy: '#0D3052',
  gold: '#F4A31C',
  orange: '#FF9C10',
  discount: '#E53935',
  success: '#43A047',
  alert: '#FF6D00',
  whatsapp: '#25D366',
} as const;

export const ink = {
  50: '#F3F7FB',
  100: '#E4EDF5',
  200: '#C6D8E9',
  300: '#9DBAD4',
  400: '#6D93B7',
  500: '#48719A',
  600: '#31567E',
  700: '#204265',
  800: '#153755',
  900: '#0D3052',
  950: '#081F37',
} as const;

export const flare = {
  50: '#FFF9EC',
  100: '#FEEFC9',
  200: '#FDDC8D',
  300: '#FBC450',
  400: '#F9AF26',
  500: '#F4A31C',
  600: '#D8810D',
  700: '#B35E0F',
  800: '#914A13',
  900: '#773C12',
  950: '#451D05',
} as const;

export const canvas = {
  default: '#F7F6F3',
  soft: '#FBFAF8',
  sunk: '#EFEDE8',
} as const;

/** Deep "ink" well used by the intro and particle stages. */
export const well = {
  bg: '#06172A',
  soft: '#0A1D33',
  sunk: '#041120',
  surface: '#0B2340',
  raised: '#153755',
} as const;

/** Category tints for moments — bg / ink (text) pairs, tuned to sit beside navy + gold. */
export const tints = {
  birthday: { bg: '#FEEFC9', ink: '#914A13', deep: '#F4A31C' },
  babyShower: { bg: '#E3EEDC', ink: '#3F6B3A', deep: '#7FA873' },
  wedding: { bg: '#F9E1DC', ink: '#8A3B2E', deep: '#E59A8A' },
  holiday: { bg: '#FFE2D1', ink: '#9A3B0E', deep: '#FF8538' },
  dinner: { bg: '#DDF1FB', ink: '#1F5E82', deep: '#73BFE6' },
  trip: { bg: '#D9F4F6', ink: '#1D6670', deep: '#5CC4CF' },
  gift: { bg: '#ECE6FA', ink: '#54419B', deep: '#9C88E0' },
  home: { bg: '#EFEDE8', ink: '#48719A', deep: '#9DBAD4' },
} as const;

export type TintName = keyof typeof tints;

/** Hex → rgba string. Accepts #RGB or #RRGGBB. */
export function alpha(hex: string, a: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
