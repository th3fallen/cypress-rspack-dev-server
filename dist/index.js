"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devServer = void 0;
// Must run before any @rspack/* modules are loaded — patches tsx's CJS transform
// to fix import.meta.dirname/filename. See patchImportMeta.ts for details.
require("./patchImportMeta");
const devServer_1 = require("./devServer");
Object.defineProperty(exports, "devServer", { enumerable: true, get: function () { return devServer_1.devServer; } });
exports.default = devServer_1.devServer;
