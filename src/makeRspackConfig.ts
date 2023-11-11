import { debug as debugFn } from 'debug';
import * as path from 'path';
import { merge } from 'webpack-merge';
import { importModule } from 'local-pkg';
import type { Configuration, EntryObject } from '@rspack/core';
import { makeCypressWebpackConfig } from './makeDefaultWebpackConfig';
import type { CreateFinalRspackConfig } from './createRspackDevServer';
import { configFiles } from './constants';
import { dynamicImport } from './dynamic-import';

const debug = debugFn('cypress:rspack-dev-server:makeRspackConfig');

const removeList = [
  // We provide a webpack-html-plugin config pinned to a specific version (4.x)
  // that we have tested and are confident works with all common configurations.
  // https://github.com/cypress-io/cypress/issues/15865
  'HtmlWebpackPlugin',

  // We already reload when webpack recompiles (via listeners on
  // devServerEvents). Removing this plugin can prevent double-refreshes
  // in some setups.
  'HotModuleReplacementPlugin',
];

export const CYPRESS_RSPACK_ENTRYPOINT = path.resolve(__dirname, 'browser.js');

/**
 * Removes and/or modifies certain plugins known to conflict
 * when used with cypress/rspack-dev-server.
 */
function modifyRspackConfigForCypress(rspackConfig: Partial<Configuration>) {
  if (rspackConfig?.plugins) {
    rspackConfig.plugins = rspackConfig.plugins.filter(
      (plugin) => !removeList.includes(plugin.constructor.name)
    );
  }

  delete rspackConfig.entry;
  delete rspackConfig.output;

  return rspackConfig;
}

async function getRspackConfigFromProjectRoot(projectRoot: string) {
  const { findUp } = await dynamicImport<typeof import('find-up')>('find-up');

  return await findUp(configFiles, { cwd: projectRoot });
}

/**
 * Creates a rspack 0 compatible rspack "configuration"
 * to pass to the sourced rspack function
 */
export async function makeRspackConfig(
  config: CreateFinalRspackConfig,
) {
  let userRspackConfig = config.devServerConfig.rspackConfig;
  const frameworkRspackConfig = config.frameworkConfig as Partial<Configuration>;
  const {
    cypressConfig: {
      projectRoot,
      supportFile,
    },
    specs: files,
    framework,
  } = config.devServerConfig;

  if (!userRspackConfig && !frameworkRspackConfig) {
    debug('Not user or framework rspack config received. Trying to automatically source it');

    const configFile = await getRspackConfigFromProjectRoot(projectRoot);

    if (configFile) {
      debug('found rspack config %s', configFile);
      const sourcedConfig = await importModule(configFile);

      debug('config contains %o', sourcedConfig);
      if (sourcedConfig && typeof sourcedConfig === 'object') {
        userRspackConfig = sourcedConfig.default ?? sourcedConfig;
      }
    }

    if (!userRspackConfig) {
      debug('could not find rspack.config!');
      if (config.devServerConfig?.onConfigNotFound) {
        config.devServerConfig.onConfigNotFound('webpack', projectRoot, configFiles);
        // The config process will be killed from the parent, but we want to early exit so we don't get
        // any additional errors related to not having a config
        process.exit(0);
      } else {
        throw new Error(`Your Cypress devServer config is missing a required webpackConfig property, since we could not automatically detect one.\nPlease add one to your ${ config.devServerConfig.cypressConfig.configFile }`);
      }
    }
  }

  userRspackConfig = typeof userRspackConfig === 'function'
    ? await userRspackConfig()
    : userRspackConfig;

  const userAndFrameworkWebpackConfig = modifyRspackConfigForCypress(
    merge(frameworkRspackConfig ?? {}, userRspackConfig ?? {}),
  );

  debug(`User passed in user and framework webpack config with values %o`, userAndFrameworkWebpackConfig);
  debug(`New webpack entries %o`, files);
  debug(`Project root`, projectRoot);
  debug(`Support file`, supportFile);

  const mergedConfig = merge(
    userAndFrameworkWebpackConfig,
    makeCypressWebpackConfig(config),
  );

  // Some frameworks (like Next.js) change this value which changes the path we would need to use to fetch our spec.
  // (eg, http://localhost:xxxx/<dev-server-public-path>/static/chunks/spec-<x>.js). Deleting this key to normalize
  // the spec URL to `*/spec-<x>.js` which we need to know up-front so we can fetch the sourcemaps.
  delete mergedConfig.output?.chunkFilename;

  // Angular loads global styles and polyfills via script injection in the index.html
  if (framework === 'angular') {
    mergedConfig.entry = {
      ...(mergedConfig.entry as EntryObject) || {},
      'cypress-entry': CYPRESS_RSPACK_ENTRYPOINT,
    };
  } else {
    mergedConfig.entry = CYPRESS_RSPACK_ENTRYPOINT;
  }

  debug('Merged rspack config %o', mergedConfig);

  return mergedConfig;
}
