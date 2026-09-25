import { DefaultTheme, ThemeProvider as NavThemeProvider } from 'expo-router';
import { createContext, use, useMemo, type ReactNode } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { usePrefs } from '@/data/prefs';

import { fonts } from './typography';
import { paper, type Theme } from './themes';

interface ThemeContextValue {
  theme: Theme;
  reduced: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: paper, reduced: false });

/** Moments is light-only, whatever the device is set to. */
const theme = paper;

const navTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.color.gold,
    background: theme.color.bg,
    card: theme.color.surface,
    text: theme.color.text,
    border: theme.color.hairline,
    notification: theme.color.discount,
  },
  fonts: {
    regular: { fontFamily: fonts.medium, fontWeight: 'normal' as const },
    medium: { fontFamily: fonts.semibold, fontWeight: 'normal' as const },
    bold: { fontFamily: fonts.bold, fontWeight: 'normal' as const },
    heavy: { fontFamily: fonts.extrabold, fontWeight: 'normal' as const },
  },
};

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const motionMode = usePrefs((p) => p.reduceMotion);
  const osReduced = useReducedMotion();

  const reduced = motionMode === 'system' ? osReduced : motionMode === 'on';

  const value = useMemo(() => ({ theme, reduced }), [reduced]);

  return (
    <ThemeContext value={value}>
      <NavThemeProvider value={navTheme}>{children}</NavThemeProvider>
    </ThemeContext>
  );
}

export function useTheme(): Theme {
  return use(ThemeContext).theme;
}

/** `true` when motion should be minimised (OS setting or in-app override). */
export function useReduced(): boolean {
  return use(ThemeContext).reduced;
}
