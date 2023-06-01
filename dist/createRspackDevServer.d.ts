import type { DevServerConfig } from './devServer';
import type { SourceRelativeRspackResult } from './helpers/sourceRelativeRspackModules';
/**
 * Takes the rspack / rspackDevServer modules, the configuration provide
 * from the framework override (if any), and the configuration provided
 * from the user config (if any) and makes the final config we want to
 * serve into rspack
 */
export interface CreateFinalRspackConfig {
    /**
     * Initial config passed to devServer
     */
    devServerConfig: DevServerConfig;
    /**
     * Result of sourcing the rspack from the
     */
    sourceRspackModulesResult: SourceRelativeRspackResult;
    /**
     * Framework-specific config overrides
     */
    frameworkConfig?: unknown;
}
export declare function createRspackDevServer(config: CreateFinalRspackConfig): Promise<{
    server: import("@rspack/dev-server").RspackDevServer;
    compiler: any;
}>;
