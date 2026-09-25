import { d } from '../clock';
import type { Order, OrderStage } from '../types';

/** The S2S fulfillment timeline, air and local. Labels follow the S2S order_status copy. */
export const orderStages: Record<Order['mode'], { stage: OrderStage; label: string; detail: string }[]> = {
  air: [
    { stage: 'placed', label: 'Order placed', detail: 'Paid and confirmed' },
    { stage: 'bought', label: 'Bought by S2S', detail: 'We ordered from each store' },
    { stage: 'warehouse', label: 'At our Miami warehouse', detail: 'Checked, packed and weighed' },
    { stage: 'flight', label: 'Flying to Kingston', detail: 'On the next cargo flight' },
    { stage: 'customs', label: 'Clearing customs', detail: 'Duty and GCT already paid' },
    { stage: 'out', label: 'Out for delivery', detail: 'Marcus is bringing it over' },
    { stage: 'delivered', label: 'Delivered', detail: 'Signed for at your door' },
  ],
  local: [
    { stage: 'placed', label: 'Order placed', detail: 'Paid and confirmed' },
    { stage: 'bought', label: 'Picked up by Keisha', detail: 'Collected from the store' },
    { stage: 'out', label: 'Out for delivery', detail: 'Marcus is bringing it over' },
    { stage: 'delivered', label: 'Delivered', detail: 'Signed for at your door' },
  ],
};

export const seedOrders: Order[] = [
  {
    id: 'S2S-10496',
    momentId: 'ava-30th',
    placed: d(-4),
    mode: 'air',
    lines: [{ itemId: 'favours', title: 'Gold favour boxes with ribbon, set of 25', storeId: 'amazon', qty: 25, landed: 7800 }],
    total: 7800,
    stage: 'flight',
    eta: d(3),
    payment: 'visa',
    courierId: 'marcus',
    log: [
      { stage: 'placed', at: `${d(-4)} 7:18 PM` },
      { stage: 'bought', at: `${d(-4)} 7:40 PM`, note: 'Amazon order #113-4402' },
      { stage: 'warehouse', at: `${d(-1)} 11:05 AM`, note: '1 box · 2.4 kg' },
      { stage: 'flight', at: `${d(0)} 6:30 AM`, note: 'MIA → KIN, lands tomorrow' },
    ],
  },
];
