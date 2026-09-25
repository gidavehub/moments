import { addDays, ymd } from '@/lib/dates';

import { d, today } from './clock';
import { seedMoments } from './fixtures/moments';
import { kindMeta } from './kinds';
import type { ItemState, Moment, MomentKind, PlanItem, TimelineTask } from './types';

export interface DraftInput {
  prompt: string;
  intent: 'event' | 'gift' | 'date';
  guests: number;
  budgetUsd: number;
}

/** Casual nights in: planned like a dinner, but with their own shortlist. */
const GATHERING = /game night|movie night|games? day|hang ?out|get.?together|domino|karaoke|watch party|\blime\b/i;
export const isGathering = (prompt: string) => GATHERING.test(prompt) && !/birthday|shower|wedding/i.test(prompt);

const KEYWORDS: [RegExp, MomentKind][] = [
  [/shower|baby/i, 'babyShower'],
  [/wedding|bridal|engage/i, 'wedding'],
  [/christmas|barrel|holiday|easter|heroes|independence/i, 'holiday'],
  [/dinner|friendsgiving|thanksgiving|brunch|lunch/i, 'dinner'],
  [/trip|travel|vacation|getaway/i, 'trip'],
  [/move|moving|dorm|apartment/i, 'home'],
  [/gift|present|anniversary/i, 'gift'],
  [/birthday|\b\d{1,2}(st|nd|rd|th)\b/i, 'birthday'],
  [GATHERING, 'dinner'],
  [/party/i, 'birthday'],
];

export function kindFor(input: DraftInput): MomentKind {
  for (const [re, k] of KEYWORDS) if (re.test(input.prompt)) return k;
  return input.intent === 'gift' ? 'gift' : input.intent === 'date' ? 'holiday' : 'birthday';
}

/** What the prompt says outright wins over the pickers: "for 10", "12 guests", "US$300", "at my place". */
export function readPrompt(prompt: string) {
  const g = prompt.match(/\b(?:for|with)\s+(\d{1,3})\b|\b(\d{1,3})\s*(?:guests|people|friends|of us|pax)\b/i);
  const b = prompt.match(/(?:US)?\$\s?(\d[\d,]{1,6})|\b(\d[\d,]{2,6})\s*(?:usd|us dollars)\b/i);
  const own = /\bat (?:my|our) (?:place|house|home|yard)\b|\bat home\b/i.test(prompt);
  const theirs = prompt.match(/\bat ([A-Z][a-z]+)[’']s\b/);
  const guests = g ? Number(g[1] ?? g[2]) : undefined;
  const budgetUsd = b ? Number((b[1] ?? b[2]).replace(/,/g, '')) : undefined;
  return {
    guests: guests && guests > 1 ? guests : undefined,
    budgetUsd: budgetUsd && budgetUsd >= 20 ? budgetUsd : undefined,
    place: own ? 'Your place' : theirs ? `${theirs[1]}’s place` : undefined,
  };
}

/** "Ava's 30th — rooftop, 25 guests…" → "Ava's 30th". */
export function titleFor(prompt: string) {
  const head = prompt.split(/\s+[—–-]\s+|,|\.|\bfor\b/i)[0].trim();
  const t = head.length > 2 ? head : prompt.trim();
  const short = t.length > 34 ? `${t.slice(0, 32).trim()}…` : t;
  return short.charAt(0).toUpperCase() + short.slice(1);
}

const TEMPLATE: Record<MomentKind, string> = {
  birthday: 'ava-30th',
  babyShower: 'garden-shower',
  gift: 'mom-birthday',
  dinner: 'friendsgiving',
  holiday: 'christmas-mobay',
  wedding: 'garden-shower',
  trip: 'christmas-mobay',
  home: 'friendsgiving',
};

const art = (key: string) => `art:${key}`;

/** A night in for a crowd: food and drinks first, then the things that make it a night. */
function gatheringItems(guests: number): PlanItem[] {
  const per = (jmd: number) => Math.round((jmd * guests) / 100) * 100;
  return [
    {
      id: 'food',
      title: `Patties, wings and finger food for ${guests}`,
      icon: 'food',
      state: 'researching',
      status: 'Searching',
      chips: [`${guests} guests`, 'Delivered warm'],
      category: 'food',
      estimate: per(1300),
      selection: 'single',
      totalResults: 14,
      options: [
        { id: 'gf1', title: `Patties and finger sandwiches for ${guests}, from a Liguanea caterer`, storeId: 'pricesmart', landed: per(1280), shelfUsd: Math.round(guests * 8.2), image: art('patties-platter'), rating: 4.8, reviews: '61', topPick: true, eta: 'Delivered at 6pm', mode: 'local', description: 'Keisha has used this caterer twice this month. Beef, chicken and callaloo patties, cut small so nobody has to stop playing to eat.' },
        { id: 'gf2', title: `Jerk wings and festival tray for ${guests}`, storeId: 'devonHouse', landed: per(1540), shelfUsd: Math.round(guests * 9.8), image: art('patties-platter'), rating: 4.7, reviews: '128', eta: 'Picked up at 5:30pm', mode: 'local' },
      ],
    },
    {
      id: 'drinks',
      title: 'Drinks and a mocktail bar',
      icon: 'drinks',
      state: 'researching',
      status: 'Searching',
      chips: [`${guests} guests`, 'Ice included'],
      category: 'food',
      estimate: per(420),
      selection: 'single',
      totalResults: 9,
      options: [
        { id: 'gd1', title: `Sorrel, ginger beer and coconut water bar for ${guests}`, storeId: 'pricesmart', landed: per(330), shelfUsd: Math.round(guests * 2.1), image: art('drinks-bar'), rating: 4.6, reviews: '212', topPick: true, eta: 'Delivered at 5pm', mode: 'local', description: 'Members-only pricing on the mixers. Keisha adds two bags of ice so you don’t have to run out mid-game.' },
      ],
    },
    {
      id: 'lights',
      title: 'Fairy lights and table dressing',
      icon: 'decor',
      state: 'researching',
      status: 'Searching',
      chips: ['Warm white', 'No tools'],
      category: 'decor',
      estimate: 4400,
      selection: 'multiple',
      totalResults: 22,
      options: [
        { id: 'gl1', title: 'Warm white LED fairy-light curtain, 3 × 3 m', storeId: 'shein', landed: 3260, shelfUsd: 11.2, image: art('fairy-lights'), rating: 4.4, reviews: '1,540', topPick: true, eta: 'Sourced within the day', mode: 'air', description: 'SHEIN can’t be searched live, so Keisha grabbed this one for you.' },
        { id: 'gl2', title: 'Gold confetti and table runner set', storeId: 'amazon', landed: 1190, shelfUsd: 3.99, image: art('table-confetti'), rating: 4.5, reviews: '612', eta: '6–8 days by air', mode: 'air' },
      ],
    },
    { id: 'games', title: 'Board games, cards and dominoes', icon: 'games', state: 'researching', status: 'Searching', chips: [`For ${guests} players`, 'Team games'], category: 'other', estimate: 9500, workingNote: 'Comparing party-game bundles on Amazon and Walmart' },
    { id: 'music', title: 'Speaker and a playlist', icon: 'music', state: 'researching', status: 'Searching', chips: ['Bluetooth', 'Dancehall + throwbacks'], category: 'people', estimate: 7000 },
    { id: 'tableware', title: `Plates, cups and napkins for ${guests}`, icon: 'rentals', state: 'human-review', status: 'With your S2S team', chips: ['Compostable', `${guests} guests`], category: 'other', estimate: per(260), workingNote: 'Members-only — Keisha will walk it', sourcedBy: { personId: 'keisha', storeId: 'pricesmart' } },
    { id: 'invites', title: 'Digital invitations', icon: 'invites', state: 'researching', status: 'Searching', chips: ['WhatsApp', 'RSVP tracking'], category: 'other', estimate: 1500 },
  ];
}

/** Kinds that borrow another moment's items still get their own cover. */
const OWN_COVER: Partial<Record<MomentKind, string>> = { wedding: 'cover-wedding', trip: 'cover-trip', home: 'cover-home' };

/** A fresh plan: the agent has shortlists for the first things, the S2S team is on the rest. */
function freshItems(kind: MomentKind, guests: number, gathering: boolean): PlanItem[] {
  const base = seedMoments.find((m) => m.id === TEMPLATE[kind]) ?? seedMoments[0];
  return (gathering ? gatheringItems(guests) : base.items).map((item, i): PlanItem => {
    const state: ItemState = item.options?.length && i < 3 ? 'options-ready' : i % 2 ? 'human-review' : 'researching';
    return {
      ...item,
      id: `${item.id}`,
      state,
      status: state === 'options-ready' ? 'Ready to pick' : state === 'human-review' ? 'With your S2S team' : 'Searching',
      chosen: undefined,
      quote: undefined,
      linkedOrder: undefined,
      chips: item.chips.map((c) => c.replace(/\b\d+ guests\b/, `${guests} guests`)),
    };
  });
}

export function buildDraft(input: DraftInput): { moment: Moment; tasks: TimelineTask[] } {
  const kind = kindFor(input);
  const meta = kindMeta[kind];
  const gathering = isGathering(input.prompt);
  const said = readPrompt(input.prompt);
  const guests = said.guests ?? input.guests;
  const budgetUsd = said.budgetUsd ?? input.budgetUsd;
  const template = seedMoments.find((m) => m.id === TEMPLATE[kind]) ?? seedMoments[0];
  const id = `m-${Date.now().toString(36)}`;
  const offset = input.intent === 'gift' ? 14 : 30;
  const date = d(offset);
  const items = freshItems(kind, guests, gathering);

  const moment: Moment = {
    id,
    title: titleFor(input.prompt),
    kind,
    date,
    time: kind === 'gift' ? 'All day' : gathering ? '7:00 PM' : '6:00 PM',
    place: said.place ?? (gathering ? 'Your place' : template.place),
    city: template.city,
    destination: 'JM',
    guests: input.intent === 'event' || said.guests ? guests : undefined,
    budgetUsd,
    preferences: input.prompt,
    occasion: gathering ? 'Get-together' : undefined,
    cover: gathering ? 'cover-game-night' : (OWN_COVER[kind] ?? template.cover),
    cast: meta.cast,
    stage: 'choosing',
    items,
    people: ['ava'],
    origin: 'Moments',
    updates: [
      { id: 'u2', label: `Plan organised into ${items.length} things`, at: 'Just now', who: 'keisha' },
      { id: 'u1', label: 'Moment created', at: 'Just now' },
    ],
  };

  const day = (n: number) => ymd(addDays(today(), offset - n));
  const all: TimelineTask[] = [
    { id: `${id}-t1`, momentId: id, title: 'Pick from your shortlists', due: ymd(addDays(today(), 1)), kind: 'order', done: false, itemId: items[0]?.id },
    { id: `${id}-t2`, momentId: id, title: 'Invites go out', due: day(21), kind: 'invite', done: false },
    { id: `${id}-t3`, momentId: id, title: 'Everything ships by air', due: day(10), kind: 'delivery', done: false },
    { id: `${id}-t4`, momentId: id, title: 'Local orders locked', due: day(7), kind: 'order', done: false },
    { id: `${id}-t5`, momentId: id, title: 'Delivered to your door', due: day(2), kind: 'delivery', done: false },
    { id: `${id}-t6`, momentId: id, title: 'The day', due: date, kind: 'setup', done: false, time: moment.time },
  ];
  const tasks = all.filter((t) => t.due >= ymd(today()));

  return { moment, tasks };
}
