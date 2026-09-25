export type Currency = 'JMD' | 'TTD' | 'GMD' | 'GHS' | 'USD';

const PREFIX: Record<Currency, string> = {
  JMD: 'J$',
  TTD: 'TT$',
  GMD: 'D',
  GHS: 'GH₵',
  USD: 'US$',
};

/** Mock FX from USD. */
export const FX: Record<Currency, number> = {
  USD: 1,
  JMD: 157.4,
  TTD: 6.78,
  GMD: 71.5,
  GHS: 15.6,
};

function group(n: number) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** "J$13,849" — whole units, grouped. */
export function money(amount: number, currency: Currency = 'JMD') {
  return `${PREFIX[currency]}${group(amount)}`;
}

/** "J$186k" / "J$1.2M" — compact for tiles. */
export function moneyShort(amount: number, currency: Currency = 'JMD') {
  const p = PREFIX[currency];
  if (amount >= 1_000_000) return `${p}${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1)}M`;
  if (amount >= 10_000) return `${p}${Math.round(amount / 1000)}k`;
  return `${p}${group(amount)}`;
}

export function usdTo(amountUsd: number, currency: Currency) {
  return amountUsd * FX[currency];
}

export const currencyPrefix = (c: Currency) => PREFIX[c];
