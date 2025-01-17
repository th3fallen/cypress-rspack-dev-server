"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceFramework = sourceFramework;
exports.sourceRspack = sourceRspack;
exports.sourceRspackDevServer = sourceRspackDevServer;
exports.sourceDefaultRspackDependencies = sourceDefaultRspackDependencies;
exports.restoreLoadHook = restoreLoadHook;
const tslib_1 = require("tslib");
const module_1 = tslib_1.__importDefault(require("module"));
const path_1 = tslib_1.__importDefault(require("path"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const debug = (0, debug_1.default)('cypress-rspack-dev-server:sourceRelativeRspackModules');
const originalModuleLoad = module_1.default._load;
const originalModuleResolveFilename = module_1.default._resolveFilename;
const frameworkRspackMapper = {
    react: 'react',
    vue: undefined,
    next: 'next',
    angular: '@angular-devkit/build-angular',
    svelte: undefined,
};
// Source the users framework from the provided projectRoot. The framework, if available, will serve
// as the resolve base for rspack dependency resolution.
function sourceFramework(config) {
    debug('Framework: Attempting to source framework for %s', config.cypressConfig.projectRoot);
    if (!config.framework) {
        debug('Framework: No framework provided');
        return null;
    }
    const sourceOfRspack = frameworkRspackMapper[config.framework];
    if (!sourceOfRspack) {
        debug('Not a higher-order framework so rspack dependencies should be resolvable from projectRoot');
        return null;
    }
    const framework = {};
    try {
        const frameworkJsonPath = require.resolve(`${sourceOfRspack}/package.json`, {
            paths: [config.cypressConfig.projectRoot],
        });
        const frameworkPathRoot = path_1.default.dirname(frameworkJsonPath);
        // Want to make sure we're sourcing this from the user's code. Otherwise we can
        // warn and tell them they don't have their dependencies installed
        framework.importPath = frameworkPathRoot;
        framework.packageJson = require(frameworkJsonPath);
        debug('Framework: Successfully sourced framework - %o', framework);
        return framework;
    }
    catch (e) {
        debug('Framework: Failed to source framework - %s', e);
        // TODO
        return null;
    }
}
// Source the rspack module from the provided framework or projectRoot. We override the module resolution
// so that other packages that import rspack resolve to the version we found.
function sourceRspack(config, framework) {
    var _a;
    const searchRoot = (_a = framework === null || framework === void 0 ? void 0 : framework.importPath) !== null && _a !== void 0 ? _a : config.cypressConfig.projectRoot;
    debug('Rspack: Attempting to source rspack from %s', searchRoot);
    const rspack = {};
    const rspackJsonPath = require.resolve('@rspack/core/package.json', {
        paths: [searchRoot],
    });
    rspack.importPath = path_1.default.dirname(rspackJsonPath);
    rspack.packageJson = require(rspackJsonPath);
    rspack.module = require(rspack.importPath).rspack;
    debug('Rspack: Successfully sourced rspack - %o', rspack);
    module_1.default._load = function (request, parent, isMain) {
        if (request === 'rspack' || request.startsWith('rspack/')) {
            const resolvePath = require.resolve(request, {
                paths: [rspack.importPath],
            });
            debug('Rspack: Module._load resolvePath - %s', resolvePath);
            return originalModuleLoad(resolvePath, parent, isMain);
        }
        return originalModuleLoad(request, parent, isMain);
    };
    module_1.default._resolveFilename = function (request, parent, isMain, options) {
        if (request === 'rspack' || (request.startsWith('rspack/') && !(options === null || options === void 0 ? void 0 : options.paths))) {
            const resolveFilename = originalModuleResolveFilename(request, parent, isMain, {
                paths: [rspack.importPath],
            });
            debug('Rspack: Module._resolveFilename resolveFilename - %s', resolveFilename);
            return resolveFilename;
        }
        return originalModuleResolveFilename(request, parent, isMain, options);
    };
    return rspack;
}
// Source the @rspack/dev-server module from the provided framework or projectRoot.
// If none is found, we fallback to the version bundled with this package.
function sourceRspackDevServer(config, framework) {
    var _a;
    const searchRoot = (_a = framework === null || framework === void 0 ? void 0 : framework.importPath) !== null && _a !== void 0 ? _a : config.cypressConfig.projectRoot;
    debug('RspackDevServer: Attempting to source @rspack/dev-server from %s', searchRoot);
    const rspackDevServer = {};
    let rspackDevServerJsonPath;
    try {
        rspackDevServerJsonPath = require.resolve('@rspack/dev-server/package.json', {
            paths: [searchRoot],
        });
    }
    catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
            debug('RspackDevServer: Failed to source @rspack/dev-server - %s', e);
            throw e;
        }
        debug('RspackDevServer: Falling back to bundled version');
        rspackDevServerJsonPath = require.resolve('@rspack/dev-server/package.json', {
            paths: [__dirname],
        });
    }
    rspackDevServer.importPath = path_1.default.dirname(rspackDevServerJsonPath);
    rspackDevServer.packageJson = require(rspackDevServerJsonPath);
    rspackDevServer.module = require(rspackDevServer.importPath).RspackDevServer;
    debug('RspackDevServer: Successfully sourced @rspack/dev-server - %o', rspackDevServer);
    return rspackDevServer;
}
// Most frameworks follow a similar path for sourcing rspack dependencies so this is a utility to handle all the sourcing.
function sourceDefaultRspackDependencies(config) {
    const framework = sourceFramework(config);
    const rspack = sourceRspack(config, framework);
    const rspackDevServer = sourceRspackDevServer(config, framework);
    return { framework, rspack, rspackDevServer };
}
function restoreLoadHook() {
    ;
    module_1.default._load = originalModuleLoad;
    module_1.default._resolveFilename = originalModuleResolveFilename;
}
