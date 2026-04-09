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

import Module from 'module'
import path from 'path'

type ExtensionHandler = (mod: Module, filename: string) => void

const extensions = (Module as any)._extensions as Record<string, ExtensionHandler>

// Wrap the current .js handler. tsx may or may not be registered at this point —
// either way, we wrap whatever handler is active and patch _compile to fix the
// empty import_meta object that tsx/esbuild produces.
const previousJsHandler = extensions['.js']

if (previousJsHandler) {
  extensions['.js'] = function patchedJsHandler(mod: Module, filename: string) {
    const origCompile = (mod as any)._compile
    ;(mod as any)._compile = function (content: string, fn: string) {
      // Restore original _compile immediately so we don't leak the wrapper
      ;(mod as any)._compile = origCompile

      // Only patch files where tsx/esbuild has transformed import.meta to an empty object.
      // This is a targeted string replacement that only affects transformed ESM code.
      if (typeof content === 'string' && content.includes('const import_meta={}')) {
        const dirname = path.dirname(filename)
        content = content.replace(
          'const import_meta={}',
          'const import_meta={dirname:' +
            JSON.stringify(dirname) +
            ',filename:' +
            JSON.stringify(filename) +
            ',url:' +
            JSON.stringify('file://' + filename) +
            '}',
        )
      }
      return origCompile.call(this, content, fn)
    }
    return previousJsHandler(mod, filename)
  }
}
