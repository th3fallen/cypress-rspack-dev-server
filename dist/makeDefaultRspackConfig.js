"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCypressRspackConfig = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const core_1 = require("@rspack/core");
const CypressCTRspackPlugin_1 = require("./CypressCTRspackPlugin");
const debug = (0, debug_1.default)('cypress-rspack-dev-server:makeDefaultRspackConfig');
const OUTPUT_PATH = path_1.default.join(__dirname, 'dist');
const OsSeparatorRE = RegExp(`\\${path_1.default.sep}`, 'g');
const posixSeparator = '/';
function makeCypressRspackConfig(config) {
    const { devServerConfig: { cypressConfig: { projectRoot, devServerPublicPathRoute, supportFile, indexHtmlFile, isTextTerminal: isRunMode, }, specs: files, devServerEvents, }, sourceRspackModulesResult: { rspack: { module: rspack }, }, } = config;
    const optimization = {
        // To prevent files from being tree shaken by rspack, we set optimization.sideEffects: false ensuring that
        // rspack does not recognize the sideEffects flag in the package.json and thus files are not unintentionally
        // dropped during testing in production mode.
        sideEffects: false,
        splitChunks: {
            chunks: 'all',
        },
    };
    const publicPath = path_1.default.sep === posixSeparator
        ? path_1.default.join(devServerPublicPathRoute, posixSeparator)
        : // The second line here replaces backslashes on windows with posix compatible slash
            // See https://github.com/cypress-io/cypress/issues/16097
            path_1.default.join(devServerPublicPathRoute, posixSeparator).replace(OsSeparatorRE, posixSeparator);
    const finalConfig = {
        mode: 'development',
        optimization,
        output: {
            filename: '[name].js',
            path: OUTPUT_PATH,
            publicPath,
        },
        plugins: [
            new core_1.HtmlRspackPlugin({
                template: indexHtmlFile,
                filename: 'index.html',
            }),
            new CypressCTRspackPlugin_1.CypressCTRspackPlugin({
                files,
                projectRoot,
                devServerEvents,
                supportFile,
                rspack,
                indexHtmlFile,
            }),
        ],
        devtool: 'inline-source-map',
    };
    if (isRunMode) {
        // Disable file watching when executing tests in `run` mode
        finalConfig.watchOptions = {
            ignored: '**/*',
        };
    }
    return finalConfig;
}
exports.makeCypressRspackConfig = makeCypressRspackConfig;
