// Renders the Moments "Sparkling day" mark into every app asset from one geometry:
// icon.png, splash-icon.png, favicon.png, Android adaptive layers, and the iOS .icon layers.
// Usage: node scripts/gen-brand-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const NAVY = '#0D3052';
const GOLD = '#F4A31C';
const PAPER = '#F7F6F3';
const INK950 = '#081F37';
const TILT = -5.66;

// ---- geometry (mirrors src/components/brand/geometry.ts) ---------------------------------
// Calendar + the one sparkle at its heart — no satellites (those orbit S2S's globe, not ours).
const tile = { x: 77, y: 113, w: 358, h: 335, r: 100 };
const rings = [
  { x: 146, y: 64, w: 44, h: 95, r: 22 },
  { x: 322, y: 64, w: 44, h: 95, r: 22 },
];
const big = { cx: 256, cy: 292, r: 92 };
const rr = (x, y, w, h, r) =>
  `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
const spark = (cx, cy, r) => {
  const w = r * 0.25;
  const p = r * 0.1;
  return `M${cx} ${cy - r} C${cx + p} ${cy - w} ${cx + w} ${cy - p} ${cx + r} ${cy} C${cx + w} ${cy + p} ${cx + p} ${cy + w} ${cx} ${cy + r} C${cx - p} ${cy + w} ${cx - w} ${cy + p} ${cx - r} ${cy} C${cx - w} ${cy - p} ${cx - p} ${cy - w} ${cx} ${cy - r} Z`;
};

function markGroup({ tileColor = NAVY, accent = GOLD, holes = INK950, sheen = true, only } = {}) {
  const parts = [];
  if (!only || only === 'tile') {
    parts.push(`<path d="${rr(tile.x, tile.y, tile.w, tile.h, tile.r)}" fill="${tileColor}"/>`);
    if (sheen)
      parts.push(
        `<path d="${rr(tile.x, tile.y, tile.w, tile.h, tile.r)}" fill="url(#sheen)"/>`,
        ...rings.map((g) => `<rect x="${g.x + 6}" y="${tile.y + 38}" width="${g.w - 12}" height="20" rx="10" fill="${holes}" opacity="0.55"/>`),
      );
  }
  if (!only || only === 'accent') {
    parts.push(...rings.map((g) => `<path d="${rr(g.x, g.y, g.w, g.h, g.r)}" fill="${accent}"/>`));
    parts.push(`<path d="${spark(big.cx, big.cy, big.r)}" fill="${accent}"/>`);
  }
  return `<g transform="rotate(${TILT} 256 256)">${parts.join('')}</g>`;
}

const defs = `<defs><linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.07"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;

/** A 512 artboard with the mark scaled into `scale` of it, centred. */
function svg({ size = 1024, bg = null, scale = 0.62, ...mark }) {
  const k = scale;
  const off = (512 - 512 * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">${defs}${
    bg ? `<rect width="512" height="512" fill="${bg}"/>` : ''
  }<g transform="translate(${off} ${off}) scale(${k})">${markGroup(mark)}</g></svg>`;
}

const img = (p) => path.resolve('assets/images', p);
async function write(file, markup, size) {
  await sharp(Buffer.from(markup), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toFile(file);
  console.log('wrote', path.relative(process.cwd(), file));
}

// App icon (the OS applies its squircle/circle mask; we ship the full-bleed square).
await write(img('icon.png'), svg({ bg: PAPER, scale: 0.8 }), 1024);
// Native splash: the full-colour mark on the paper splash background (transparent PNG).
// Android 12+ crops the splash icon to a circle ~2/3 of its box, so the tilted mark sits
// inside that circle; src/app/splash.tsx starts from exactly this frame (SPLASH_MARK_SCALE).
await write(img('splash-icon.png'), svg({ scale: 0.66 }), 1024);
// Favicon.
await write(img('favicon.png'), svg({ bg: PAPER, scale: 0.86 }), 96);
// Android adaptive: foreground inside the 66% safe zone, flat paper background, mono.
await write(img('android-icon-foreground.png'), svg({ scale: 0.64 }), 512);
await write(img('android-icon-background.png'), `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="${PAPER}"/></svg>`, 512);
await write(img('android-icon-monochrome.png'), svg({ tileColor: '#FFFFFF', accent: '#FFFFFF', holes: 'transparent', sheen: false, scale: 0.64 }), 512);

// iOS 26 .icon (Icon Composer): background fill + tile layer + sparkles layer.
const iconDir = path.resolve('assets/moments.icon');
fs.mkdirSync(path.join(iconDir, 'Assets'), { recursive: true });
const layerSvg = (only) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 512 512">${defs}<g transform="translate(${(512 - 512 * 0.8) / 2} ${(512 - 512 * 0.8) / 2}) scale(0.8)">${markGroup({ only })}</g></svg>`;
fs.writeFileSync(path.join(iconDir, 'Assets', 'tile.svg'), layerSvg('tile'));
fs.writeFileSync(path.join(iconDir, 'Assets', 'sparkles.svg'), layerSvg('accent'));
fs.writeFileSync(
  path.join(iconDir, 'icon.json'),
  JSON.stringify(
    {
      fill: { solid: 'srgb:0.96863,0.96471,0.95294,1.00000' },
      groups: [
        { layers: [{ 'image-name': 'sparkles.svg', name: 'sparkles' }], shadow: { kind: 'neutral', opacity: 0.35 }, translucency: { enabled: true, value: 0.2 } },
        { layers: [{ 'image-name': 'tile.svg', name: 'tile' }], shadow: { kind: 'neutral', opacity: 0.5 }, translucency: { enabled: false, value: 0 } },
      ],
      'supported-platforms': { circles: ['watchOS'], squares: 'shared' },
    },
    null,
    2,
  ),
);
console.log('wrote assets/moments.icon');
