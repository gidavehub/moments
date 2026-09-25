import type { Store } from './types';

/** Store coverage mirrors shop2ship-ui `store-coverage.ts`: live stores answer now, sourced ones need a person. */
export const stores: Record<string, Store> = {
  amazon: { id: 'amazon', name: 'Amazon US', coverage: 'live', turnaround: 'Answers now', logo: 'amazon' },
  walmart: { id: 'walmart', name: 'Walmart', coverage: 'live', turnaround: 'Answers now', logo: 'walmart' },
  ebay: { id: 'ebay', name: 'eBay US', coverage: 'live', turnaround: 'Answers now', logo: 'ebay' },
  target: { id: 'target', name: 'Target', coverage: 'live', turnaround: 'Answers now', logo: 'target' },
  shein: { id: 'shein', name: 'SHEIN', coverage: 'sourced', turnaround: 'Usually within the day', logo: 'shein' },
  temu: { id: 'temu', name: 'Temu', coverage: 'sourced', turnaround: 'Usually within the day', logo: 'temu' },
  pricesmart: {
    id: 'pricesmart',
    name: 'PriceSmart',
    coverage: 'sourced',
    turnaround: 'Within the day',
    membersOnly: true,
    local: true,
    area: 'Constant Spring',
  },
  sweetie: { id: 'sweetie', name: 'Sweetie Bakery', coverage: 'sourced', turnaround: 'Within the day', local: true, area: 'Half Way Tree' },
  hwtRentals: { id: 'hwtRentals', name: 'Half Way Tree Rentals', coverage: 'sourced', turnaround: 'Within the day', local: true, area: 'Half Way Tree' },
  devonHouse: { id: 'devonHouse', name: 'Devon House', coverage: 'sourced', turnaround: 'Within the day', local: true, area: 'Kingston' },
  studio7: { id: 'studio7', name: 'Studio 7 Photo', coverage: 'sourced', turnaround: 'Within the day', local: true, area: 'New Kingston' },
};

export const storeName = (id: string) => stores[id]?.name ?? id;
