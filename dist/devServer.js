"use strict";
/// <reference types="cypress" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.isThirdPartyDefinition = exports.devServer = void 0;
const tslib_1 = require("tslib");
const createRspackDevServer_1 = require("./createRspackDevServer");
const debug_1 = tslib_1.__importDefault(require("debug"));
const sourceRelativeRspackModules_1 = require("./helpers/sourceRelativeRspackModules");
const debug = (0, debug_1.default)('cypress:rspack-dev-server:devServer');
/**
 * import { devServer } from '@cypress/rspack-dev-server'
 *
 * Creates & returns a WebpackDevServer for serving files related
 * to Cypress Component Testing
 *
 * @param config
 */
function devServer(devServerConfig) {
    return new Promise(async (resolve, reject) => {
        const result = await devServer.create(devServerConfig);
        result.server.start().then(() => {
            if (!result.server.options.port) {
                return reject(new Error(`Expected port ${result.server.options.port} to be a number`));
            }
            debug('Component testing rspack server 4 started on port %s', result.server.options.port);
            resolve({
                port: result.server.options.port,
                // Close is for unit testing only. We kill this child process which will handle the closing of the server
                close: async (done) => {
                    debug('closing dev server');
                    result.server.stop().then(() => done === null || done === void 0 ? void 0 : done()).catch(done).finally(() => {
                        debug('closed dev server');
                    });
                },
            });
        }).catch(reject);
    });
}
exports.devServer = devServer;
const thirdPartyDefinitionPrefixes = {
    // matches @org/cypress-ct-*
    namespacedPrefixRe: /^@.+?\/cypress-ct-.+/,
    globalPrefix: 'cypress-ct-',
};
function isThirdPartyDefinition(framework) {
    return framework.startsWith(thirdPartyDefinitionPrefixes.globalPrefix) ||
        thirdPartyDefinitionPrefixes.namespacedPrefixRe.test(framework);
}
exports.isThirdPartyDefinition = isThirdPartyDefinition;
async function getPreset(devServerConfig) {
    const defaultRspackModules = () => ({ sourceRspackModulesResult: (0, sourceRelativeRspackModules_1.sourceDefaultRspackDependencies)(devServerConfig) });
    // Third party library (eg solid-js, lit, etc)
    if (devServerConfig.framework && isThirdPartyDefinition(devServerConfig.framework)) {
        return defaultRspackModules();
    }
    switch (devServerConfig.framework) {
        // todo - add support for other frameworks
        case 'create-react-app':
        // return createReactAppHandler(devServerConfig);
        case 'nuxt':
        // return await nuxtHandler(devServerConfig)
        case 'vue-cli':
        // return await vueCliHandler(devServerConfig)
        case 'next':
        // return await nextHandler(devServerConfig)
        case 'angular':
        // return await angularHandler(devServerConfig)
        case 'react':
        case 'vue':
        case 'svelte':
        case undefined:
            return defaultRspackModules();
        default:
            throw new Error(`Unexpected framework ${devServerConfig.framework}, please visit https://on.cypress.io/component-framework-configuration to see a list of supported frameworks`);
    }
}
/**
 * Synchronously create the rspack server instance, without starting.
 * Useful for testing
 *
 * @internal
 */
devServer.create = async function (devServerConfig) {
    const { frameworkConfig, sourceRspackModulesResult } = await getPreset(devServerConfig);
    const { server, compiler } = await (0, createRspackDevServer_1.createRspackDevServer)({
        devServerConfig,
        frameworkConfig,
        sourceRspackModulesResult,
    });
    const result = {
        server,
        compiler,
        version: sourceRspackModulesResult.rspackDevServer.majorVersion,
    };
    return result;
};
exports.default = devServer;
