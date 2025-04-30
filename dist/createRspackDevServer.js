"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRspackDevServer = createRspackDevServer;
const makeRspackConfig_1 = require("./makeRspackConfig");
async function createRspackDevServer(config) {
    var _a;
    const { sourceRspackModulesResult: { rspack: { module: rspack }, rspackDevServer: { module: RspackDevServer }, }, devServerConfig: { cypressConfig: { devServerPublicPathRoute, isTextTerminal }, }, } = config;
    const finalRspackConfig = await (0, makeRspackConfig_1.makeRspackConfig)(config);
    const rspackCompiler = rspack(finalRspackConfig);
    const isOpenMode = !isTextTerminal;
    const rspackDevServerConfig = Object.assign(Object.assign({ host: '127.0.0.1', port: 'auto' }, finalRspackConfig.devServer), { devMiddleware: {
            publicPath: devServerPublicPathRoute,
            stats: (_a = finalRspackConfig.stats) !== null && _a !== void 0 ? _a : 'minimal',
        }, hot: false, 
        // Only enable file watching & reload when executing tests in `open` mode
        liveReload: isOpenMode, client: { overlay: false } });
    const server = new RspackDevServer(rspackDevServerConfig, rspackCompiler);
    return { server, compiler: rspackCompiler };
}
