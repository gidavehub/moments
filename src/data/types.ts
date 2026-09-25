/**
 * The Moments data model — a planning-shaped port of shop2ship-ui `request-types.ts`.
 * A Moment is an S2S request with a date: its plan items are S2S "wants", sourced by the
 * agent (live stores) or a person on your S2S team (sourced stores), priced landed.
 */

import type { ShapeId } from '@/components/brand/particles/shapes';
import type { CastName } from '@/components/mascot/cast';
import type { TintName } from '@/theme/palette';

export type MomentKind = 'birthday' | 'babyShower' | 'wedding' | 'holiday' | 'dinner' | 'trip' | 'gift' | 'home';

/** Where the moment is in its life — drives the stage rail. */
export type Stage = 'planned' | 'onIt' | 'choosing' | 'booked' | 'arriving' | 'theDay' | 'done';

/** Verbatim S2S want states. */
export type ItemState = 'researching' | 'human-review' | 'options-ready' | 'quote-ready' | 'selected' | 'order-linked' | 'closed';

/** indexed = we hold it (instant) · live = queried now · sourced = a person gets it (hours). */
export type Coverage = 'indexed' | 'live' | 'sourced';

export type Destination = 'JM' | 'TT' | 'GM' | 'GH';

export type ItemIcon =
  | 'decor'
  | 'cake'
  | 'venue'
  | 'rentals'
  | 'invites'
  | 'food'
  | 'favours'
  | 'photo'
  | 'gift'
  | 'games'
  | 'music'
  | 'outfit'
  | 'flowers'
  | 'drinks'
  | 'barrel';

export type BudgetCategory = 'decor' | 'food' | 'cake' | 'venue' | 'people' | 'gifts' | 'other';

export interface Store {
  id: string;
  name: string;
  coverage: Coverage;
  turnaround: string;
  /** Key into the logo registry, if we have one. */
  logo?: 'amazon' | 'walmart' | 'ebay' | 'shein' | 'temu' | 'aliexpress' | 'target' | 'bestbuy';
  membersOnly?: boolean;
  local?: boolean;
  area?: string;
}

export interface Person {
  id: string;
  name: string;
  short: string;
  relation?: string;
  photo?: number;
  tint?: TintName;
  /** Recurring date as MM-DD. */
  birthday?: string;
  team?: boolean;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Option {
  id: string;
  title: string;
  storeId: string;
  /** Landed price in JMD (item + shipping + duty + fees). */
  landed: number;
  /** Shelf price in USD at the store. */
  shelfUsd: number;
  image?: string | number;
  rating?: number;
  reviews?: string;
  topPick?: boolean;
  specs?: Spec[];
  eta: string;
  mode: 'air' | 'sea' | 'local';
  description?: string;
}

export interface QuoteLine {
  title: string;
  qty: number;
  amount: number;
  storeId: string;
}

export interface Quote {
  status: 'requested' | 'ready' | 'accepted' | 'expired';
  lines: QuoteLine[];
  sourceSubtotal: number;
  shipping: number;
  importCosts: number;
  serviceFee: number;
  total: number;
  /** Alternative if shipped by sea. */
  sea?: { total: number; eta: string };
  airEta: string;
  holdsUntil: string;
}

export interface PlanItem {
  id: string;
  title: string;
  icon: ItemIcon;
  state: ItemState;
  status: string;
  chips: string[];
  category: BudgetCategory;
  /** Planning estimate (JMD) before anything is chosen. */
  estimate: number;
  selection?: 'single' | 'multiple';
  options?: Option[];
  totalResults?: number;
  chosen?: string[];
  quote?: Quote;
  workingNote?: string;
  sourcedBy?: { personId: string; storeId: string };
  linkedOrder?: string;
}

export type TaskKind = 'order' | 'invite' | 'delivery' | 'setup' | 'reminder' | 'pickup' | 'call';

export interface TimelineTask {
  id: string;
  momentId: string;
  title: string;
  /** YYYY-MM-DD */
  due: string;
  kind: TaskKind;
  done: boolean;
  itemId?: string;
  place?: string;
  time?: string;
  snoozedUntil?: string;
  binned?: boolean;
}

export interface Update {
  id: string;
  label: string;
  at: string;
  who?: string;
}

export interface Moment {
  id: string;
  title: string;
  kind: MomentKind;
  /** YYYY-MM-DD */
  date: string;
  time?: string;
  place: string;
  city: string;
  destination: Destination;
  guests?: number;
  budgetUsd: number;
  preferences?: string;
  /** Overrides the kind label on cards (e.g. a game night is a "Get-together", not a "Dinner"). */
  occasion?: string;
  cover: string;
  cast: CastName;
  stage: Stage;
  items: PlanItem[];
  people: string[];
  updates: Update[];
  origin: 'Moments' | 'WhatsApp' | 'ChatGPT' | 'Web';
  recurring?: boolean;
  /** What each invited person can do (the owner is implied). */
  roles?: Record<string, PlanRole>;
}

export type PlanRole = 'co-planner' | 'viewer';

// ---- Conversation with the agent + your S2S team (S2S assistant response blocks) -------------

export type ChatFrom = 'you' | 'agent' | 'team';

/** Rich cards the thread can carry — ports of S2S `quote_preview`, `order_status`, etc. */
export type ChatCard =
  | { kind: 'photo'; image: string; caption?: string }
  | { kind: 'options'; itemId: string }
  | { kind: 'quote'; itemId: string }
  | { kind: 'order'; orderId: string }
  | { kind: 'item'; itemId: string };

export interface ChatMessage {
  id: string;
  from: ChatFrom;
  personId?: string;
  /** YYYY-MM-DD */
  day: string;
  time: string;
  text?: string;
  card?: ChatCard;
  /** A handoff divider (S2S `handoff_state`) instead of a bubble. */
  handoff?: 'agent' | 'team';
  /** Quick replies offered after this message (S2S `clarification.suggestions`). */
  replies?: string[];
}

// ---- Orders (checkout → S2S fulfillment timeline) ----------------------------------------------

export type OrderStage = 'placed' | 'bought' | 'warehouse' | 'flight' | 'customs' | 'out' | 'delivered';

export interface OrderLine {
  itemId: string;
  title: string;
  storeId: string;
  qty: number;
  landed: number;
  image?: string | number;
}

export interface Order {
  id: string;
  momentId: string;
  /** YYYY-MM-DD */
  placed: string;
  /** Air freight via the Miami warehouse, or sourced locally and driven over. */
  mode: 'air' | 'local';
  lines: OrderLine[];
  total: number;
  stage: OrderStage;
  /** YYYY-MM-DD */
  eta: string;
  payment: PaymentId;
  courierId?: string;
  /** When each stage happened, newest last. */
  log: { stage: OrderStage; at: string; note?: string }[];
}

export type PaymentId = 'visa' | 'mastercard' | 'amex' | 'paypal' | 'wave';

/** Someone you added yourself (on top of the seeded people). */
export interface Contact {
  id: string;
  name: string;
  relation: string;
  /** MM-DD */
  birthday?: string;
  remind: number;
}

export interface Idea {
  slug: string;
  title: string;
  kind: MomentKind;
  blurb: string;
  fromJmd: number;
  guests?: number;
  art: string;
  included: { icon: ItemIcon; label: string }[];
  timeline: { days: number; label: string }[];
  tag?: string;
}

export interface AgentStep {
  id: string;
  label: string;
  done: string;
  chips: string[];
  shape: ShapeId;
  ms: number;
  sourced?: { personId: string; storeId: string; note: string };
}
