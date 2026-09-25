import { createStore } from '@/lib/create-store';

export type MotionMode = 'system' | 'on' | 'off';

export interface Prefs {
  /** 'on' forces reduced motion, 'off' forces full motion, 'system' follows the OS. */
  reduceMotion: MotionMode;
  onboarded: boolean;
  name: string;
  destination: 'JM' | 'TT' | 'GM' | 'GH';
  city: string;
  channels: { whatsapp: boolean; push: boolean; email: boolean };
  budgetStyle: 'thrifty' | 'balanced' | 'splurge';
}

export const prefsStore = createStore<Prefs>({
  reduceMotion: 'system',
  onboarded: false,
  name: 'Ava',
  destination: 'JM',
  city: 'Kingston',
  channels: { whatsapp: true, push: true, email: false },
  budgetStyle: 'balanced',
});

export const usePrefs = prefsStore.useStore;
export const setPrefs = prefsStore.set;
