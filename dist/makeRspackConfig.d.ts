/// <reference types="node" />
import type { CreateFinalRspackConfig } from './createRspackDevServer';
export declare const CYPRESS_RSPACK_ENTRYPOINT: string;
/**
 * Creates a rspack compatible rspack "configuration"
 * to pass to the sourced rspack function
 */
export declare function makeRspackConfig(config: CreateFinalRspackConfig): Promise<{
    name?: string | undefined;
    dependencies?: string[] | undefined;
    entry?: string | string[] | Record<string, string | string[] | {
        import: (string | string[]) & (string | string[] | undefined);
        runtime?: string | false | undefined;
        publicPath?: string | undefined;
        baseUri?: string | undefined;
        chunkLoading?: string | false | undefined;
        asyncChunks?: boolean | undefined;
        wasmLoading?: string | false | undefined;
        filename?: string | undefined;
        library?: {
            type: string;
            amdContainer?: string | undefined;
            auxiliaryComment?: string | {
                amd?: string | undefined;
                commonjs?: string | undefined;
                commonjs2?: string | undefined;
                root?: string | undefined;
            } | undefined;
            export?: string | string[] | undefined;
            name?: string | string[] | {
                amd?: string | undefined;
                commonjs?: string | undefined;
                root?: string | string[] | undefined;
            } | undefined;
            umdNamedDefine?: boolean | undefined;
        } | undefined;
    }> | undefined;
    output?: {
        path?: string | undefined;
        clean?: boolean | undefined;
        publicPath?: string | undefined;
        filename?: string | undefined;
        chunkFilename?: string | undefined;
        crossOriginLoading?: false | "anonymous" | "use-credentials" | undefined;
        cssFilename?: string | undefined;
        cssChunkFilename?: string | undefined;
        hotUpdateMainFilename?: string | undefined;
        hotUpdateChunkFilename?: string | undefined;
        hotUpdateGlobal?: string | undefined;
        assetModuleFilename?: string | undefined;
        uniqueName?: string | undefined;
        chunkLoadingGlobal?: string | undefined;
        enabledLibraryTypes?: string[] | undefined;
        library?: string | string[] | {
            amd?: string | undefined;
            commonjs?: string | undefined;
            root?: string | string[] | undefined;
        } | {
            type: string;
            amdContainer?: string | undefined;
            auxiliaryComment?: string | {
                amd?: string | undefined;
                commonjs?: string | undefined;
                commonjs2?: string | undefined;
                root?: string | undefined;
            } | undefined;
            export?: string | string[] | undefined;
            name?: string | string[] | {
                amd?: string | undefined;
                commonjs?: string | undefined;
                root?: string | string[] | undefined;
            } | undefined;
            umdNamedDefine?: boolean | undefined;
        } | undefined;
        libraryExport?: string | string[] | undefined;
        libraryTarget?: string | undefined;
        umdNamedDefine?: boolean | undefined;
        amdContainer?: string | undefined;
        auxiliaryComment?: string | {
            amd?: string | undefined;
            commonjs?: string | undefined;
            commonjs2?: string | undefined;
            root?: string | undefined;
        } | undefined;
        module?: boolean | undefined;
        strictModuleErrorHandling?: boolean | undefined;
        globalObject?: string | undefined;
        importFunctionName?: string | undefined;
        iife?: boolean | undefined;
        wasmLoading?: string | false | undefined;
        enabledWasmLoadingTypes?: string[] | undefined;
        webassemblyModuleFilename?: string | undefined;
        chunkFormat?: string | false | undefined;
        chunkLoading?: string | false | undefined;
        enabledChunkLoadingTypes?: string[] | undefined;
        trustedTypes?: string | true | {
            policyName?: string | undefined;
        } | undefined;
        sourceMapFilename?: string | undefined;
        hashDigest?: string | undefined;
        hashDigestLength?: number | undefined;
        hashFunction?: string | undefined;
        hashSalt?: string | undefined;
        asyncChunks?: boolean | undefined;
        workerChunkLoading?: string | false | undefined;
        workerWasmLoading?: string | false | undefined;
        workerPublicPath?: string | undefined;
    } | undefined;
    target?: false | "node" | "async-node" | "web" | "webworker" | "es3" | "es5" | "es2015" | "es2016" | "es2017" | "es2018" | "es2019" | "es2020" | "es2021" | "es2022" | "browserslist" | `node${number}` | `async-node${number}` | `node${number}.${number}` | `async-node${number}.${number}` | "electron-main" | `electron${number}-main` | `electron${number}.${number}-main` | "electron-renderer" | `electron${number}-renderer` | `electron${number}.${number}-renderer` | "electron-preload" | `electron${number}-preload` | `electron${number}.${number}-preload` | ("node" | "async-node" | "web" | "webworker" | "es3" | "es5" | "es2015" | "es2016" | "es2017" | "es2018" | "es2019" | "es2020" | "es2021" | "es2022" | "browserslist" | `node${number}` | `async-node${number}` | `node${number}.${number}` | `async-node${number}.${number}` | "electron-main" | `electron${number}-main` | `electron${number}.${number}-main` | "electron-renderer" | `electron${number}-renderer` | `electron${number}.${number}-renderer` | "electron-preload" | `electron${number}-preload` | `electron${number}.${number}-preload`)[] | undefined;
    mode?: "none" | "development" | "production" | undefined;
    experiments?: {
        lazyCompilation?: boolean | undefined;
        incrementalRebuild?: boolean | {
            make?: boolean | undefined;
            emitAsset?: boolean | undefined;
        } | undefined;
        asyncWebAssembly?: boolean | undefined;
        outputModule?: boolean | undefined;
        topLevelAwait?: boolean | undefined;
        newSplitChunks?: boolean | undefined;
        css?: boolean | undefined;
        futureDefaults?: boolean | undefined;
        rspackFuture?: {
            newResolver?: boolean | undefined;
            newTreeshaking?: boolean | undefined;
            disableTransformByDefault?: boolean | undefined;
        } | undefined;
    } | undefined;
    externals?: string | RegExp | Record<string, string | boolean | string[] | Record<string, string | string[]>> | ((args_0: {
        context?: string | undefined;
        dependencyType?: string | undefined;
        request?: string | undefined;
    }, args_1: (args_0: Error | undefined, args_1: string | boolean | string[] | Record<string, string | string[]> | undefined, args_2: "module" | "promise" | "jsonp" | "import" | "amd" | "commonjs" | "commonjs2" | "var" | "assign" | "this" | "window" | "self" | "global" | "commonjs-module" | "commonjs-static" | "amd-require" | "umd" | "umd2" | "system" | "script" | "node-commonjs" | undefined, ...args_3: unknown[]) => void, ...args_2: unknown[]) => unknown) | ((args_0: {
        context?: string | undefined;
        dependencyType?: string | undefined;
        request?: string | undefined;
    }, ...args_1: unknown[]) => Promise<string | boolean | string[] | Record<string, string | string[]>>) | (string | RegExp | Record<string, string | boolean | string[] | Record<string, string | string[]>> | ((args_0: {
        context?: string | undefined;
        dependencyType?: string | undefined;
        request?: string | undefined;
    }, args_1: (args_0: Error | undefined, args_1: string | boolean | string[] | Record<string, string | string[]> | undefined, args_2: "module" | "promise" | "jsonp" | "import" | "amd" | "commonjs" | "commonjs2" | "var" | "assign" | "this" | "window" | "self" | "global" | "commonjs-module" | "commonjs-static" | "amd-require" | "umd" | "umd2" | "system" | "script" | "node-commonjs" | undefined, ...args_3: unknown[]) => void, ...args_2: unknown[]) => unknown) | ((args_0: {
        context?: string | undefined;
        dependencyType?: string | undefined;
        request?: string | undefined;
    }, ...args_1: unknown[]) => Promise<string | boolean | string[] | Record<string, string | string[]>>))[] | undefined;
    externalsType?: "module" | "promise" | "jsonp" | "import" | "amd" | "commonjs" | "commonjs2" | "var" | "assign" | "this" | "window" | "self" | "global" | "commonjs-module" | "commonjs-static" | "amd-require" | "umd" | "umd2" | "system" | "script" | "node-commonjs" | undefined;
    externalsPresets?: {
        node?: boolean | undefined;
        web?: boolean | undefined;
        webAsync?: boolean | undefined;
        electron?: boolean | undefined;
        electronMain?: boolean | undefined;
        electronPreload?: boolean | undefined;
        electronRenderer?: boolean | undefined;
    } | undefined;
    infrastructureLogging?: {
        appendOnly?: boolean | undefined;
        colors?: boolean | undefined;
        console?: Console | undefined;
        debug?: string | boolean | RegExp | ((args_0: string, ...args_1: unknown[]) => boolean) | (string | RegExp | ((args_0: string, ...args_1: unknown[]) => boolean))[] | undefined;
        level?: "none" | "verbose" | "error" | "warn" | "info" | "log" | undefined;
        stream?: NodeJS.WritableStream | undefined;
    } | undefined;
    cache?: boolean | undefined;
    context?: string | undefined;
    devtool?: false | "cheap-source-map" | "cheap-module-source-map" | "source-map" | "inline-cheap-source-map" | "inline-cheap-module-source-map" | "inline-source-map" | "inline-nosources-cheap-module-source-map" | "inline-nosources-source-map" | "nosources-cheap-source-map" | "nosources-cheap-module-source-map" | "nosources-source-map" | "hidden-nosources-cheap-source-map" | "hidden-nosources-cheap-module-source-map" | "hidden-nosources-source-map" | "hidden-cheap-source-map" | "hidden-cheap-module-source-map" | "hidden-source-map" | "eval-cheap-source-map" | "eval-cheap-module-source-map" | "eval-source-map" | "eval-nosources-cheap-source-map" | "eval-nosources-cheap-module-source-map" | "eval-nosources-source-map" | undefined;
    node?: false | {
        __dirname?: boolean | "warn-mock" | "mock" | "eval-only" | undefined;
        __filename?: boolean | "warn-mock" | "mock" | "eval-only" | undefined;
        global?: boolean | "warn" | undefined;
    } | undefined;
    ignoreWarnings?: (RegExp | ((args_0: Error, args_1: import("@rspack/core").Compilation, ...args_2: unknown[]) => boolean))[] | undefined;
    watchOptions?: {
        aggregateTimeout?: number | undefined;
        followSymlinks?: boolean | undefined;
        ignored?: string | RegExp | string[] | undefined;
        poll?: number | boolean | undefined;
        stdin?: boolean | undefined;
    } | undefined;
    watch?: boolean | undefined;
    stats?: boolean | "none" | "normal" | "verbose" | "errors-only" | "errors-warnings" | {
        all?: boolean | undefined;
        preset?: "none" | "normal" | "verbose" | "errors-only" | "errors-warnings" | undefined;
        assets?: boolean | undefined;
        chunks?: boolean | undefined;
        modules?: boolean | undefined;
        entrypoints?: boolean | undefined;
        chunkGroups?: boolean | undefined;
        warnings?: boolean | undefined;
        warningsCount?: boolean | undefined;
        errors?: boolean | undefined;
        errorsCount?: boolean | undefined;
        colors?: boolean | undefined;
        hash?: boolean | undefined;
        version?: boolean | undefined;
        reasons?: boolean | undefined;
        publicPath?: boolean | undefined;
        outputPath?: boolean | undefined;
        chunkModules?: boolean | undefined;
        chunkRelations?: boolean | undefined;
        ids?: boolean | undefined;
        timings?: boolean | undefined;
        builtAt?: boolean | undefined;
        moduleAssets?: boolean | undefined;
        modulesSpace?: number | undefined;
        nestedModules?: boolean | undefined;
        source?: boolean | undefined;
        logging?: boolean | "none" | "verbose" | "error" | "warn" | "info" | "log" | undefined;
        loggingDebug?: string | boolean | RegExp | ((args_0: string, ...args_1: unknown[]) => boolean) | (string | RegExp | ((args_0: string, ...args_1: unknown[]) => boolean))[] | undefined;
        loggingTrace?: boolean | undefined;
        runtimeModules?: boolean | undefined;
    } | undefined;
    snapshot?: {
        module?: {
            hash?: boolean | undefined;
            timestamp?: boolean | undefined;
        } | undefined;
        resolve?: {
            hash?: boolean | undefined;
            timestamp?: boolean | undefined;
        } | undefined;
    } | undefined;
    optimization?: {
        moduleIds?: "named" | "deterministic" | undefined;
        chunkIds?: "named" | "deterministic" | undefined;
        minimize?: boolean | undefined;
        minimizer?: (import("@rspack/core").RspackPluginInstance | import("@rspack/core").RspackPluginFunction | "...")[] | undefined;
        splitChunks?: {
            chunks?: RegExp | "all" | "async" | "initial" | undefined;
            minChunks?: number | undefined;
            name?: string | false | undefined;
            minSize?: number | undefined;
            maxSize?: number | undefined;
            maxAsyncSize?: number | undefined;
            maxInitialSize?: number | undefined;
            cacheGroups?: Record<string, false | {
                chunks?: RegExp | "all" | "async" | "initial" | undefined;
                minChunks?: number | undefined;
                name?: string | false | undefined;
                minSize?: number | undefined;
                maxSize?: number | undefined;
                maxAsyncSize?: number | undefined;
                maxInitialSize?: number | undefined;
                test?: string | RegExp | undefined;
                priority?: number | undefined;
                enforce?: boolean | undefined;
                reuseExistingChunk?: boolean | undefined;
                type?: string | RegExp | undefined;
                idHint?: string | undefined;
            }> | undefined;
            maxAsyncRequests?: number | undefined;
            maxInitialRequests?: number | undefined;
            fallbackCacheGroup?: {
                chunks?: RegExp | "all" | "async" | "initial" | undefined;
                minSize?: number | undefined;
                maxSize?: number | undefined;
                maxAsyncSize?: number | undefined;
                maxInitialSize?: number | undefined;
            } | undefined;
        } | undefined;
        runtimeChunk?: boolean | "single" | "multiple" | {
            name?: string | ((...args: unknown[]) => string | undefined) | undefined;
        } | undefined;
        removeAvailableModules?: boolean | undefined;
        removeEmptyChunks?: boolean | undefined;
        realContentHash?: boolean | undefined;
        sideEffects?: boolean | "flag" | undefined;
        providedExports?: boolean | undefined;
        innerGraph?: boolean | undefined;
        usedExports?: boolean | "global" | undefined;
    } | undefined;
    resolve?: import("@rspack/core").ResolveOptions | undefined;
    resolveLoader?: import("@rspack/core").ResolveOptions | undefined;
    plugins?: (import("@rspack/core").RspackPluginInstance | import("@rspack/core").RspackPluginFunction)[] | undefined;
    devServer?: import("@rspack/core").DevServer | undefined;
    builtins?: import("@rspack/core/dist/builtin-plugin").Builtins | undefined;
    module?: {
        defaultRules?: ("..." | import("@rspack/core").RuleSetRule)[] | undefined;
        rules?: ("..." | import("@rspack/core").RuleSetRule)[] | undefined;
        parser?: {
            asset?: {
                dataUrlCondition?: {
                    maxSize?: number | undefined;
                } | undefined;
            } | undefined;
            javascript?: {
                dynamicImportMode?: "eager" | "lazy" | undefined;
            } | undefined;
        } | Record<string, Record<string, any>> | undefined;
        generator?: Record<string, Record<string, any>> | {
            asset?: {
                dataUrl?: {
                    encoding?: false | "base64" | undefined;
                    mimetype?: string | undefined;
                } | undefined;
                filename?: string | undefined;
                publicPath?: string | undefined;
            } | undefined;
            "asset/inline"?: {
                dataUrl?: {
                    encoding?: false | "base64" | undefined;
                    mimetype?: string | undefined;
                } | undefined;
            } | undefined;
            "asset/resource"?: {
                filename?: string | undefined;
                publicPath?: string | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    profile?: boolean | undefined;
}>;
