"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicAbsoluteImport = exports.dynamicImport = void 0;
const url_1 = require("url");
// tsc will compile `import(...)` calls to require unless a different tsconfig.module value
// is used (e.g. module=node16). To change this, we would also have to change the ts-node behavior when requiring the
// Cypress config file. This hack for keeping dynamic imports from being converted works across all
// of our supported node versions
const _dynamicImport = new Function('specifier', 'return import(specifier)');
const dynamicImport = (module) => _dynamicImport(module);
exports.dynamicImport = dynamicImport;
const dynamicAbsoluteImport = (filePath) => {
    return (0, exports.dynamicImport)((0, url_1.pathToFileURL)(filePath).href);
};
exports.dynamicAbsoluteImport = dynamicAbsoluteImport;
