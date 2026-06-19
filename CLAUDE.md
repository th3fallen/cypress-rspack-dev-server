# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A Cypress component testing dev server that uses Rspack as the bundler. Based on Cypress's official webpack-dev-server, re-implemented for Rspack. Published to npm as `cypress-rspack-dev-server`.

## Commands

- `pnpm build` — compile TypeScript to `dist/` (tolerates type errors)
- `pnpm check-ts` — type-check without emitting
- `pnpm lint` — ESLint
- `pnpm test` — Jest
- `pnpm cypress:run` — run Cypress component tests headless (requires `cypress install` first)
- `pnpm cypress:open` — open Cypress interactive mode
- `DEBUG=cypress-rspack-dev-server:* <command>` — enable debug logging for any command

## Architecture

The entry point is `src/index.ts` which exports `devServer()`. The flow:

1. **`devServer.ts`** — detects framework (react/vue/svelte/angular/next), resolves presets, orchestrates everything
2. **`helpers/sourceRelativeRspackModules.ts`** — sources `@rspack/core` and `@rspack/dev-server` from the user's project (or framework) via `dynamicAbsoluteImport`, installs `Module._load`/`_resolveFilename` hooks to ensure consistent rspack resolution
3. **`makeRspackConfig.ts`** — auto-discovers user's rspack/webpack config via `find-up`, merges user + framework + Cypress configs with `webpack-merge`, removes conflicting plugins (HtmlWebpackPlugin, HtmlRspackPlugin, HMR)
4. **`makeDefaultRspackConfig.ts`** — builds Cypress-specific rspack config: dev mode, inline source maps, HtmlRspackPlugin, CypressCTRspackPlugin
5. **`createRspackDevServer.ts`** — instantiates `RspackDevServer` with final config
6. **`CypressCTRspackPlugin.ts`** — custom rspack plugin that tracks spec files, handles `dev-server:specs:changed` events, injects context into the loader
7. **`loader.ts`** — rspack loader that generates dynamic imports for spec files with chunk names, handles support file injection
8. **`browser.ts` → `aut-runner.ts`** — browser-side entry that initializes `Cypress.onSpecWindow()`

## Key Design Decisions

**`dynamic-import.ts`** — uses `new Function('specifier', 'return import(specifier)')` to prevent tsc (CommonJS target) from converting `import()` to `require()`. This is critical for loading Rspack v2's ESM modules. Used in `sourceRelativeRspackModules.ts` and `makeRspackConfig.ts`.

**Module resolution hooks** — `sourceRelativeRspackModules.ts` monkey-patches `Module._load` and `Module._resolveFilename` so that any code importing `rspack` or `rspack/*` resolves to the version found in the user's project, not the bundled one.

**Config auto-discovery** — searches for `rspack.config.{ts,js,mjs,cjs}` first, falls back to `webpack.config.{ts,js,mjs,cjs}` (defined in `constants.ts`).

## Loading Rspack v2's ESM modules from a CommonJS build

Rspack v2 (`@rspack/core`/`@rspack/dev-server`) and `find-up` are pure ESM packages, but this project compiles to CommonJS (`tsconfig.json` has `module: commonjs`). tsc would convert any `import()` in the source into `require()`, which cannot load an ESM-only package at runtime.

**`dynamic-import.ts`** — uses `new Function('specifier', 'return import(specifier)')` to preserve a native `import()` at runtime that tsc cannot rewrite to `require()`. Used via `dynamicAbsoluteImport` in `sourceRelativeRspackModules.ts` (sourcing rspack) and via `dynamicImport` in `makeRspackConfig.ts` (loading `find-up`). This is fundamental to the CJS→ESM bridge and is unrelated to the historical tsx workaround below.

### Removed tsx workaround (historical note)

Rspack v2 uses `import.meta.dirname` internally. Older tsx (< 4.21.1, which Cypress used to bundle) transformed `import.meta` into an empty `const import_meta = {}` when converting ESM to CJS, leaving `import.meta.dirname` undefined and crashing Rspack. A `patchImportMeta.ts` module patched `Module._extensions['.js']` to inject the correct values.

This was removed once tsx fixed it ([tsx 4.21.1](https://github.com/privatenumber/tsx/issues/781)) and Cypress shipped the fixed tsx (4.22.4) starting in **v15.17.0** — hence the `cypress: ^15.17.0` floor in `package.json`. Do not reintroduce `patchImportMeta.ts` unless the minimum Cypress version is lowered below 15.17.0.

Related issues:

- https://github.com/privatenumber/tsx/issues/781
- https://github.com/web-infra-dev/rspack/issues/13420

## Build & Publish

- TypeScript compiles `src/` → `dist/` with CommonJS module output, ES2017 target
- Only `dist/` is published (`"files": ["dist"]` in package.json)
- `tsconfig.json` has `stripInternal: true` to remove `@internal` types from declarations

## Code Style

- Prettier: single quotes, no semicolons, 100 char width
- Debug logging uses the `debug` library with namespace `cypress-rspack-dev-server:<module>`
- Constants are UPPER_SNAKE_CASE, classes PascalCase, functions/variables camelCase
