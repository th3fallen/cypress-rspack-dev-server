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

0. **`patchImportMeta.ts`** — imported first by `index.ts`. Patches `Module._extensions['.js']` to fix tsx/esbuild's broken `import.meta.dirname` handling (see Workarounds section below)
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

## Workarounds (tsx / import.meta.dirname)

Rspack v2 is a pure ESM package that uses `import.meta.dirname` internally. Cypress uses tsx to load config files. tsx/esbuild transforms `import.meta` into `const import_meta = {}` (an empty object) when converting ESM to CJS, leaving `import.meta.dirname` undefined and crashing Rspack.

Two workarounds are in place (TODO: remove once [tsx#782](https://github.com/privatenumber/tsx/pull/782) is merged and Cypress ships with the fixed tsx):

1. **`patchImportMeta.ts`** — wraps `Module._extensions['.js']` to detect the empty `import_meta={}` in tsx-transformed code and inject correct `dirname`/`filename`/`url` values. Must be the first import in `index.ts` so it's active before any `@rspack/*` modules are required (including from user config files).

2. **`dynamicAbsoluteImport`** in `sourceRelativeRspackModules.ts` — uses `new Function('specifier', 'return import(specifier)')` to preserve native `import()` at runtime, preventing tsc (CommonJS target) from converting `import()` to `require()`.

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
