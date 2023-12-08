"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRspackDevServer = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const makeRspackConfig_1 = require("./makeRspackConfig");
const debug = (0, debug_1.default)('cypress-rspack-dev-server:start');
async function createRspackDevServer(config) {
    var _a;
    const { sourceRspackModulesResult: { rspack: { module: rspack }, }, devServerConfig: { cypressConfig: { devServerPublicPathRoute }, }, } = config;
    const finalRspackConfig = await (0, makeRspackConfig_1.makeRspackConfig)(config);
    const rspackCompiler = rspack(finalRspackConfig, undefined);
    const isOpenMode = !config.devServerConfig.cypressConfig.isTextTerminal;
    const RspackDevServer = config.sourceRspackModulesResult.rspackDevServer.module;
    const rspackDevServerConfig = Object.assign(Object.assign({ host: '127.0.0.1', port: 'auto' }, finalRspackConfig === null || finalRspackConfig === void 0 ? void 0 : finalRspackConfig.devServer), { devMiddleware: {
            publicPath: devServerPublicPathRoute,
            stats: (_a = finalRspackConfig.stats) !== null && _a !== void 0 ? _a : 'minimal',
        }, hot: false, 
        // Only enable file watching & reload when executing tests in `open` mode
        liveReload: isOpenMode, client: {
            overlay: false,
        } });
    const server = new RspackDevServer(rspackDevServerConfig, rspackCompiler);
    return { server, compiler: rspackCompiler };
}
exports.createRspackDevServer = createRspackDevServer;
