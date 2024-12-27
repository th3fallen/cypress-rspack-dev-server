"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CYPRESS_RSPACK_ENTRYPOINT = void 0;
exports.makeRspackConfig = makeRspackConfig;
const tslib_1 = require("tslib");
const debug_1 = require("debug");
const path = tslib_1.__importStar(require("path"));
const webpack_merge_1 = require("webpack-merge");
const local_pkg_1 = require("local-pkg");
const makeDefaultRspackConfig_1 = require("./makeDefaultRspackConfig");
const constants_1 = require("./constants");
const dynamic_import_1 = require("./dynamic-import");
const debug = (0, debug_1.debug)('cypress-rspack-dev-server:makeRspackConfig');
const removeList = [
    // We provide a webpack-html-plugin config pinned to a specific version (4.x)
    // that we have tested and are confident works with all common configurations.
    // https://github.com/cypress-io/cypress/issues/15865
    'HtmlWebpackPlugin',
    // the rspack's internal html plugin
    'HtmlRspackPlugin',
    // We already reload when rspack recompiles (via listeners on
    // devServerEvents). Removing this plugin can prevent double-refreshes
    // in some setups.
    'HotModuleReplacementPlugin',
];
exports.CYPRESS_RSPACK_ENTRYPOINT = path.resolve(__dirname, 'browser.js');
/**
 * Removes and/or modifies certain plugins known to conflict
 * when used with @rspack/dev-server.
 */
function modifyRspackConfigForCypress(rspackConfig) {
    if (rspackConfig === null || rspackConfig === void 0 ? void 0 : rspackConfig.plugins) {
        rspackConfig.plugins = rspackConfig.plugins.filter((plugin) => {
            if (plugin) {
                let pluginName = '';
                try {
                    // NOTE: this is to be compatible the old version HtmlRspackPlugin, to get its correct name
                    // sth changed for HtmlRspackPlugin in 1.0.1 which would cause the error during calling `raw`
                    pluginName =
                        'raw' in plugin ? plugin.raw({ options: { output: {} } }).name : plugin.constructor.name;
                }
                catch (_a) {
                    pluginName = plugin.constructor.name;
                }
                return !removeList.includes(pluginName);
            }
            return false;
        });
    }
    delete rspackConfig.entry;
    delete rspackConfig.output;
    return rspackConfig;
}
async function getRspackConfigFromProjectRoot(projectRoot) {
    const { findUp } = await (0, dynamic_import_1.dynamicImport)('find-up');
    return await findUp(constants_1.configFiles, { cwd: projectRoot });
}
/**
 * Creates a rspack compatible rspack "configuration" to pass to the sourced rspack function
 */
async function makeRspackConfig(config) {
    var _a, _b, _c;
    let userRspackConfig = config.devServerConfig.rspackConfig;
    const frameworkRspackConfig = config.frameworkConfig;
    const { cypressConfig: { projectRoot, supportFile }, specs: files, framework, } = config.devServerConfig;
    if (!userRspackConfig && !frameworkRspackConfig) {
        debug('Not user or framework rspack config received. Trying to automatically source it');
        const configFile = await getRspackConfigFromProjectRoot(projectRoot);
        if (configFile) {
            debug('found rspack config %s', configFile);
            const sourcedConfig = await (0, local_pkg_1.importModule)(configFile);
            debug('config contains %o', sourcedConfig);
            if (sourcedConfig && typeof sourcedConfig === 'object') {
                userRspackConfig = (_a = sourcedConfig.default) !== null && _a !== void 0 ? _a : sourcedConfig;
            }
        }
        if (!userRspackConfig) {
            debug('could not find rspack.config!');
            if ((_b = config.devServerConfig) === null || _b === void 0 ? void 0 : _b.onConfigNotFound) {
                config.devServerConfig.onConfigNotFound('rspack', projectRoot, constants_1.configFiles);
                // The config process will be killed from the parent, but we want to early exit so we don't get
                // any additional errors related to not having a config
                process.exit(0);
            }
            else {
                throw new Error(`Your Cypress devServer config is missing a required rspackConfig property, since we could not automatically detect one.\n
          Please add one to your ${config.devServerConfig.cypressConfig.configFile}`);
            }
        }
    }
    userRspackConfig =
        typeof userRspackConfig === 'function' ? await userRspackConfig() : userRspackConfig;
    const userAndFrameworkRspackConfig = modifyRspackConfigForCypress((0, webpack_merge_1.merge)(frameworkRspackConfig !== null && frameworkRspackConfig !== void 0 ? frameworkRspackConfig : {}, userRspackConfig !== null && userRspackConfig !== void 0 ? userRspackConfig : {}));
    debug(`User passed in user and framework rspack config with values %o`, userAndFrameworkRspackConfig);
    debug(`New rspack entries %o`, files);
    debug(`Project root`, projectRoot);
    debug(`Support file`, supportFile);
    const mergedConfig = (0, webpack_merge_1.merge)(userAndFrameworkRspackConfig, (0, makeDefaultRspackConfig_1.makeCypressRspackConfig)(config));
    // Some frameworks (like Next.js) change this value which changes the path we would need to use to fetch our spec.
    // (eg, http://localhost:xxxx/<dev-server-public-path>/static/chunks/spec-<x>.js). Deleting this key to normalize
    // the spec URL to `*/spec-<x>.js` which we need to know up-front so we can fetch the sourcemaps.
    (_c = mergedConfig.output) === null || _c === void 0 ? true : delete _c.chunkFilename;
    // Angular loads global styles and polyfills via script injection in the index.html
    if (framework === 'angular') {
        mergedConfig.entry = Object.assign(Object.assign({}, mergedConfig.entry), { 'cypress-entry': exports.CYPRESS_RSPACK_ENTRYPOINT });
    }
    else {
        mergedConfig.entry = exports.CYPRESS_RSPACK_ENTRYPOINT;
    }
    debug('Merged rspack config %o', mergedConfig);
    return mergedConfig;
}
