"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCypressWebpackConfig = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const CypressCTRspackPlugin_1 = require("./CypressCTRspackPlugin");
const debug = (0, debug_1.default)('cypress:rspack-dev-server:makeDefaultRspackConfig');
const OUTPUT_PATH = path_1.default.join(__dirname, 'dist');
const OsSeparatorRE = RegExp(`\\${path_1.default.sep}`, 'g');
const posixSeparator = '/';
function makeCypressWebpackConfig(config) {
    const { devServerConfig: { cypressConfig: { projectRoot, devServerPublicPathRoute, supportFile, indexHtmlFile, isTextTerminal: isRunMode, }, specs: files, devServerEvents, framework, }, sourceRspackModulesResult: { rspack: { module: webpack, majorVersion: webpackMajorVersion, }, rspackDevServer: { majorVersion: webpackDevServerMajorVersion, }, }, } = config;
    const optimization = {
        // To prevent files from being tree shaken by rspack, we set optimization.sideEffects: false ensuring that
        // rspack does not recognize the sideEffects flag in the package.json and thus files are not unintentionally
        // dropped during testing in production mode.
        sideEffects: false,
        splitChunks: {
            chunks: 'all',
        },
    };
    const publicPath = (path_1.default.sep === posixSeparator)
        ? path_1.default.join(devServerPublicPathRoute, posixSeparator)
        // The second line here replaces backslashes on windows with posix compatible slash
        // See https://github.com/cypress-io/cypress/issues/16097
        : path_1.default.join(devServerPublicPathRoute, posixSeparator)
            .replace(OsSeparatorRE, posixSeparator);
    const finalConfig = {
        mode: 'development',
        optimization,
        output: {
            filename: '[name].js',
            path: OUTPUT_PATH,
            publicPath,
        },
        builtins: {
            html: [
                {
                    template: indexHtmlFile,
                    filename: 'index.html',
                },
            ],
        },
        plugins: [
            new CypressCTRspackPlugin_1.CypressCTRspackPlugin({
                files,
                projectRoot,
                devServerEvents,
                supportFile,
                rspack: webpack,
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
    // @ts-ignore
    return Object.assign({}, finalConfig);
}
exports.makeCypressWebpackConfig = makeCypressWebpackConfig;
