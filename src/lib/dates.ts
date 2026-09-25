/**
 * Small date helpers on top of Hermes' Intl. All dates in the mock world are local-midnight
 * based; times are carried separately as "7:00 PM" strings.
 */

export const DAY = 86_400_000;

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function daysBetween(from: Date, to: Date) {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY);
}

export function ymd(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function parseYmd(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const fmt = {
  weekdayShort: (d: Date) => WEEKDAY_SHORT[d.getDay()],
  weekdayLong: (d: Date) => WEEKDAY_LONG[d.getDay()],
  monthShort: (d: Date) => MONTH_SHORT[d.getMonth()],
  monthLong: (d: Date) => MONTH_LONG[d.getMonth()],
  /** "Sat, Oct 17" */
  short: (d: Date) => `${WEEKDAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`,
  /** "Oct 17" */
  monthDay: (d: Date) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`,
  /** "Saturday, October 17" */
  long: (d: Date) => `${WEEKDAY_LONG[d.getDay()]}, ${MONTH_LONG[d.getMonth()]} ${d.getDate()}`,
  /** "October 2026" */
  monthYear: (d: Date) => `${MONTH_LONG[d.getMonth()]} ${d.getFullYear()}`,
};

/** "Today", "Tomorrow", "In 5 days", "3 days ago". */
export function relativeDay(from: Date, to: Date) {
  const n = daysBetween(from, to);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 1 && n < 14) return `In ${n} days`;
  if (n >= 14) return `In ${Math.round(n / 7)} weeks`;
  return `${Math.abs(n)} days ago`;
}

/** 6×7 matrix of dates covering the month (weeks start Sunday). */
export function monthMatrix(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
}

/** The 7 days of the week containing `d`, Monday-first (for the date-pill strip). */
export function weekOf(d: Date) {
  const day = d.getDay();
  const monday = addDays(startOfDay(d), day === 0 ? -6 : 1 - day);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
