import debugLib from 'debug'
import type { EventEmitter } from 'events'
import type { RspackDevServer } from '@rspack/dev-server'
import type { Compiler, Configuration } from '@rspack/core'

import { createRspackDevServer } from './createRspackDevServer'
import {
  sourceDefaultRspackDependencies,
  SourceRelativeRspackResult,
} from './helpers/sourceRelativeRspackModules'

const debug = debugLib('cypress-rspack-dev-server:devServer')

export type Frameworks = Extract<
  Cypress.DevServerConfigOptions,
  { bundler: 'webpack' }
>['framework']

type FrameworkConfig =
  | {
      framework?: Exclude<Frameworks, 'angular'>
    }
  | {
      framework: 'angular'
      options?: {
        projectConfig: Cypress.AngularDevServerProjectConfig
      }
    }

type ConfigHandler =
  | Partial<Configuration>
  | (() => Partial<Configuration> | Promise<Partial<Configuration>>)

export type DevServerConfig = {
  specs: Cypress.Spec[]
  cypressConfig: Cypress.PluginConfigOptions
  devServerEvents: EventEmitter
  onConfigNotFound?: (devServer: 'rspack', cwd: string, lookedIn: string[]) => void
  rspackConfig?: ConfigHandler // Derived from the user's rspack config
} & FrameworkConfig

/**
 * @internal
 */
type DevServerCreateResult = {
  server: RspackDevServer
  compiler: Compiler
}

/**
 * import { RspackDevServer } from '@rspack/dev-server'
 *
 * Creates & returns a RspackDevServer for serving files related
 * to Cypress Component Testing
 *
 * @param config
 */
export function devServer(
  devServerConfig: DevServerConfig,
): Promise<Cypress.ResolvedDevServerConfig> {
  return new Promise(async (resolve, reject) => {
    const result = (await devServer.create(devServerConfig)) as DevServerCreateResult

    result.server
      .start()
      .then(() => {
        if (!result.server.options.port) {
          return reject(new Error(`Expected port ${result.server.options.port} to be a number`))
        }

        debug('Component testing rspack server started on port %s', result.server.options.port)

        resolve({
          port: result.server.options.port as number,
          // Close is for unit testing only. We kill this child process which will handle the closing of the server
          close: async (done) => {
            debug('closing dev server')
            result.server
              .stop()
              .then(() => done?.())
              .catch(done)
              .finally(() => {
                debug('closed dev server')
              })
          },
        })
      })
      .catch(reject)
  })
}

type PresetHandlerResult = {
  frameworkConfig: Configuration
  sourceRspackModulesResult: SourceRelativeRspackResult
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

const thirdPartyDefinitionPrefixes = {
  // matches @org/cypress-ct-*
  namespacedPrefixRe: /^@.+?\/cypress-ct-.+/,
  globalPrefix: 'cypress-ct-',
}

function isThirdPartyDefinition(framework: string) {
  return (
    framework.startsWith(thirdPartyDefinitionPrefixes.globalPrefix) ||
    thirdPartyDefinitionPrefixes.namespacedPrefixRe.test(framework)
  )
}

async function getPreset(
  devServerConfig: DevServerConfig,
): Promise<Optional<PresetHandlerResult, 'frameworkConfig'>> {
  const defaultRspackModules = () => ({
    sourceRspackModulesResult: sourceDefaultRspackDependencies(devServerConfig),
  })

  // Third party library (eg solid-js, lit, etc)
  if (devServerConfig.framework && isThirdPartyDefinition(devServerConfig.framework)) {
    return defaultRspackModules()
  }

  switch (devServerConfig.framework) {
    // todo - add support for other frameworks
    case 'create-react-app':
    // return createReactAppHandler(devServerConfig);
    case 'nuxt':
    // return await nuxtHandler(devServerConfig)

    case 'vue-cli':
    // return await vueCliHandler(devServerConfig)

    case 'next':
    // return await nextHandler(devServerConfig)

    case 'angular':
    // return await angularHandler(devServerConfig)

    case 'react':
    case 'vue':
    case 'svelte':
    case undefined:
      return defaultRspackModules()

    default:
      throw new Error(
        `Unexpected framework ${
          (devServerConfig as any).framework
        }, please visit https://on.cypress.io/component-framework-configuration to see a list of supported frameworks`,
      )
  }
}

/**
 * Synchronously create the rspack server instance, without starting.
 * Useful for testing
 *
 * @internal
 */
devServer.create = async function (devServerConfig: DevServerConfig) {
  const { frameworkConfig, sourceRspackModulesResult } = await getPreset(devServerConfig)

  const { server, compiler } = await createRspackDevServer({
    devServerConfig,
    frameworkConfig,
    sourceRspackModulesResult,
  })

  return { server, compiler }
}
