import type { Compilation, Compiler } from '@rspack/core';
import type { EventEmitter } from 'events';
import isEqual from 'lodash/isEqual';
import fs, { PathLike } from 'fs-extra';
import path from 'path';
import debugLib from 'debug';

const debug = debugLib('cypress:rspack-dev-server:rspackPlugin');

type UtimesSync = (path: PathLike, atime: string | number | Date, mtime: string | number | Date) => void

export interface CypressCTRspackPluginOptions {
  files: Cypress.Cypress['spec'][];
  projectRoot: string;
  supportFile: string | false;
  devServerEvents: EventEmitter;
  webpack: Function;
  indexHtmlFile: string;
}

export type CypressCTContextOptions = Omit<CypressCTRspackPluginOptions, 'devServerEvents' | 'webpack'>

export interface CypressCTRspackContext {
  _cypress: CypressCTContextOptions;
}

/**
 * @internal
 */
export type RspackCompilation = Compilation & {
  inputFileSystem: {
    fileSystem: {
      utimesSync: UtimesSync
    }
  }
}

export const normalizeError = (error: Error | string) => {
  return typeof error === 'string' ? error : error.message;
};

/**
 * A rspack 4/5 compatible Cypress Component Testing Plugin
 *
 * @internal
 */
export class CypressCTRspackPlugin {
  private files: Cypress.Cypress['spec'][] = [];
  private supportFile: string | false;
  private compilation: RspackCompilation | null = null;
  private webpack: Function;
  private indexHtmlFile: string;

  private readonly projectRoot: string;
  private readonly devServerEvents: EventEmitter;

  constructor(options: CypressCTRspackPluginOptions) {
    this.files = options.files;
    this.supportFile = options.supportFile;
    this.projectRoot = options.projectRoot;
    this.devServerEvents = options.devServerEvents;
    this.webpack = options.webpack;
    this.indexHtmlFile = options.indexHtmlFile;
  }

  private addLoaderContext = (loaderContext: object, module: any) => {
    (loaderContext as CypressCTRspackContext)._cypress = {
      files: this.files,
      projectRoot: this.projectRoot,
      supportFile: this.supportFile,
      indexHtmlFile: this.indexHtmlFile,
    };
  };

  private beforeCompile = async (compilationParams: object, callback: Function) => {
    if (!this.compilation) {
      callback();

      return;
    }

    // Ensure we don't try to load files that have been removed from the file system
    // but have not yet been detected by the onSpecsChange handler

    const foundFiles = (await Promise.all(this.files.map(async (file) => {
      try {
        const exists = await fs.pathExists(file.absolute);

        return exists ? file : null;
      } catch (e) {
        return null;
      }
    })));

    this.files = foundFiles.filter((file) => file !== null) as Cypress.Spec[];

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
  private onSpecsChange = async (specs: Cypress.Cypress['spec'][]) => {
    if (!this.compilation ||isEqual(specs, this.files)) {
      return;
    }

    this.files = specs;
    const inputFileSystem = this.compilation.inputFileSystem;
    // TODO: don't use a sync fs method here
    // eslint-disable-next-line no-restricted-syntax
    const utimesSync: UtimesSync = inputFileSystem.fileSystem.utimesSync ?? fs.utimesSync;

    utimesSync(path.join(this.projectRoot, this.indexHtmlFile), new Date(), new Date());
  };

  /**
   * The rspack compiler generates a new `compilation` each time it compiles, so
   * we have to apply hooks to it fresh each time
   *
   * @param compilation rspack 4 `compilation.Compilation`, rspack 5
   *   `Compilation`
   */
  private addCompilationHooks = (compilation: RspackCompilation) => {
    this.compilation = compilation;

    /* istanbul ignore next */
    if ('NormalModule' in this.compilation.compiler.webpack) {
      const loader = (this.compilation.compiler.webpack as Compiler['webpack']).NormalModule.getCompilationHooks(compilation).loader;
      debug(loader);
      loader.tap('CypressCTPlugin', this.addLoaderContext);
    }
  };

  /**
   * The plugin's entrypoint, called once by rspack when the compiler is initialized.
   */
  apply(compiler: unknown): void {
    const _compiler = compiler as Compiler;

    this.devServerEvents.on('dev-server:specs:changed', this.onSpecsChange);
    _compiler.hooks.beforeCompile.tapAsync('CypressCTPlugin', this.beforeCompile);
    _compiler.hooks.compilation.tap('CypressCTPlugin', (compilation) => this.addCompilationHooks(compilation as RspackCompilation));
    _compiler.hooks.done.tap('CypressCTPlugin', () => {
      this.devServerEvents.emit('dev-server:compile:success');
    });
  }
}
