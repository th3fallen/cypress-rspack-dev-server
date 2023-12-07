import debugLib from 'debug'
import type { Configuration } from '@rspack/dev-server'
import type { DevServerConfig } from './devServer'
import type { SourceRelativeRspackResult } from './helpers/sourceRelativeRspackModules'
import { makeRspackConfig } from './makeRspackConfig'

const debug = debugLib('cypress:rspack-dev-server:start')

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
  devServerConfig: DevServerConfig
  /**
   * Result of sourcing the rspack from the
   */
  sourceRspackModulesResult: SourceRelativeRspackResult
  /**
   * Framework-specific config overrides
   */
  frameworkConfig?: unknown
}

export async function createRspackDevServer(config: CreateFinalRspackConfig) {
  const {
    sourceRspackModulesResult: {
      rspack: { module: rspack },
      rspackDevServer: { majorVersion: rspackDevServerMajorVersion },
    },
  } = config

  const finalRspackConfig = await makeRspackConfig(config)
  const rspackCompiler = rspack(finalRspackConfig, undefined)

  const {
    devServerConfig: {
      cypressConfig: { devServerPublicPathRoute },
    },
  } = config
  const isOpenMode = !config.devServerConfig.cypressConfig.isTextTerminal
  const RspackDevServer = config.sourceRspackModulesResult.rspackDevServer.module
  const rspackDevServerConfig: Configuration = {
    host: '127.0.0.1',
    port: 'auto',
    // @ts-ignore
    ...finalRspackConfig?.devServer,
    devMiddleware: {
      publicPath: devServerPublicPathRoute,
      stats: finalRspackConfig.stats ?? 'minimal',
    },
    hot: false,
    // Only enable file watching & reload when executing tests in `open` mode
    liveReload: isOpenMode,
    client: {
      overlay: false,
    },
  }

  const server = new RspackDevServer(rspackDevServerConfig, rspackCompiler)

  return {
    server,
    compiler: rspackCompiler,
  }

  throw new Error(`Unsupported rspackDevServer version ${rspackDevServerMajorVersion}`)
}
