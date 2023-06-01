import type { CreateFinalRspackConfig } from './createRspackDevServer';
export declare const CYPRESS_RSPACK_ENTRYPOINT: string;
/**
 * Creates a rspack 0 compatible rspack "configuration"
 * to pass to the sourced rspack function
 */
export declare function makeRspackConfig(config: CreateFinalRspackConfig): Promise<import("@rspack/core").RspackOptions>;
