// `@expo/metro-runtime` MUST be the first import so Fast Refresh works on web.
import '@expo/metro-runtime';

import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

declare global {
  var __SKIA_DISABLED__: boolean | undefined;
}

// Same order as expo-router/entry-classic, but CanvasKit (Skia's wasm, served from /public)
// has to be ready before any Skia canvas mounts. If it fails, the app still renders and every
// particle field falls back to static SVG.
LoadSkiaWeb({ locateFile: (file: string) => `/${file}` })
  .catch((e: unknown) => {
    console.error('[skia] CanvasKit failed to load', e);
    globalThis.__SKIA_DISABLED__ = true;
  })
  .finally(() => renderRootComponent(App));
