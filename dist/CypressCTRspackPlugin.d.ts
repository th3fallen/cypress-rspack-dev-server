import type { EventEmitter } from 'events';
export interface CypressCTRspackPluginOptions {
    files: Cypress.Cypress['spec'][];
    projectRoot: string;
    supportFile: string | false;
    devServerEvents: EventEmitter;
    indexHtmlFile: string;
}
export type CypressCTContextOptions = Omit<CypressCTRspackPluginOptions, 'devServerEvents'>;
export interface CypressCTRspackContext {
    _cypress: CypressCTContextOptions;
}
export declare const normalizeError: (error: Error | string) => string;
