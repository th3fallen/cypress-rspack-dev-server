/// <reference types="node" />
import Module from 'module';
import type { DevServerConfig } from '../devServer';
import type { RspackDevServer } from '@rspack/dev-server';
export type ModuleClass = typeof Module & {
    _load(id: string, parent: Module, isMain: boolean): any;
    _resolveFilename(request: string, parent: Module, isMain: boolean, options?: {
        paths: string[];
    }): string;
    _cache: Record<string, Module>;
};
export interface PackageJson {
    name: string;
    version: string;
}
export interface SourcedDependency {
    importPath: string;
    packageJson: PackageJson;
}
export interface SourcedRspack extends SourcedDependency {
    module: Function;
}
export interface SourcedRspackDevServer extends SourcedDependency {
    module: {
        new (...args: unknown[]): RspackDevServer;
    };
}
export interface SourceRelativeRspackResult {
    framework: SourcedDependency | null;
    rspack: SourcedRspack;
    rspackDevServer: SourcedRspackDevServer;
}
export declare const cypressRspackPath: (config: DevServerConfig) => string;
export declare function sourceFramework(config: DevServerConfig): SourcedDependency | null;
export declare function sourceRspack(config: DevServerConfig, framework: SourcedDependency | null): SourcedRspack;
export declare function sourceRspackDevServer(config: DevServerConfig, framework?: SourcedDependency | null): SourcedRspackDevServer;
export declare function sourceDefaultRspackDependencies(config: DevServerConfig): SourceRelativeRspackResult;
export declare function restoreLoadHook(): void;
