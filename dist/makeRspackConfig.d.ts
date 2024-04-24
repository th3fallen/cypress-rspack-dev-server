import type { Configuration } from '@rspack/core';
import type { CreateFinalRspackConfig } from './createRspackDevServer';
export declare const CYPRESS_RSPACK_ENTRYPOINT: string;
/**
 * Creates a rspack compatible rspack "configuration" to pass to the sourced rspack function
 */
export declare function makeRspackConfig(config: CreateFinalRspackConfig): Promise<Configuration>;
