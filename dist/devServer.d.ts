import type { EventEmitter } from 'events';
import type { RspackDevServer } from '@rspack/dev-server';
import type { Configuration } from '@rspack/core';
import { SourceRelativeRspackResult } from './helpers/sourceRelativeRspackModules';
export type Frameworks = Extract<Cypress.DevServerConfigOptions, {
    bundler: 'webpack';
}>['framework'];
type FrameworkConfig = {
    framework?: Exclude<Frameworks, 'angular'>;
} | {
    framework: 'angular';
    options?: {
        projectConfig: Cypress.AngularDevServerProjectConfig;
    };
};
export type ConfigHandler = Partial<Configuration> | (() => Partial<Configuration> | Promise<Partial<Configuration>>);
export type DevServerConfig = {
    specs: Cypress.Spec[];
    cypressConfig: Cypress.PluginConfigOptions;
    devServerEvents: EventEmitter;
    onConfigNotFound?: (devServer: 'rspack', cwd: string, lookedIn: string[]) => void;
    rspackConfig?: ConfigHandler;
} & FrameworkConfig;
/**
 * import { RspackDevServer } from '@rspack/dev-server'
 *
 * Creates & returns a RspackDevServer for serving files related
 * to Cypress Component Testing
 *
 * @param config
 */
export declare function devServer(devServerConfig: DevServerConfig): Promise<Cypress.ResolvedDevServerConfig>;
export declare namespace devServer {
    var create: (devServerConfig: DevServerConfig) => Promise<{
        server: RspackDevServer;
        compiler: any;
    }>;
}
export type PresetHandlerResult = {
    frameworkConfig: Configuration;
    sourceRspackModulesResult: SourceRelativeRspackResult;
};
export declare function isThirdPartyDefinition(framework: string): boolean;
export default devServer;
