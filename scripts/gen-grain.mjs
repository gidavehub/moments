// Generates a tileable film-grain texture (grey noise with alpha) for the soft-3D grainy look.
// Usage: node scripts/gen-grain.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SIZE = 128;
const out = path.resolve('assets/textures/grain.png');
fs.mkdirSync(path.dirname(out), { recursive: true });

// mulberry32 so the texture is reproducible
let a = 0x5eed;
const rand = () => {
  a = (a + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const buf = Buffer.alloc(SIZE * SIZE * 4);
for (let i = 0; i < SIZE * SIZE; i++) {
  // Two-tone grain: light and dark specks with random alpha, so it reads on any colour.
  const light = rand() > 0.5;
  const v = light ? 255 : 0;
  const alpha = Math.round(Math.pow(rand(), 1.6) * 255);
  buf[i * 4] = v;
  buf[i * 4 + 1] = v;
  buf[i * 4 + 2] = v;
  buf[i * 4 + 3] = alpha;
}

await sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(out);
console.log('wrote', out);
