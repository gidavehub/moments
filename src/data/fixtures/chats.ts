import { d } from '../clock';
import type { ChatMessage, Moment } from '../types';

/**
 * Seeded threads. The agent opens, hands off to a real person on the S2S team, and the
 * thread fills with walk-in photos, shortlists, quotes and order updates — the S2S
 * assistant-response blocks, as a conversation.
 */
export const seedChats: Record<string, ChatMessage[]> = {
  'ava-30th': [
    { id: 'a1', from: 'you', day: d(-3), time: '9:12 AM', text: 'Ava’s 30th — rooftop, 25 guests, Oct 17, up to US$800' },
    {
      id: 'a2',
      from: 'agent',
      day: d(-3),
      time: '9:12 AM',
      text: 'Love this. I’ve organised it into 9 things — the cake, the rooftop and the drinks need a person on the ground, so I’m bringing in your S2S team.',
    },
    { id: 'a3', from: 'team', personId: 'keisha', day: d(-3), time: '9:14 AM', handoff: 'team' },
    {
      id: 'a4',
      from: 'team',
      personId: 'keisha',
      day: d(-3),
      time: '9:15 AM',
      text: 'Hi Ava! Keisha here. I’ll taste the cakes and check the rooftop myself. Any flavours you love?',
    },
    { id: 'a5', from: 'you', day: d(-3), time: '9:20 AM', text: 'Rum cream if they do it! Nothing too sweet.' },
    {
      id: 'a6',
      from: 'team',
      personId: 'keisha',
      day: d(-1),
      time: '2:41 PM',
      text: 'Tasted this one at Sweetie in Half Way Tree — it holds up in the heat, and the gold drip matches your balloons.',
      card: { kind: 'photo', image: 'art:cake-gold-drip', caption: 'Sweetie Bakery · Half Way Tree' },
    },
    { id: 'a7', from: 'team', personId: 'keisha', day: d(-1), time: '2:43 PM', text: 'Three cakes shortlisted. My pick is the first one.', card: { kind: 'options', itemId: 'cake' } },
    {
      id: 'a8',
      from: 'agent',
      day: d(-1),
      time: '5:02 PM',
      text: 'The rooftop came back with an all-in quote, landed to Kingston.',
      card: { kind: 'quote', itemId: 'venue' },
    },
    {
      id: 'a9',
      from: 'team',
      personId: 'keisha',
      day: d(0),
      time: '8:05 AM',
      text: 'At PriceSmart Constant Spring for the drinks bar — members’ price on the sorrel is J$880 a bottle.',
      card: { kind: 'photo', image: 'art:drinks-bar', caption: 'PriceSmart · members-only floor' },
    },
    {
      id: 'a10',
      from: 'agent',
      day: d(0),
      time: '8:40 AM',
      text: 'Your favour boxes left our Miami warehouse this morning.',
      card: { kind: 'order', orderId: 'S2S-10496' },
      replies: ['Looks great!', 'When does the cake get locked?', 'Can we add a cake topper?'],
    },
  ],
};

/** A fresh thread for moments without a seeded one. */
export function starterThread(m: Moment): ChatMessage[] {
  const day = d(0);
  return [
    {
      id: `${m.id}-s1`,
      from: 'agent',
      day,
      time: '9:00 AM',
      text: `I’ve set up ${m.title} — ${m.items.length} things so far. Ask me anything, or say the word and a person on your S2S team takes over.`,
    },
    { id: `${m.id}-s2`, from: 'team', personId: 'keisha', day, time: '9:01 AM', handoff: 'team' },
    {
      id: `${m.id}-s3`,
      from: 'team',
      personId: 'keisha',
      day,
      time: '9:02 AM',
      text: 'Hi! Keisha from your S2S team. I’ll handle anything that needs a walk-in. What matters most to you for this one?',
      replies: ['Keep it under budget', 'Quality over price', 'It needs to arrive early'],
    },
  ];
}

/**
 * Scripted replies, matched on keywords. UI-only: this is what a reply *looks* like, not a model.
 * `from` is who answers — the agent handles lookups, Keisha handles anything on the ground.
 */
export const scriptedReplies: { match: RegExp; from: 'agent' | 'team'; text: string; replies?: string[] }[] = [
  {
    match: /arriv|deliver|when|ship|track/i,
    from: 'agent',
    text: 'Everything by air lands in Kingston 6–8 days after you check out. Order by Oct 7 and it’s at your door with two days to spare.',
    replies: ['Check out now', 'What about local items?'],
  },
  {
    match: /cake|topper|flavou?r|sweet|sugar/i,
    from: 'team',
    text: 'Noted! I’ll ask Sweetie for a lighter rum cream and a gold “30” topper — I’ll send you a photo before anything’s locked.',
    replies: ['Perfect, thank you', 'How much extra?'],
  },
  {
    match: /cheap|budget|price|cost|less|save/i,
    from: 'agent',
    text: 'You’re J$41k under your landed budget right now. The fastest saving is the lounge seating — renting in Half Way Tree beats shipping by about J$9k.',
    replies: ['Do that', 'Keep it as is'],
  },
  {
    match: /thank|great|perfect|love|nice/i,
    from: 'team',
    text: 'Anytime! I’ll keep you posted here — you’ll see photos as I go.',
  },
];

export const fallbackReply = {
  from: 'team' as const,
  text: 'Got it — I’ll look into that and come back to you here within the hour.',
  replies: ['Thanks, Keisha', 'No rush'],
};
