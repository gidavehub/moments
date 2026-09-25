import type { CastName } from '@/components/mascot/cast';
import type { TintName } from '@/theme/palette';

import type { MomentKind } from './types';

export const kindMeta: Record<MomentKind, { label: string; tint: TintName; cast: CastName }> = {
  birthday: { label: 'Birthday', tint: 'birthday', cast: 'tiers' },
  babyShower: { label: 'Baby shower', tint: 'babyShower', cast: 'bloop' },
  wedding: { label: 'Wedding', tint: 'wedding', cast: 'pip' },
  holiday: { label: 'Holiday', tint: 'holiday', cast: 'dot' },
  dinner: { label: 'Dinner', tint: 'dinner', cast: 'pip' },
  trip: { label: 'Trip', tint: 'trip', cast: 'dot' },
  gift: { label: 'Gift', tint: 'gift', cast: 'mo' },
  home: { label: 'Moving', tint: 'home', cast: 'mo' },
};
