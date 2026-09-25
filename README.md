# Moments — by Shop2Ship

The planning side of Shop2Ship. Tell us what's coming up; the S2S agent and a person on your S2S team plan it, source it (including shops that can't be searched), price it landed, and count it down to the day.

This build is **UI only** — typed mock data, no backend (Expo SDK 57, React Native 0.86, Expo Router).

## Run it

```bash
npm install            # also copies Skia's canvaskit.wasm into public/ (postinstall)
npx expo start         # scan with Expo Go (iOS / Android)
npx expo start --web   # web preview (Skia runs on CanvasKit)
```

## Checks

```bash
npm run typecheck      # regenerates typed routes (Windows-safe) then tsc
npx expo lint
npx expo-doctor
```

## Where things live

| Path | What |
|---|---|
| `src/app/` | Routes only — intro, onboarding, `(tabs)` (home, calendar, ideas, you), `plan/new`, `plan/run`, `moment/[id]` (+ item and quote sheets), `idea/[slug]`, `review`, `bin`, `notifications`, `dev/gallery` |
| `src/theme/` | S2S tokens (navy/gold, ink + flare ramps), paper and ink themes, type scale (Manrope + Fredoka), shadows, motion (expo/spring curves, CSS keyframes) |
| `src/components/brand/` | The "Sparkling day" mark and its animated states, the S2S mark, wordmark, textures, and the Skia particle field |
| `src/components/mascot/` | The cast — Mo, Dot, Tiers, Bloop, Pip — hand-built SVG with a pose rig |
| `src/data/` | Types, fixtures (moments, ideas, people, stores), the mock store and selectors |
| `scripts/` | `gen-art.mjs` (Vertex AI art), `gen-brand-assets.mjs` (icons/splash from the mark), `gen-wordmark.mjs`, `gen-grain.mjs`, `typed-routes.mjs` |

## Regenerating assets

```bash
node scripts/gen-brand-assets.mjs     # app icon, splash, adaptive icons, iOS .icon from the mark
node scripts/gen-art.mjs              # clay art + product shots (Vertex, uses Optiq's service account)
node scripts/gen-art.mjs --index      # rebuild src/data/art-index.generated.ts only
```

The dev gallery (`/dev/gallery`, or You → Component gallery) shows every primitive, mark state, character pose and particle chapter in both themes.
