"use strict";
/* global Cypress */
/// <reference types="cypress" />
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const path = tslib_1.__importStar(require("path"));
const debug = (0, debug_1.default)('cypress-rspack-dev-server:rspack');
/**
 * @param {ComponentSpec} file spec to create import string from.
 * @param {string} filename name of the spec file - this is the same as file.name
 * @param {string} chunkName rspack chunk name. eg: 'spec-0'
 * @param {string} projectRoot absolute path to the project root. eg: /Users/<username>/my-app
 */
const makeImport = (file, filename, chunkName, projectRoot) => {
    // If we want to rename the chunks, we can use this
    const magicComments = chunkName ? `/* rspackChunkName: "${chunkName}" */` : '';
    return `"${filename}": {
    shouldLoad: () => {
      const newLoad = new URLSearchParams(document.location.search).get("specPath") === "${file.absolute}";
      const oldLoad = decodeURI(document.location.pathname).includes("${file.absolute}");
      return newLoad | oldLoad;
    },
    load: () => import(${magicComments} "${file.absolute}"),
    absolute: "${file.absolute.split(path.sep).join(path.posix.sep)}",
    relative: "${file.relative.split(path.sep).join(path.posix.sep)}",
    relativeUrl: "/__cypress/src/${chunkName}.js",
  }`;
};
/**
 * Creates a object mapping a spec file to an object mapping
 * the spec name to the result of `makeImport`.
 *
 * @returns {Record<string, ReturnType<makeImport>}
 * {
 *   "App.spec.js": {
 *     shouldLoad: () => {
         const newLoad = new URLSearchParams(document.location.search).get("specPath") === "${
           file.absolute
         }";
         const oldLoad = decodeURI(document.location.pathname).includes("${file.absolute}");
         return newLoad | oldLoad;
       },
 *     load: () => {
 *       return import("/Users/projects/my-app/cypress/component/App.spec.js" \/* rspackChunkName: "spec-0" *\/)
 *     },
 *     chunkName: "spec-0"
 *   }
 * }
 */
function buildSpecs(projectRoot, files = []) {
    if (!Array.isArray(files))
        return `{}`;
    debug(`projectRoot: ${projectRoot}, files: ${files.map((f) => f.absolute).join(',')}`);
    return `{${files
        .map((f, i) => {
        return makeImport(f, f.name, `spec-${i}`, projectRoot);
    })
        .join(',')}}`;
}
// Runs the tests inside the iframe
function loader() {
    const ctx = this;
    // A spec added after the dev-server is created won't
    // be included in the compilation. Disabling the caching of this loader ensures
    // we regenerate our specs and include any new ones in the compilation.
    ctx.cacheable(false);
    const { files, projectRoot, supportFile } = ctx._cypress;
    const supportFileAbsolutePath = supportFile
        ? JSON.stringify(path.resolve(projectRoot, supportFile))
        : undefined;
    const supportFileRelativePath = supportFile
        ? JSON.stringify(path.relative(projectRoot, supportFileAbsolutePath || ''))
        : undefined;
    const result = `
  var allTheSpecs = ${buildSpecs(projectRoot, files)};

  var { init } = require(${JSON.stringify(require.resolve('./aut-runner'))})

  var scriptLoaders = Object.values(allTheSpecs).reduce(
    (accSpecLoaders, specLoader) => {
      if (specLoader.shouldLoad()) {
        accSpecLoaders.push(specLoader)
      }
      return accSpecLoaders
  }, [])

  if (${!!supportFile}) {
    var supportFile = {
      absolute: ${supportFileAbsolutePath},
      relative: ${supportFileRelativePath},
      relativeUrl: "/__cypress/src/cypress-support-file.js",
      load: () => import(/* rspackChunkName: "cypress-support-file" */ ${supportFileAbsolutePath}),
    }
    scriptLoaders.unshift(supportFile)
  }

  init(scriptLoaders)
  `;
    return result;
}
exports.default = loader;
