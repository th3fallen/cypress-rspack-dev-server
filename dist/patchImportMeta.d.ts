/**
 * WORKAROUND: Patch tsx's CJS transform to fix import.meta.dirname/filename.
 *
 * When Cypress loads config files, it uses tsx to transpile TypeScript/ESM to CJS.
 * tsx uses esbuild which transforms `import.meta` into `const import_meta = {}` —
 * an empty object. This leaves `import.meta.dirname` and `import.meta.filename`
 * undefined, causing Rspack v2 (which relies on them) to crash with:
 *   TypeError: The "path" argument must be of type string. Received undefined
 *
 * This patch wraps Module._extensions['.js'] to intercept the transformed code
 * and inject the correct dirname/filename/url values into the empty import_meta
 * object before the module executes.
 *
 * This must run at module-load time (before any @rspack/* modules are required)
 * to cover both this library's internal imports and user config files that
 * import from @rspack/core.
 *
 * TODO: Remove this workaround once tsx merges the fix and Cypress ships with it.
 * See: https://github.com/privatenumber/tsx/issues/781
 * See: https://github.com/privatenumber/tsx/pull/782
 * See: https://github.com/web-infra-dev/rspack/issues/13420
 */
export {};
