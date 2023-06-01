import path from 'path';
import debugLib from 'debug';
import type { Configuration } from '@rspack/core';
import type { CreateFinalRspackConfig } from './createRspackDevServer';
import { CypressCTRspackPlugin } from './CypressCTRspackPlugin';

const debug = debugLib('cypress:rspack-dev-server:makeDefaultRspackConfig');

const OUTPUT_PATH = path.join(__dirname, 'dist');

const OsSeparatorRE = RegExp(`\\${path.sep}`, 'g');
const posixSeparator = '/';

export function makeCypressWebpackConfig(
  config: CreateFinalRspackConfig,
): Configuration {
  const {
    devServerConfig: {
      cypressConfig: {
        projectRoot,
        devServerPublicPathRoute,
        supportFile,
        indexHtmlFile,
        isTextTerminal: isRunMode,
      },
      specs: files,
      devServerEvents,
      framework,
    },
    sourceRspackModulesResult: {
      rspack: {
        module: webpack,
        majorVersion: webpackMajorVersion,
      },
      rspackDevServer: {
        majorVersion: webpackDevServerMajorVersion,
      },
    },
  } = config;


  const optimization: Record<string, any> = {
    // To prevent files from being tree shaken by rspack, we set optimization.sideEffects: false ensuring that
    // rspack does not recognize the sideEffects flag in the package.json and thus files are not unintentionally
    // dropped during testing in production mode.
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
    },
  };

  const publicPath = (path.sep === posixSeparator)
    ? path.join(devServerPublicPathRoute, posixSeparator)
    // The second line here replaces backslashes on windows with posix compatible slash
    // See https://github.com/cypress-io/cypress/issues/16097
    : path.join(devServerPublicPathRoute, posixSeparator)
      .replace(OsSeparatorRE, posixSeparator);

  const finalConfig = {
    mode: 'development',
    optimization,
    output: {
      filename: '[name].js',
      path: OUTPUT_PATH,
      publicPath,
    },
    builtins: {
      html: [
        {
          template: indexHtmlFile,
          filename: 'index.html',
        },
      ],
    },
    plugins: [
      new CypressCTRspackPlugin({
        files,
        projectRoot,
        devServerEvents,
        supportFile,
        webpack,
        indexHtmlFile,
      }),
    ],
    devtool: 'inline-source-map',
  } as any;

  if (isRunMode) {
    // Disable file watching when executing tests in `run` mode
    finalConfig.watchOptions = {
      ignored: '**/*',
    };
  }

  // @ts-ignore
  return {
    ...finalConfig,
  };
}
