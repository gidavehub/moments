import { d } from '../clock';
import type { Moment, Option, PlanItem, TimelineTask } from '../types';

/** Retailer product shots reused from shop2ship-ui/src/requests/request-story-fixtures.ts. */
const img = {
  babyShowerDecor:
    'https://i5.walmartimages.com/seo/Safari-Baby-Shower-Decorations-Decorations-All-in-One-Set-for-30-Guests-VT1_17a66956-0875-4869-ae0b-81417b7b3811.0f53fbbb80bfa870e09f648a74c6fb63.jpeg?odnHeight=600&odnWidth=600&odnBg=FFFFFF',
  babyShowerDecorAmazon: 'https://m.media-amazon.com/images/I/81eqD41RwsL._AC_SL1000_.jpg',
  babyShowerDecorVariant:
    'https://i5.walmartimages.com/seo/Safari-Baby-Shower-Decorations-Decorations-All-in-One-Set-for-30-Guests-VT04_17a66956-0875-4869-ae0b-81417b7b3811.0f53fbbb80bfa870e09f648a74c6fb63.jpeg?odnHeight=600&odnWidth=600&odnBg=FFFFFF',
  cakeVanilla:
    'https://i5.walmartimages.com/seo/Freshness-Guaranteed-Celebration-Vanilla-Cake-Vanilla-Icing-26-8-oz-Refrigerated_36928137-23a1-4123-8175-58b5e1f338fd.abe1ae1a86a2512f28c1c943cedc6e5f.jpeg?odnHeight=600&odnWidth=600&odnBg=FFFFFF',
  cakeSheet:
    'https://i5.walmartimages.com/seo/Freshness-Guaranteed-Fully-Customizable-Sheet-Cake_7c618d63-bc80-4041-a50c-370ca0eb5cd6_1.10228aa29739e79463677cd32aabaa16.jpeg?odnHeight=600&odnWidth=600&odnBg=FFFFFF',
  cakeVariety:
    'https://i5.walmartimages.com/seo/Freshness-Guaranteed-8-Variety-Cake-44oz-Refrigerated_05357156-83fd-442b-b9d2-b3c374ab106f.efd6307b2e08bc3172329017e28d93a0.jpeg?odnHeight=600&odnWidth=600&odnBg=FFFFFF',
  buttermints:
    'https://i5.walmartimages.com/seo/Party-Sweets-It-s-A-Girl-Buttermints-14-Oz_e634e60a-b16f-47bd-9f4a-68f1cd143b65.cb0b7ee7470f433779bebb96e3f3f2ca.png?odnHeight=600&odnWidth=600&odnBg=FFFFFF',
};

/** AI product shots (generated into assets/art/products by scripts/gen-art.mjs). */
const art = (key: string) => `art:${key}`;

const opt = (o: Option) => o;

// ============================================================================================
// Ava's 30th — the hero moment
// ============================================================================================

const avaItems: PlanItem[] = [
  {
    id: 'decor',
    title: 'Gold and cream balloon garland',
    icon: 'decor',
    state: 'options-ready',
    status: 'Ready to pick',
    chips: ['Gold and cream', 'Rooftop', '25 guests'],
    category: 'decor',
    estimate: 16000,
    selection: 'multiple',
    totalResults: 38,
    options: [
      opt({ id: 'd1', title: 'Gold and cream balloon arch kit, 142 pieces, with garland strip', storeId: 'amazon', landed: 4880, shelfUsd: 19.99, image: art('balloon-arch'), rating: 4.7, reviews: '3,120', topPick: true, eta: '6–8 days by air', mode: 'air', specs: [{ label: 'Pieces', value: '142' }, { label: 'Palette', value: 'Gold, cream, champagne' }, { label: 'Setup', value: 'No tools' }], description: 'The full arch for a rooftop doorway, with a garland strip and glue dots. Champagne and cream lean warmer than the pure-white kits, which photographs better at golden hour.' }),
      opt({ id: 'd2', title: 'Gold foil number balloons "3" and "0", 40 inch', storeId: 'walmart', landed: 2140, shelfUsd: 7.48, image: art('number-balloons'), rating: 4.6, reviews: '980', eta: '6–8 days by air', mode: 'air', specs: [{ label: 'Size', value: '40 inch' }, { label: 'Fill', value: 'Air or helium' }] }),
      opt({ id: 'd3', title: 'Warm white LED fairy-light curtain, 3 × 3 m', storeId: 'shein', landed: 3260, shelfUsd: 11.2, image: art('fairy-lights'), rating: 4.4, reviews: '1,540', eta: 'Sourced within the day', mode: 'air', description: 'SHEIN can’t be searched live, so Keisha grabbed this one for you.' }),
      opt({ id: 'd4', title: 'Gold confetti and table runner set for 6 tables', storeId: 'amazon', landed: 1190, shelfUsd: 3.99, image: art('table-confetti'), rating: 4.5, reviews: '612', eta: '6–8 days by air', mode: 'air' }),
    ],
  },
  {
    id: 'cake',
    title: 'Two-tier birthday cake',
    icon: 'cake',
    state: 'options-ready',
    status: 'Ready to pick',
    chips: ['Serves 30', 'Gold drip'],
    category: 'cake',
    estimate: 14000,
    selection: 'single',
    totalResults: 26,
    sourcedBy: { personId: 'keisha', storeId: 'sweetie' },
    options: [
      opt({ id: 'c1', title: 'Vanilla rum-cream, gold drip, two tiers, serves 30', storeId: 'sweetie', landed: 14500, shelfUsd: 92, image: art('cake-gold-drip'), rating: 4.9, reviews: '214', topPick: true, eta: 'Picked up Oct 17, 2pm', mode: 'local', specs: [{ label: 'Serves', value: '30' }, { label: 'Flavour', value: 'Vanilla rum cream' }, { label: 'Order by', value: 'Oct 10' }], description: 'Keisha tasted three bakeries in Half Way Tree. This one holds up in the heat and the gold drip matches your balloons.' }),
      opt({ id: 'c2', title: 'Freshness Guaranteed Celebration Vanilla Cake, 26.8 oz', storeId: 'walmart', landed: 3650, shelfUsd: 12.98, image: img.cakeVanilla, rating: 4.1, reviews: '2,441', eta: '7–10 days, chilled', mode: 'air' }),
      opt({ id: 'c3', title: 'Black forest with sorrel glaze, 10 inch', storeId: 'devonHouse', landed: 11800, shelfUsd: 75, image: art('cake-sorrel'), rating: 4.8, reviews: '96', eta: 'Picked up Oct 17', mode: 'local' }),
    ],
  },
  {
    id: 'venue',
    title: 'Rooftop space, 7–11 pm',
    icon: 'venue',
    state: 'quote-ready',
    status: 'Quote ready',
    chips: ['New Kingston', '4 hours', '25 guests'],
    category: 'venue',
    estimate: 60000,
    sourcedBy: { personId: 'keisha', storeId: 'devonHouse' },
    quote: {
      status: 'ready',
      lines: [
        { title: 'Skyline rooftop hire, 4 hours', qty: 1, amount: 58000, storeId: 'devonHouse' },
        { title: 'Evening lighting package', qty: 1, amount: 4500, storeId: 'devonHouse' },
      ],
      sourceSubtotal: 62500,
      shipping: 0,
      importCosts: 0,
      serviceFee: 3800,
      total: 66300,
      airEta: 'Held for Oct 17',
      holdsUntil: d(9),
    },
  },
  {
    id: 'rentals',
    title: 'Lounge seating and cocktail tables',
    icon: 'rentals',
    state: 'human-review',
    status: 'With your S2S team',
    chips: ['6 high tables', '3 lounge sets'],
    category: 'venue',
    estimate: 18000,
    workingNote: 'Keisha is checking 3 rental houses in Half Way Tree',
    sourcedBy: { personId: 'keisha', storeId: 'hwtRentals' },
  },
  {
    id: 'drinks',
    title: 'Sorrel punch and mocktail bar',
    icon: 'drinks',
    state: 'researching',
    status: 'Searching',
    chips: ['25 guests', 'Rum punch + zero-proof'],
    category: 'food',
    estimate: 22000,
    workingNote: 'Scouting PriceSmart and two caterers',
  },
  {
    id: 'invites',
    title: 'Digital invitations',
    icon: 'invites',
    state: 'selected',
    status: 'Chosen',
    chips: ['25 guests', 'WhatsApp + email'],
    category: 'other',
    estimate: 2500,
    chosen: ['i1'],
    options: [opt({ id: 'i1', title: 'Gold foil evening invite, animated', storeId: 'amazon', landed: 2500, shelfUsd: 9, image: art('invite-gold'), eta: 'Instant', mode: 'local', topPick: true })],
  },
  {
    id: 'photo',
    title: 'Photographer, 3 hours',
    icon: 'photo',
    state: 'human-review',
    status: 'With your S2S team',
    chips: ['Golden hour', 'Edited in 48h'],
    category: 'people',
    estimate: 25000,
    workingNote: 'Keisha has two photographers holding Oct 17',
    sourcedBy: { personId: 'keisha', storeId: 'studio7' },
  },
  {
    id: 'favours',
    title: 'Gold favour boxes',
    icon: 'favours',
    state: 'order-linked',
    status: 'In your order',
    chips: ['Qty 25', 'Under US$4 each'],
    category: 'gifts',
    estimate: 7800,
    linkedOrder: 'Order S2S-10496',
  },
  {
    id: 'music',
    title: 'DJ or playlist and speaker',
    icon: 'music',
    state: 'researching',
    status: 'Searching',
    chips: ['4 hours', 'Dancehall + Afrobeats'],
    category: 'people',
    estimate: 15000,
  },
];

// ============================================================================================
// Garden baby shower — ported from S2S `eventPlanningRequest`
// ============================================================================================

const showerItems: PlanItem[] = [
  {
    id: 'decor',
    title: 'Decorations and tableware',
    icon: 'decor',
    state: 'options-ready',
    status: 'Ready to pick',
    chips: ['30 guests', 'Sage and cream'],
    category: 'decor',
    estimate: 24000,
    selection: 'multiple',
    totalResults: 41,
    options: [
      opt({ id: 'sd1', title: 'Safari Baby Shower Decorations, All-in-One Set for 30 Guests VT1', storeId: 'walmart', landed: 13849, shelfUsd: 54.99, image: img.babyShowerDecor, topPick: true, eta: '7–10 days by air', mode: 'air', specs: [{ label: 'Guests', value: '30' }, { label: 'Pieces', value: '148' }, { label: 'Palette', value: 'Sage and cream' }, { label: 'Setup', value: 'No tools' }], description: 'The full set for thirty: backdrop, balloon arch, table cover, banner, cupcake stand and matching tableware. Sage and cream throughout, and everything in one carton so nothing arrives on a different day.' }),
      opt({ id: 'sd2', title: 'Safari Baby Shower Decorations, All-in-One Set for 30 Guests VT04', storeId: 'walmart', landed: 13849, shelfUsd: 54.99, image: img.babyShowerDecorVariant, eta: '7–10 days by air', mode: 'air', description: 'The same set in the VT04 colourway, which leans warmer and drops the balloon arch for a larger backdrop.' }),
      opt({ id: 'sd3', title: 'Safari Baby Shower Decorations for 30 | Easy setup, tableware, backdrop, banner', storeId: 'amazon', landed: 5539, shelfUsd: 21.99, image: img.babyShowerDecorAmazon, rating: 4.7, reviews: '350', eta: '3 days to Miami, 7 to you', mode: 'air', description: 'The cheapest way to cover the table. Thinner card on the centrepieces than the Walmart sets, but the palette matches and it ships in three days.' }),
      opt({ id: 'sd4', title: 'Safari Baby Shower Tableware Bundle for 30 Guests, Sage', storeId: 'walmart', landed: 4928, shelfUsd: 19.5, image: img.babyShowerDecor, rating: 4.5, reviews: '612', eta: '7–10 days by air', mode: 'air' }),
      opt({ id: 'sd5', title: 'Sage Green Balloon Arch Kit, 120 Pieces', storeId: 'amazon', landed: 3098, shelfUsd: 12.3, image: img.babyShowerDecorAmazon, rating: 4.6, reviews: '2,180', eta: '7 days by air', mode: 'air' }),
      opt({ id: 'sd6', title: 'Cream Muslin Backdrop with Wooden Arch Frame, 7 ft', storeId: 'amazon', landed: 8412, shelfUsd: 33.4, image: img.babyShowerDecorAmazon, rating: 4.8, reviews: '1,047', eta: '7 days by air', mode: 'air' }),
    ],
  },
  {
    id: 'venue',
    title: 'Garden venue or hosting setup',
    icon: 'venue',
    state: 'human-review',
    status: 'With your S2S team',
    chips: ['Hope Gardens', '30 guests', 'Afternoon'],
    category: 'venue',
    estimate: 45000,
    workingNote: 'Keisha is checking the pavilion at Hope Gardens',
    sourcedBy: { personId: 'keisha', storeId: 'devonHouse' },
  },
  {
    id: 'chairs',
    title: 'Chair and table rentals',
    icon: 'rentals',
    state: 'quote-ready',
    status: 'Quote ready',
    chips: ['30 chairs', '5 tables'],
    category: 'venue',
    estimate: 18000,
    sourcedBy: { personId: 'keisha', storeId: 'hwtRentals' },
    quote: {
      status: 'ready',
      lines: [
        { title: 'White folding chairs', qty: 30, amount: 10500, storeId: 'hwtRentals' },
        { title: 'Round tables with linen', qty: 5, amount: 6250, storeId: 'hwtRentals' },
      ],
      sourceSubtotal: 16750,
      shipping: 1650,
      importCosts: 0,
      serviceFee: 1150,
      total: 19550,
      airEta: 'Delivered Nov 7, 10am',
      holdsUntil: d(12),
    },
  },
  {
    id: 'favours',
    title: 'Guest favours',
    icon: 'favours',
    state: 'researching',
    status: 'Searching',
    chips: ['Qty 30', 'Under US$4 each'],
    category: 'gifts',
    estimate: 12000,
  },
  {
    id: 'invitations',
    title: 'Invitations for 30 guests',
    icon: 'invites',
    state: 'human-review',
    status: 'With your S2S team',
    chips: ['Qty 30', 'Digital and printed'],
    category: 'other',
    estimate: 6000,
  },
  {
    id: 'food',
    title: 'Food and drinks for 30 guests',
    icon: 'food',
    state: 'options-ready',
    status: 'Ready to pick',
    chips: ['30 guests', 'Non-alcoholic'],
    category: 'food',
    estimate: 52000,
    selection: 'multiple',
    totalResults: 181,
    options: [
      opt({ id: 'sf1', title: "Party Sweets It's A Girl Buttermints, 14 oz", storeId: 'walmart', landed: 1149, shelfUsd: 4.47, image: img.buttermints, rating: 4.7, reviews: '105', topPick: true, eta: '7–10 days by air', mode: 'air' }),
      opt({ id: 'sf2', title: 'Finger sandwiches and patties for 30, from a Liguanea caterer', storeId: 'pricesmart', landed: 38500, shelfUsd: 245, image: art('patties-platter'), rating: 4.8, reviews: '61', eta: 'Delivered Nov 7, 1pm', mode: 'local' }),
      opt({ id: 'sf3', title: 'Sorrel, ginger beer and coconut water bar for 30', storeId: 'pricesmart', landed: 9800, shelfUsd: 62, image: art('drinks-bar'), eta: 'Delivered Nov 7, 1pm', mode: 'local' }),
    ],
  },
  {
    id: 'cake',
    title: 'Cake or dessert',
    icon: 'cake',
    state: 'options-ready',
    status: 'Ready to pick',
    chips: ['Serves 30', 'Sage and cream'],
    category: 'cake',
    estimate: 12000,
    selection: 'single',
    totalResults: 26,
    options: [
      opt({ id: 'sc1', title: 'Freshness Guaranteed Celebration Vanilla Cake, Vanilla Icing, 26.8 oz', storeId: 'walmart', landed: 2318, shelfUsd: 12.98, image: img.cakeVanilla, rating: 4.1, reviews: '2,441', topPick: true, eta: '7–10 days, chilled', mode: 'air' }),
      opt({ id: 'sc2', title: 'Freshness Guaranteed Fully Customizable Sheet Cake', storeId: 'walmart', landed: 1580, shelfUsd: 8.98, image: img.cakeSheet, rating: 4.2, reviews: '9,316', eta: '7–10 days, chilled', mode: 'air' }),
      opt({ id: 'sc3', title: 'Freshness Guaranteed 8-Inch Variety Cake, 44 oz', storeId: 'walmart', landed: 2508, shelfUsd: 13.98, image: img.cakeVariety, rating: 4.1, reviews: '2,599', eta: '7–10 days, chilled', mode: 'air' }),
    ],
  },
  {
    id: 'games',
    title: 'Games and shower activities',
    icon: 'games',
    state: 'human-review',
    status: 'With your S2S team',
    chips: ['30 guests', 'Mixed ages'],
    category: 'other',
    estimate: 4000,
  },
  {
    id: 'photography',
    title: 'Photographer or photo booth',
    icon: 'photo',
    state: 'human-review',
    status: 'With your S2S team',
    chips: ['Kingston', '3 hours'],
    category: 'people',
    estimate: 22000,
    sourcedBy: { personId: 'keisha', storeId: 'studio7' },
  },
  {
    id: 'thank-you',
    title: 'Thank-you gifts for hosts',
    icon: 'gift',
    state: 'researching',
    status: 'Searching',
    chips: ['Qty 3', 'Under US$35 each'],
    category: 'gifts',
    estimate: 15000,
  },
];

// ============================================================================================
// Mom's birthday gift
// ============================================================================================

const momItems: PlanItem[] = [
  {
    id: 'gift',
    title: 'A gift Mom will actually use',
    icon: 'gift',
    state: 'options-ready',
    status: 'Ready to pick',
    chips: ['Up to US$150', 'Loves gardening'],
    category: 'gifts',
    estimate: 18000,
    selection: 'single',
    totalResults: 64,
    options: [
      opt({ id: 'g1', title: 'Spa morning for two, Mandeville, with lunch', storeId: 'devonHouse', landed: 16500, shelfUsd: 105, image: art('spa-voucher'), rating: 4.9, reviews: '88', topPick: true, eta: 'Voucher delivered Oct 2', mode: 'local', description: 'Keisha called ahead — they can print the voucher with your message and deliver it with the flowers.' }),
      opt({ id: 'g2', title: 'Rose-gold charm bracelet with hibiscus charm', storeId: 'amazon', landed: 9850, shelfUsd: 48, image: art('bracelet'), rating: 4.6, reviews: '4,210', eta: '6–8 days by air', mode: 'air' }),
      opt({ id: 'g3', title: 'Ergonomic garden tool set in a canvas tote', storeId: 'walmart', landed: 7420, shelfUsd: 34.97, image: art('garden-tools'), rating: 4.7, reviews: '1,302', eta: '6–8 days by air', mode: 'air' }),
      opt({ id: 'g4', title: 'Personalised photo book, 40 pages', storeId: 'amazon', landed: 6200, shelfUsd: 29.99, image: art('photo-book'), rating: 4.5, reviews: '720', eta: '8 days by air', mode: 'air' }),
    ],
  },
  {
    id: 'flowers',
    title: 'Flowers delivered, morning of Oct 3',
    icon: 'flowers',
    state: 'quote-ready',
    status: 'Quote ready',
    chips: ['Mandeville', 'Before 10am'],
    category: 'gifts',
    estimate: 6000,
    quote: {
      status: 'ready',
      lines: [{ title: 'Anthuriums and ginger lilies, hand-tied', qty: 1, amount: 5200, storeId: 'devonHouse' }],
      sourceSubtotal: 5200,
      shipping: 900,
      importCosts: 0,
      serviceFee: 450,
      total: 6550,
      airEta: 'Oct 3, 9–10am',
      holdsUntil: d(6),
    },
  },
];

// ============================================================================================
// Friendsgiving and Christmas
// ============================================================================================

const friendsgivingItems: PlanItem[] = [
  { id: 'ham', title: 'Glazed ham and a turkey crown', icon: 'food', state: 'researching', status: 'Searching', chips: ['12 guests', 'PriceSmart'], category: 'food', estimate: 28000, workingNote: 'Members-only — Keisha will walk it', sourcedBy: { personId: 'keisha', storeId: 'pricesmart' } },
  { id: 'sides', title: 'Sides: rice and peas, mac pie, festival', icon: 'food', state: 'researching', status: 'Searching', chips: ['12 guests'], category: 'food', estimate: 14000 },
  { id: 'table', title: 'Autumn table setting for 12', icon: 'decor', state: 'researching', status: 'Searching', chips: ['Burnt orange', 'Candles'], category: 'decor', estimate: 9000 },
  { id: 'pie', title: 'Sweet potato pudding and pumpkin pie', icon: 'cake', state: 'researching', status: 'Searching', chips: ['Serves 12'], category: 'cake', estimate: 6000 },
];

const christmasItems: PlanItem[] = [
  { id: 'barrel', title: 'Christmas barrel from Brooklyn', icon: 'barrel', state: 'human-review', status: 'With your S2S team', chips: ['55 gallon', 'Customs cleared'], category: 'gifts', estimate: 60000, workingNote: 'Packing list shared with Aunt June', sourcedBy: { personId: 'keisha', storeId: 'walmart' } },
  { id: 'ham', title: 'Christmas ham and sorrel', icon: 'food', state: 'researching', status: 'Searching', chips: ['18 guests'], category: 'food', estimate: 30000 },
  { id: 'kids', title: 'Gifts for 8 cousins, ages 4–15', icon: 'gift', state: 'researching', status: 'Searching', chips: ['Up to US$25 each'], category: 'gifts', estimate: 31000 },
  { id: 'decor', title: 'Tree, lights and a gold star', icon: 'decor', state: 'researching', status: 'Searching', chips: ['Montego Bay'], category: 'decor', estimate: 12000 },
];

// ============================================================================================

export const seedMoments: Moment[] = [
  {
    id: 'ava-30th',
    title: 'Ava’s 30th',
    kind: 'birthday',
    date: d(24),
    time: '7:00 PM',
    place: 'Skyline rooftop, New Kingston',
    city: 'Kingston',
    destination: 'JM',
    guests: 25,
    budgetUsd: 800,
    preferences: 'Gold and cream · rooftop · golden hour',
    cover: 'cover-rooftop-30th',
    cast: 'tiers',
    stage: 'choosing',
    items: avaItems,
    people: ['ava', 'jordan', 'tia'],
    origin: 'Moments',
    updates: [
      { id: 'u5', label: 'Rooftop quote ready — held until Oct 2', at: 'Today, 8:40 AM', who: 'keisha' },
      { id: 'u4', label: 'Keisha tasted cakes at 3 bakeries in Half Way Tree', at: 'Yesterday, 4:12 PM', who: 'keisha' },
      { id: 'u3', label: 'Favour boxes moved to your order', at: 'Sep 21, 11:05 AM' },
      { id: 'u2', label: 'Plan organised into 9 things', at: 'Sep 20, 7:31 PM' },
      { id: 'u1', label: 'Moment created', at: 'Sep 20, 7:30 PM' },
    ],
  },
  {
    id: 'mom-birthday',
    title: 'Mom’s birthday',
    kind: 'gift',
    date: d(10),
    time: 'All day',
    place: 'Mom’s place, Mandeville',
    city: 'Mandeville',
    destination: 'JM',
    budgetUsd: 150,
    preferences: 'Loves gardening · no perfume',
    cover: 'cover-mom-gift',
    cast: 'mo',
    stage: 'choosing',
    items: momItems,
    people: ['ava', 'pearl'],
    origin: 'Moments',
    recurring: true,
    updates: [
      { id: 'u2', label: '4 gift ideas ready for you', at: 'Today, 7:55 AM', who: 'keisha' },
      { id: 'u1', label: 'Reminder: Mom’s birthday is in two weeks', at: 'Sep 19, 9:00 AM' },
    ],
  },
  {
    id: 'garden-shower',
    title: 'Shanice’s garden baby shower',
    kind: 'babyShower',
    date: d(45),
    time: '2:00 PM',
    place: 'Hope Gardens pavilion',
    city: 'Kingston',
    destination: 'JM',
    guests: 30,
    budgetUsd: 1800,
    preferences: 'Garden setting · sage and cream · 30 guests',
    cover: 'cover-garden-shower',
    cast: 'bloop',
    stage: 'onIt',
    items: showerItems,
    people: ['ava', 'shanice', 'tia'],
    origin: 'ChatGPT',
    updates: [
      { id: 'u4', label: 'Options ready for decorations and tableware', at: 'Today, 11:16 AM' },
      { id: 'u3', label: 'Your S2S team started reviewing local rentals', at: 'Today, 10:54 AM', who: 'keisha' },
      { id: 'u2', label: 'Request organised into 10 things', at: 'Sep 18, 5:10 PM' },
      { id: 'u1', label: 'Request submitted from ChatGPT', at: 'Sep 18, 5:07 PM' },
    ],
  },
  {
    id: 'friendsgiving',
    title: 'Friendsgiving at Jordan’s',
    kind: 'dinner',
    date: d(59),
    time: '5:00 PM',
    place: 'Jordan’s place, Barbican',
    city: 'Kingston',
    destination: 'JM',
    guests: 12,
    budgetUsd: 400,
    preferences: 'Jamaican-American fusion · candles',
    cover: 'cover-friendsgiving',
    cast: 'pip',
    stage: 'planned',
    items: friendsgivingItems,
    people: ['ava', 'jordan', 'nia', 'dre'],
    origin: 'WhatsApp',
    updates: [{ id: 'u1', label: 'Moment created from WhatsApp', at: 'Sep 22, 8:14 PM' }],
  },
  {
    id: 'christmas-mobay',
    title: 'Christmas in Montego Bay',
    kind: 'holiday',
    date: d(92),
    time: 'Dec 24–26',
    place: 'Grandma’s house, Montego Bay',
    city: 'Montego Bay',
    destination: 'JM',
    guests: 18,
    budgetUsd: 1200,
    preferences: 'Barrel from Brooklyn · family of 18',
    cover: 'cover-christmas',
    cast: 'dot',
    stage: 'planned',
    items: christmasItems,
    people: ['ava', 'pearl', 'winston', 'shanice', 'dre'],
    origin: 'Moments',
    updates: [{ id: 'u1', label: 'Moment created', at: 'Sep 15, 6:02 PM' }],
  },
];

// ============================================================================================
// Countdown timelines (worked back from each day)
// ============================================================================================

export const seedTasks: TimelineTask[] = [
  // Ava's 30th
  { id: 't-a1', momentId: 'ava-30th', title: 'Guest list and budget agreed', due: d(-3), kind: 'call', done: true },
  { id: 't-a2', momentId: 'ava-30th', title: 'Invites go out on WhatsApp', due: d(-1), kind: 'invite', done: true, itemId: 'invites' },
  { id: 't-a3', momentId: 'ava-30th', title: 'Pick a cake', due: d(0), kind: 'order', done: false, itemId: 'cake', time: 'Today' },
  { id: 't-a4', momentId: 'ava-30th', title: 'Approve the rooftop quote', due: d(1), kind: 'order', done: false, itemId: 'venue' },
  { id: 't-a5', momentId: 'ava-30th', title: 'Choose balloons and lights', due: d(3), kind: 'order', done: false, itemId: 'decor' },
  { id: 't-a6', momentId: 'ava-30th', title: 'Decor ships from Amazon, by air', due: d(10), kind: 'delivery', done: false, itemId: 'decor' },
  { id: 't-a7', momentId: 'ava-30th', title: 'Cake order locked at Sweetie', due: d(17), kind: 'order', done: false, itemId: 'cake', place: 'Half Way Tree' },
  { id: 't-a8', momentId: 'ava-30th', title: 'Decor lands in Kingston', due: d(18), kind: 'delivery', done: false, place: 'S2S Kingston hub' },
  { id: 't-a9', momentId: 'ava-30th', title: 'Confirm final headcount', due: d(21), kind: 'call', done: false },
  { id: 't-a10', momentId: 'ava-30th', title: 'Rentals delivered to the rooftop', due: d(24), kind: 'delivery', done: false, time: '3:00 PM' },
  { id: 't-a11', momentId: 'ava-30th', title: 'Set-up from 4 · party at 7', due: d(24), kind: 'setup', done: false, time: '4:00 PM' },

  // Mom's birthday
  { id: 't-m1', momentId: 'mom-birthday', title: 'Pick Mom’s gift', due: d(0), kind: 'order', done: false, itemId: 'gift', time: 'Today' },
  { id: 't-m2', momentId: 'mom-birthday', title: 'Send card message to Keisha', due: d(6), kind: 'reminder', done: false },
  { id: 't-m3', momentId: 'mom-birthday', title: 'Flowers delivered in Mandeville', due: d(10), kind: 'delivery', done: false, time: '9:00 AM' },

  // Baby shower
  { id: 't-s1', momentId: 'garden-shower', title: 'Choose decorations and tableware', due: d(2), kind: 'order', done: false, itemId: 'decor' },
  { id: 't-s2', momentId: 'garden-shower', title: 'Approve chair and table rentals', due: d(4), kind: 'order', done: false, itemId: 'chairs' },
  { id: 't-s3', momentId: 'garden-shower', title: 'Invitations out to 30 guests', due: d(24), kind: 'invite', done: false },
  { id: 't-s4', momentId: 'garden-shower', title: 'Cake order locked', due: d(38), kind: 'order', done: false },
  { id: 't-s5', momentId: 'garden-shower', title: 'Rentals delivered to Hope Gardens', due: d(45), kind: 'delivery', done: false, time: '10:00 AM' },

  // Friendsgiving + Christmas
  { id: 't-f1', momentId: 'friendsgiving', title: 'Confirm who’s coming', due: d(30), kind: 'call', done: false },
  { id: 't-f2', momentId: 'friendsgiving', title: 'PriceSmart run (members-only)', due: d(56), kind: 'pickup', done: false, place: 'Constant Spring' },
  { id: 't-c1', momentId: 'christmas-mobay', title: 'Barrel packed in Brooklyn', due: d(40), kind: 'delivery', done: false },
  { id: 't-c2', momentId: 'christmas-mobay', title: 'Barrel clears customs in Kingston', due: d(75), kind: 'delivery', done: false },

  // Loose ends for the monthly tidy-up (September)
  { id: 't-r1', momentId: 'ava-30th', title: 'Reply to Tia about the colour theme', due: d(-4), kind: 'call', done: false, place: 'WhatsApp' },
  { id: 't-r2', momentId: 'garden-shower', title: 'Order a balloon pump', due: d(-2), kind: 'order', done: false, snoozedUntil: d(3) },
  { id: 't-r3', momentId: 'mom-birthday', title: 'Confirm Mom’s new address', due: d(-1), kind: 'call', done: false, place: 'Mandeville' },
  { id: 't-r4', momentId: 'friendsgiving', title: 'Ask Jordan for the guest list', due: d(2), kind: 'call', done: false },
  { id: 't-r5', momentId: 'ava-30th', title: 'Buy a gold outfit', due: d(5), kind: 'order', done: false, place: 'SHEIN or Temu' },
  { id: 't-r6', momentId: 'christmas-mobay', title: 'Book the drive to MoBay', due: d(6), kind: 'reminder', done: false },
];
