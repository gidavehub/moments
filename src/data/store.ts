import { addDays, parseYmd, ymd } from '@/lib/dates';
import { createStore } from '@/lib/create-store';

import { today } from './clock';
import { buildDraft, type DraftInput } from './drafts';
import { fallbackReply, scriptedReplies, seedChats, starterThread } from './fixtures/chats';
import { seedMoments, seedTasks } from './fixtures/moments';
import { seedOrders } from './fixtures/orders';
import { stores } from './stores';
import type { ChatCard, ChatMessage, Contact, ItemState, Moment, Order, OrderLine, PaymentId, PlanItem, PlanRole, TimelineTask } from './types';

/**
 * The mock world. Everything the UI mutates lives here so screens stay in sync
 * (pick an option on the item sheet → the moment, Home's "Your move" and the calendar update).
 */
interface World {
  moments: Moment[];
  tasks: TimelineTask[];
  /** Threads with the agent + your S2S team, per moment. */
  chats: Record<string, ChatMessage[]>;
  /** Who is typing in each thread right now. */
  typing: Record<string, 'agent' | 'team' | undefined>;
  orders: Order[];
  contacts: Contact[];
  /** The moment plan/run just produced. */
  draftId?: string;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const seedWorld = (): World => ({
  moments: clone(seedMoments),
  tasks: clone(seedTasks),
  chats: clone(seedChats),
  typing: {},
  orders: clone(seedOrders),
  contacts: [],
});

export const world = createStore<World>(seedWorld());
export const useWorld = world.useStore;

const clockTime = (n = new Date()) => `${((n.getHours() + 11) % 12) + 1}:${`${n.getMinutes()}`.padStart(2, '0')} ${n.getHours() < 12 ? 'AM' : 'PM'}`;
const stamp = () => `Today, ${clockTime()}`;
const nowId = (p: string) => `${p}${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`;

function pushMessage(momentId: string, msg: Omit<ChatMessage, 'id' | 'day' | 'time'>) {
  const full: ChatMessage = { id: nowId('c'), day: ymd(today()), time: clockTime(), ...msg };
  world.set((w) => ({ chats: { ...w.chats, [momentId]: [...(w.chats[momentId] ?? []), full] } }));
}

/** An order from lines, attached to the items it covers. */
function placeOrder(momentId: string, lines: OrderLine[], payment: PaymentId): Order {
  const local = lines.every((l) => stores[l.storeId]?.local);
  const order: Order = {
    id: `S2S-${10500 + Math.floor(Math.random() * 480)}`,
    momentId,
    placed: ymd(today()),
    mode: local ? 'local' : 'air',
    lines,
    total: lines.reduce((sum, l) => sum + l.landed, 0),
    stage: 'placed',
    eta: ymd(addDays(today(), local ? 2 : 8)),
    payment,
    courierId: 'marcus',
    log: [{ stage: 'placed', at: `${ymd(today())} ${clockTime()}` }],
  };
  world.set((w) => ({
    orders: [order, ...w.orders],
    moments: w.moments.map((m) =>
      m.id !== momentId
        ? m
        : {
            ...m,
            items: m.items.map((i) =>
              lines.some((l) => l.itemId === i.id) ? { ...i, state: 'order-linked' as ItemState, status: 'In your order', linkedOrder: `Order ${order.id}` } : i,
            ),
          },
    ),
  }));
  return order;
}

function patchItem(momentId: string, itemId: string, fn: (i: PlanItem) => PlanItem, update?: string) {
  world.set((w) => ({
    moments: w.moments.map((m) =>
      m.id !== momentId
        ? m
        : {
            ...m,
            items: m.items.map((i) => (i.id === itemId ? fn(i) : i)),
            updates: update ? [{ id: `u${Date.now()}`, label: update, at: stamp() }, ...m.updates] : m.updates,
          },
    ),
  }));
}

export const actions = {
  pickOptions(momentId: string, itemId: string, optionIds: string[]) {
    patchItem(
      momentId,
      itemId,
      (i) => ({ ...i, chosen: optionIds, state: 'selected' as ItemState, status: 'Chosen' }),
      `You picked ${optionIds.length > 1 ? `${optionIds.length} options` : 'an option'} for ${itemTitle(momentId, itemId)}`,
    );
  },
  approveQuote(momentId: string, itemId: string) {
    const item = world.get().moments.find((m) => m.id === momentId)?.items.find((i) => i.id === itemId);
    patchItem(momentId, itemId, (i) => ({ ...i, quote: i.quote ? { ...i.quote, status: 'accepted' } : i.quote }), `Quote accepted for ${itemTitle(momentId, itemId)}`);
    const q = item?.quote;
    const lines: OrderLine[] = q
      ? [{ itemId, title: item.title, storeId: q.lines[0]?.storeId ?? 'amazon', qty: 1, landed: q.total }]
      : [{ itemId, title: item?.title ?? 'Item', storeId: 'amazon', qty: 1, landed: item?.estimate ?? 0 }];
    const order = placeOrder(momentId, lines, 'visa');
    pushMessage(momentId, { from: 'agent', text: `Quote accepted — ${item?.title.toLowerCase() ?? 'it'} is in your order now.`, card: { kind: 'order', orderId: order.id } });
  },
  askAgain(momentId: string, itemId: string) {
    patchItem(
      momentId,
      itemId,
      (i) => ({ ...i, state: 'human-review' as ItemState, status: 'With your S2S team', workingNote: 'Keisha is looking again with your notes', chosen: [] }),
      `You asked for new options for ${itemTitle(momentId, itemId)}`,
    );
  },
  toggleTask(id: string) {
    world.set((w) => ({ tasks: w.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  },
  completeTask(id: string) {
    world.set((w) => ({ tasks: w.tasks.map((t) => (t.id === id ? { ...t, done: true } : t)) }));
  },
  snoozeTask(id: string, days: number) {
    world.set((w) => ({
      tasks: w.tasks.map((t) => (t.id === id ? { ...t, snoozedUntil: ymd(addDays(today(), days)), due: ymd(addDays(today(), days)) } : t)),
    }));
  },
  binTask(id: string) {
    world.set((w) => ({ tasks: w.tasks.map((t) => (t.id === id ? { ...t, binned: true } : t)) }));
  },
  restoreTask(id: string) {
    world.set((w) => ({ tasks: w.tasks.map((t) => (t.id === id ? { ...t, binned: false } : t)) }));
  },
  emptyBin() {
    world.set((w) => ({ tasks: w.tasks.filter((t) => !t.binned) }));
  },
  /** Turn a planner draft into a moment (the example prompt reuses the seeded Ava's 30th). */
  createDraft(input: DraftInput): string {
    if (/ava.?s 30th/i.test(input.prompt) && world.get().moments.some((m) => m.id === 'ava-30th')) return 'ava-30th';
    const { moment, tasks } = buildDraft(input);
    world.set((w) => ({ moments: [...w.moments, moment], tasks: [...w.tasks, ...tasks], draftId: moment.id }));
    return moment.id;
  },
  setDraft(id?: string) {
    world.set({ draftId: id });
  },
  /** Open a thread for a moment (seeded, or a fresh hand-off from the agent to Keisha). */
  ensureThread(momentId: string) {
    const w = world.get();
    if (w.chats[momentId]) return;
    const m = w.moments.find((x) => x.id === momentId);
    if (m) world.set({ chats: { ...w.chats, [momentId]: starterThread(m) } });
  },
  /** You send a message; whoever handles that kind of thing types for a moment and answers. */
  sendMessage(momentId: string, text: string, card?: ChatCard) {
    pushMessage(momentId, { from: 'you', text: text || undefined, card });
    const reply = scriptedReplies.find((r) => r.match.test(text)) ?? fallbackReply;
    setTimeout(() => world.set((w) => ({ typing: { ...w.typing, [momentId]: reply.from } })), 500);
    setTimeout(() => {
      world.set((w) => ({ typing: { ...w.typing, [momentId]: undefined } }));
      pushMessage(momentId, { from: reply.from, personId: reply.from === 'team' ? 'keisha' : undefined, text: reply.text, replies: reply.replies });
    }, 2300);
  },
  /** Everything you've picked goes to one or two orders (air via Miami, local by courier). */
  checkout(momentId: string, payment: PaymentId): Order[] {
    const m = world.get().moments.find((x) => x.id === momentId);
    if (!m) return [];
    const lines = readyToOrder(m).flatMap(({ item, options }) =>
      options.map((o): OrderLine => ({ itemId: item.id, title: o.title, storeId: o.storeId, qty: 1, landed: o.landed, image: o.image })),
    );
    const byMode = [lines.filter((l) => !stores[l.storeId]?.local), lines.filter((l) => stores[l.storeId]?.local)].filter((g) => g.length);
    const orders = byMode.map((g) => placeOrder(momentId, g, payment));
    if (orders.length) {
      world.set((w) => ({
        moments: w.moments.map((x) =>
          x.id !== momentId ? x : { ...x, updates: [{ id: nowId('u'), label: `Checked out ${lines.length} thing${lines.length > 1 ? 's' : ''}`, at: stamp() }, ...x.updates] },
        ),
      }));
      orders.forEach((o) => pushMessage(momentId, { from: 'agent', text: o.mode === 'air' ? 'Order placed — we’re buying everything now.' : 'Keisha will collect the local pieces.', card: { kind: 'order', orderId: o.id } }));
    }
    return orders;
  },
  /** Invite someone to plan (or view), change what they can do, or remove them. */
  setRole(momentId: string, personId: string, role: PlanRole | null) {
    world.set((w) => ({
      moments: w.moments.map((m) => {
        if (m.id !== momentId) return m;
        const roles = { ...(m.roles ?? {}) };
        if (role) roles[personId] = role;
        else delete roles[personId];
        const people = role ? (m.people.includes(personId) ? m.people : [...m.people, personId]) : m.people.filter((p) => p !== personId);
        return { ...m, roles, people };
      }),
    }));
  },
  updateMoment(momentId: string, patch: Partial<Pick<Moment, 'title' | 'date' | 'time' | 'place' | 'guests' | 'budgetUsd'>>) {
    world.set((w) => ({
      moments: w.moments.map((m) => (m.id === momentId ? { ...m, ...patch, updates: [{ id: nowId('u'), label: 'You updated the details', at: stamp() }, ...m.updates] } : m)),
    }));
  },
  deleteMoment(momentId: string) {
    world.set((w) => ({ moments: w.moments.filter((m) => m.id !== momentId), tasks: w.tasks.filter((t) => t.momentId !== momentId) }));
  },
  addContact(c: Omit<Contact, 'id'>): string {
    const id = nowId('p');
    world.set((w) => ({ contacts: [...w.contacts, { ...c, id }] }));
    return id;
  },
  reset() {
    world.set({ ...seedWorld(), draftId: undefined });
  },
};

function itemTitle(momentId: string, itemId: string) {
  const m = world.get().moments.find((x) => x.id === momentId);
  return m?.items.find((i) => i.id === itemId)?.title.toLowerCase() ?? 'this';
}

// ---- selectors ------------------------------------------------------------------------------

/** Verbatim S2S `wantNeedsYou`: gold is only ever for the two states waiting on the customer. */
export const needsYou = (i: PlanItem) => i.state === 'options-ready' || i.state === 'quote-ready';
export const isSorted = (i: PlanItem) => i.state === 'selected' || i.state === 'order-linked' || i.state === 'closed';
export const isWorking = (i: PlanItem) => i.state === 'researching' || i.state === 'human-review';

export const stateLabel: Record<ItemState, string> = {
  researching: 'Searching',
  'human-review': 'With your S2S team',
  'options-ready': 'Ready to pick',
  'quote-ready': 'Quote ready',
  selected: 'Chosen',
  'order-linked': 'In your order',
  closed: 'Closed',
};

export const stateTone = (s: ItemState) =>
  s === 'options-ready' || s === 'quote-ready' ? 'gold' : s === 'selected' || s === 'order-linked' ? 'green' : s === 'closed' ? 'muted' : 'neutral';

export function progress(m: Moment) {
  const sorted = m.items.filter(isSorted).length;
  return { sorted, total: m.items.length, needs: m.items.filter(needsYou).length, ratio: m.items.length ? sorted / m.items.length : 0 };
}

export const momentById = (w: World, id: string) => w.moments.find((m) => m.id === id);

/** Picked but not yet ordered — what checkout will buy. */
export function readyToOrder(m: Moment) {
  return m.items
    .filter((i) => i.state === 'selected' && i.chosen?.length && i.options)
    .map((item) => ({ item, options: item.options!.filter((o) => item.chosen!.includes(o.id)) }));
}

export const orderById = (w: World, id: string) => w.orders.find((o) => o.id === id || `Order ${o.id}` === id);
export const ordersFor = (w: World, momentId: string) => w.orders.filter((o) => o.momentId === momentId);
export const threadFor = (w: World, momentId: string) => w.chats[momentId] ?? [];

export const upcoming = (w: World) => [...w.moments].sort((a, b) => a.date.localeCompare(b.date));

export function yourMove(w: World) {
  return upcoming(w).flatMap((m) => m.items.filter(needsYou).map((item) => ({ moment: m, item })));
}

export const tasksOn = (w: World, day: string) => w.tasks.filter((t) => !t.binned && t.due === day);

export const reviewTasks = (w: World) => {
  const end = ymd(new Date(today().getFullYear(), today().getMonth() + 1, 0));
  return w.tasks.filter((t) => t.id.startsWith('t-r') && !t.done && !t.binned && t.due <= end);
};

export const binned = (w: World) => w.tasks.filter((t) => t.binned);

/** Chosen / quoted / estimated spend (JMD), per budget category. */
export function spend(m: Moment) {
  const by: Record<string, number> = {};
  let committed = 0;
  let estimate = 0;
  for (const i of m.items) {
    let v = i.estimate;
    if (i.chosen?.length && i.options) v = i.options.filter((o) => i.chosen!.includes(o.id)).reduce((s, o) => s + o.landed, 0);
    else if (i.quote) v = i.quote.total;
    if (isSorted(i)) committed += v;
    estimate += v;
    by[i.category] = (by[i.category] ?? 0) + v;
  }
  return { by, committed, estimate };
}

export const daysUntil = (date: string) => Math.round((parseYmd(date).getTime() - parseYmd(ymd(today())).getTime()) / 86_400_000);
