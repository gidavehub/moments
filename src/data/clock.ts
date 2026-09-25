import { addDays, parseYmd, ymd } from '@/lib/dates';

/**
 * The demo world's "today" — a Wednesday, so the seeded moments fall on the right weekdays
 * (Ava's 30th on Sat Oct 17, Heroes Day Mon Oct 19, US Thanksgiving Thu Nov 26).
 * Swap for `new Date()` once there's real data.
 */
export const TODAY = new Date(2026, 8, 23, 9, 0, 0);

export const today = () => new Date(TODAY);
export const d = (offset: number) => ymd(addDays(TODAY, offset));
export const at = (s: string) => parseYmd(s);
