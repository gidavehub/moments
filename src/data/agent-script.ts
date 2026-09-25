import { fmt, parseYmd } from '@/lib/dates';

import { kindMeta } from './kinds';
import { stores } from './stores';
import type { AgentStep, ItemIcon, Moment, TimelineTask } from './types';

/**
 * The scripted agent run for plan/run — the S2S RunTimeline adapted to planning. Each step
 * morphs the particle stage into its own shape.
 */
export const planSteps: AgentStep[] = [
  {
    id: 'read',
    label: 'Reading your moment',
    done: 'Read your moment',
    chips: ['30th birthday', 'Sat, Oct 17', '25 guests', 'Up to US$800'],
    shape: 'envelope',
    ms: 2200,
  },
  {
    id: 'sketch',
    label: 'Sketching the plan',
    done: 'Plan sketched',
    chips: ['Venue', 'Cake', 'Decor', 'Drinks', 'Music', '+4 more'],
    shape: 'checklist',
    ms: 2300,
  },
  {
    id: 'scout',
    label: 'Scouting Amazon, Walmart and local bakeries',
    done: 'Scouted 6 stores',
    chips: ['Amazon US', 'Walmart', 'Sweetie Bakery', 'Devon House'],
    shape: 'store',
    ms: 2500,
  },
  {
    id: 'walk-in',
    label: 'Sending a buyer to PriceSmart',
    done: 'Keisha is on the way',
    chips: ['Members-only', 'Within the day'],
    shape: 'buyer',
    ms: 2600,
    sourced: { personId: 'keisha', storeId: 'pricesmart', note: 'Heading to PriceSmart Constant Spring for the drinks bar' },
  },
  {
    id: 'price',
    label: 'Pricing everything landed to Kingston',
    done: 'Priced to your door',
    chips: ['Shipping quoted', 'Duty and GCT applied', 'Card fees included'],
    shape: 'tag',
    ms: 2300,
  },
  {
    id: 'timeline',
    label: 'Building your countdown',
    done: 'Countdown ready',
    chips: ['Invites out Sep 26', 'Cake locked Oct 10', 'Set-up Oct 17, 4pm'],
    shape: 'calendar',
    ms: 2300,
  },
];

export const planReply =
  'Love this. A rooftop 30th for 25 in Kingston is very doable on US$800 — here’s how we’d pull it off, and what we’ll need you to pick.';

export const planSummary = {
  things: 9,
  estimate: 186400,
  needsYou: 3,
};

export const promptExamples = [
  'Ava’s 30th — rooftop, 25 guests, Oct 17, up to US$800',
  'A garden baby shower for 30 in Kingston',
  'Mom’s birthday gift, she loves gardening',
  'Friendsgiving for 12 at Jordan’s',
  'Christmas barrel from Brooklyn to MoBay',
];

export const suggestionChips = ['Birthday', 'Baby shower', 'Wedding', 'Game night', 'Christmas', 'A gift'];

const ITEM_LABEL: Record<ItemIcon, string> = {
  decor: 'Decor',
  cake: 'Cake',
  venue: 'Venue',
  rentals: 'Rentals',
  invites: 'Invites',
  food: 'Food',
  favours: 'Favours',
  photo: 'Photos',
  gift: 'Gift',
  games: 'Games',
  music: 'Music',
  outfit: 'Outfit',
  flowers: 'Flowers',
  drinks: 'Drinks',
  barrel: 'Barrel',
};

/** The run script, re-chipped for a specific moment (what the agent 'read' from the prompt). */
export function stepsFor(m: Moment, tasks: TimelineTask[] = []): AgentStep[] {
  if (m.id === 'ava-30th') return planSteps;
  const date = fmt.short(parseYmd(m.date));
  const countdown = tasks
    .filter((t) => t.momentId === m.id)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(1, 4)
    .map((t) => `${t.title.split(' ').slice(0, 3).join(' ')} ${fmt.monthDay(parseYmd(t.due))}`);
  const scouted = [...new Set(m.items.flatMap((i) => (i.options ?? []).map((o) => o.storeId)))].map((sid) => stores[sid]).filter(Boolean);
  return planSteps.map((s) => {
    if (s.id === 'read') return { ...s, chips: [m.occasion ?? kindMeta[m.kind].label, date, ...(m.guests ? [`${m.guests} guests`] : []), `Up to US$${m.budgetUsd.toLocaleString()}`] };
    if (s.id === 'sketch') {
      const kinds = [...new Set(m.items.map((i) => ITEM_LABEL[i.icon]))];
      return { ...s, chips: [...kinds.slice(0, 5), ...(kinds.length > 5 ? [`+${kinds.length - 5} more`] : [])] };
    }
    if (s.id === 'scout' && scouted.length) {
      const live = scouted.filter((st) => st.coverage === 'live').map((st) => st.name);
      const walked = scouted.filter((st) => st.coverage === 'sourced').map((st) => st.name);
      const said = [...live.slice(0, 2), ...walked.slice(0, 1)];
      const label = `Scouting ${said.slice(0, -1).join(', ')}${said.length > 1 ? ' and ' : ''}${said.at(-1)}`;
      return { ...s, label, done: `Scouted ${scouted.length} ${scouted.length === 1 ? 'store' : 'stores'}`, chips: scouted.slice(0, 4).map((st) => st.name) };
    }
    if (s.id === 'price') return { ...s, label: `Pricing everything landed to ${m.city}` };
    if (s.id === 'walk-in' && s.sourced) return { ...s, sourced: { ...s.sourced, note: `Checking the members-only floor for ${m.title}` } };
    if (s.id === 'timeline' && countdown.length) return { ...s, chips: countdown };
    return s;
  });
}
