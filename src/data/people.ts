import type { Person } from './types';

/** Photo crops: focal point (0..1) + zoom, so full delivery photos read as face avatars. */
export interface PhotoCrop {
  src: number;
  fx: number;
  fy: number;
  zoom: number;
}

export const photos = {
  c01: { src: require('@/assets/photos/customer-01.webp'), fx: 0.44, fy: 0.42, zoom: 2.3 },
  c02: { src: require('@/assets/photos/customer-02.webp'), fx: 0.55, fy: 0.37, zoom: 2.4 },
  c03: { src: require('@/assets/photos/customer-03.webp'), fx: 0.5, fy: 0.17, zoom: 2.8 },
  c04: { src: require('@/assets/photos/customer-04.webp'), fx: 0.45, fy: 0.34, zoom: 2.5 },
  c05: { src: require('@/assets/photos/customer-05.webp'), fx: 0.3, fy: 0.36, zoom: 2.4 },
  c06: { src: require('@/assets/photos/customer-06.webp'), fx: 0.44, fy: 0.3, zoom: 2.6 },
  c07: { src: require('@/assets/photos/customer-07.webp'), fx: 0.5, fy: 0.16, zoom: 2.8 },
  c08: { src: require('@/assets/photos/customer-08.webp'), fx: 0.66, fy: 0.28, zoom: 2.8 },
  c09: { src: require('@/assets/photos/customer-09.webp'), fx: 0.45, fy: 0.38, zoom: 2.3 },
  c10: { src: require('@/assets/photos/customer-10.webp'), fx: 0.52, fy: 0.25, zoom: 2.6 },
} satisfies Record<string, PhotoCrop>;

export type PhotoKey = keyof typeof photos;

export interface PersonX extends Omit<Person, 'photo'> {
  photo?: PhotoKey;
}

export const people: Record<string, PersonX> = {
  ava: { id: 'ava', name: 'Ava Brown', short: 'Ava', relation: 'You', photo: 'c01', tint: 'birthday', birthday: '10-17' },
  keisha: { id: 'keisha', name: 'Keisha Campbell', short: 'Keisha', relation: 'Your S2S team', photo: 'c03', tint: 'babyShower', team: true },
  marcus: { id: 'marcus', name: 'Marcus Reid', short: 'Marcus', relation: 'S2S delivery', photo: 'c02', tint: 'dinner', team: true },
  jordan: { id: 'jordan', name: 'Jordan Clarke', short: 'Jordan', relation: 'Co-planner', photo: 'c09', tint: 'trip' },
  tia: { id: 'tia', name: 'Tia Morgan', short: 'Tia', relation: 'Best friend', photo: 'c08', tint: 'wedding', birthday: '12-02' },
  pearl: { id: 'pearl', name: 'Pearl Brown', short: 'Mom', relation: 'Mom', photo: 'c06', tint: 'gift', birthday: '10-03' },
  winston: { id: 'winston', name: 'Winston Brown', short: 'Dad', relation: 'Dad', photo: 'c04', tint: 'holiday', birthday: '02-14' },
  shanice: { id: 'shanice', name: 'Shanice Walters', short: 'Shanice', relation: 'Sister', photo: 'c05', tint: 'babyShower', birthday: '06-21' },
  dre: { id: 'dre', name: 'Andre Lewis', short: 'Dre', relation: 'Cousin', photo: 'c10', tint: 'home', birthday: '03-09' },
  nia: { id: 'nia', name: 'Nia Grant', short: 'Nia', relation: 'Friend', photo: 'c07', tint: 'trip', birthday: '08-30' },
};

export const person = (id: string) => people[id];
export const photoOf = (id: string) => {
  const p = people[id];
  return p?.photo ? photos[p.photo] : undefined;
};
