// Regenerates .expo/types/router.d.ts from src/app with Expo's own generator.
// Why: on Windows the dev server's file watcher checks `relative(...).startsWith('../')`, but
// Windows paths use `..\`, so every non-route file under src/ leaks into the typed routes.
// Run before `tsc` (see the `typecheck` script).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = process.cwd();
const appRoot = path.join(root, 'src', 'app');
const require = createRequire(import.meta.url);

const cliDir = path.dirname(require.resolve('@expo/cli/package.json', { paths: [path.dirname(require.resolve('expo/package.json'))] }));
const serverDir = path.dirname(require.resolve('@expo/router-server/package.json', { paths: [cliDir] }));
const { getTypedRoutesDeclarationFile } = require(path.join(serverDir, 'build/typed-routes/generate.js'));
const { requireContext } = require('expo-router/internal/testing');
const { EXPO_ROUTER_CTX_IGNORE } = require('expo-router/_ctx-shared');

const ctx = requireContext(appRoot, true, EXPO_ROUTER_CTX_IGNORE);
const file = getTypedRoutesDeclarationFile(ctx);
if (!file) throw new Error('typed routes generation failed');
const out = path.join(root, '.expo', 'types', 'router.d.ts');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, file);
console.log('typed routes →', path.relative(root, out));
