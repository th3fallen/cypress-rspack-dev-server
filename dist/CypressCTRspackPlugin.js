"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CypressCTRspackPlugin = exports.normalizeError = void 0;
const tslib_1 = require("tslib");
const isEqual_1 = tslib_1.__importDefault(require("lodash/isEqual"));
const fs_extra_1 = tslib_1.__importDefault(require("fs-extra"));
const path_1 = tslib_1.__importDefault(require("path"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const debug = (0, debug_1.default)('cypress-rspack-dev-server:rspackPlugin');
const normalizeError = (error) => {
    return typeof error === 'string' ? error : error.message;
};
exports.normalizeError = normalizeError;
/**
 * A rspack compatible Cypress Component Testing Plugin
 *
 * @internal
 */
class CypressCTRspackPlugin {
    constructor(options) {
        this.files = [];
        this.compilation = null;
        this.addLoaderContext = (loaderContext) => {
            ;
            loaderContext._cypress = {
                files: this.files,
                projectRoot: this.projectRoot,
                supportFile: this.supportFile,
                indexHtmlFile: this.indexHtmlFile,
            };
        };
        this.beforeCompile = async (compilationParams, callback) => {
            if (!this.compilation) {
                callback();
                return;
            }
            // Ensure we don't try to load files that have been removed from the file system
            // but have not yet been detected by the onSpecsChange handler
            const foundFiles = await Promise.all(this.files.map(async (file) => {
                try {
                    const exists = await fs_extra_1.default.pathExists(file.absolute);
                    return exists ? file : null;
                }
                catch (e) {
                    return null;
                }
            }));
            this.files = foundFiles.filter((file) => file !== null);
            callback();
        };
        /*
         * `rspack --watch` watches the existing specs and their dependencies for changes.
         * When new specs are created, we need to trigger a recompilation to add the new specs
         * as dependencies. This hook informs rspack that `component-index.html` has been "updated on disk",
         * causing a recompilation (and pulling the new specs in as dependencies). We use the component
         * index file because we know that it will be there since the project is using Component Testing.
         *
         * We were using `browser.js` before to cause a recompilation but we ran into an
         * issue with MacOS Ventura that will not allow us to write to files inside of our application bundle.
         *
         * See https://github.com/cypress-io/cypress/issues/24398
         */
        this.onSpecsChange = async (specs) => {
            var _a;
            if (!this.compilation || (0, isEqual_1.default)(specs, this.files)) {
                return;
            }
            this.files = specs;
            const inputFileSystem = this.compilation.inputFileSystem;
            // TODO: don't use a sync fs method here
            const utimesSync = (_a = inputFileSystem.fileSystem.utimesSync) !== null && _a !== void 0 ? _a : fs_extra_1.default.utimesSync;
            utimesSync(path_1.default.join(this.projectRoot, this.indexHtmlFile), new Date(), new Date());
        };
        /**
         * The rspack compiler generates a new `compilation` each time it compiles, so
         * we have to apply hooks to it fresh each time
         *
         * @param compilation `RspackCompilation`
         */
        this.addCompilationHooks = (compilation) => {
            this.compilation = compilation;
            /* istanbul ignore next */
            if ('NormalModule' in this.compilation.compiler.webpack) {
                const loader = this.compilation.compiler.webpack.NormalModule.getCompilationHooks(compilation).loader;
                loader.tap('CypressCTPlugin', this.addLoaderContext);
            }
        };
        this.files = options.files;
        this.supportFile = options.supportFile;
        this.projectRoot = options.projectRoot;
        this.devServerEvents = options.devServerEvents;
        this.rspack = options.rspack;
        this.indexHtmlFile = options.indexHtmlFile;
    }
    /**
     * The plugin's entrypoint, called once by rspack when the compiler is initialized.
     */
    apply(compiler) {
        const _compiler = compiler;
        this.devServerEvents.on('dev-server:specs:changed', this.onSpecsChange);
        _compiler.hooks.beforeCompile.tapAsync('CypressCTPlugin', this.beforeCompile);
        _compiler.hooks.compilation.tap('CypressCTPlugin', (compilation) => this.addCompilationHooks(compilation));
        _compiler.hooks.done.tap('CypressCTPlugin', () => {
            this.devServerEvents.emit('dev-server:compile:success');
        });
    }
}
exports.CypressCTRspackPlugin = CypressCTRspackPlugin;
