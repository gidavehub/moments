import type { ImageSource } from 'expo-image';

import { artIndex } from './art-index.generated';

/**
 * AI art registry. Keys are stable ("cover-rooftop-30th", "occ-baby", "product:cake-gold-drip");
 * the generated index maps them to bundled images plus the measured background colour so
 * cards sit seamlessly on the art. Missing keys return undefined → components fall back to
 * the SVG cast.
 */
export function art(key?: string): { source: ImageSource | number; bg?: string } | undefined {
  if (!key) return undefined;
  const k = key.startsWith('art:') ? key.slice(4) : key;
  return artIndex[k];
}

/** Resolve an option image: `art:` keys come from the registry, URLs load remotely. */
export function optionImage(image?: string | number): ImageSource | number | undefined {
  if (image == null) return undefined;
  if (typeof image === 'number') return image;
  if (image.startsWith('art:')) return art(image)?.source;
  return { uri: image };
}
