/// <reference types="cypress" />
/// <reference types="cypress" />
/// <reference types="node" />
import type { Configuration } from '@rspack/core';
import { SourceRelativeRspackResult } from './helpers/sourceRelativeRspackModules';
import type { RspackDevServer } from '@rspack/dev-server';
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
    devServerEvents: NodeJS.EventEmitter;
    onConfigNotFound?: (devServer: 'webpack', cwd: string, lookedIn: string[]) => void;
    rspackConfig?: ConfigHandler;
} & FrameworkConfig;
/**
 * import { devServer } from '@cypress/rspack-dev-server'
 *
 * Creates & returns a WebpackDevServer for serving files related
 * to Cypress Component Testing
 *
 * @param config
 */
export declare function devServer(devServerConfig: DevServerConfig): Promise<Cypress.ResolvedDevServerConfig>;
export declare namespace devServer {
    var create: (devServerConfig: DevServerConfig) => Promise<{
        server: RspackDevServer;
        compiler: any;
        version: 0;
    }>;
}
export type PresetHandlerResult = {
    frameworkConfig: Configuration;
    sourceRspackModulesResult: SourceRelativeRspackResult;
};
export declare function isThirdPartyDefinition(framework: string): boolean;
export default devServer;
