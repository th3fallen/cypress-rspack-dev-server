import Module from 'module'
import path from 'path'
import type { DevServerConfig, Frameworks } from '../devServer'
import debugFn from 'debug'
import type { RspackDevServer } from '@rspack/dev-server'

const debug = debugFn('cypress-rspack-dev-server:sourceRelativeRspackModules')

export type ModuleClass = typeof Module & {
  _load(id: string, parent: Module, isMain: boolean): any
  _resolveFilename(
    request: string,
    parent: Module,
    isMain: boolean,
    options?: { paths: string[] },
  ): string
  _cache: Record<string, Module>
}

export interface PackageJson {
  name: string
  version: string
}

export interface SourcedDependency {
  importPath: string
  packageJson: PackageJson
}

export interface SourcedRspack extends SourcedDependency {
  module: Function
}

export interface SourcedRspackDevServer extends SourcedDependency {
  module: {
    new (...args: unknown[]): RspackDevServer
  }
}

export interface SourceRelativeRspackResult {
  framework: SourcedDependency | null
  rspack: SourcedRspack
  rspackDevServer: SourcedRspackDevServer
}

const originalModuleLoad = (Module as ModuleClass)._load
const originalModuleResolveFilename = (Module as ModuleClass)._resolveFilename

type FrameworkRspackMapper = { [Property in Frameworks]: string | undefined }

const frameworkRspackMapper: FrameworkRspackMapper = {
  react: 'react',
  vue: undefined,
  next: 'next',
  angular: '@angular-devkit/build-angular',
  svelte: undefined,
}

// Source the users framework from the provided projectRoot. The framework, if available, will serve
// as the resolve base for rspack dependency resolution.
export function sourceFramework(config: DevServerConfig): SourcedDependency | null {
  debug('Framework: Attempting to source framework for %s', config.cypressConfig.projectRoot)
  if (!config.framework) {
    debug('Framework: No framework provided')

    return null
  }

  const sourceOfRspack = frameworkRspackMapper[config.framework]

  if (!sourceOfRspack) {
    debug(
      'Not a higher-order framework so rspack dependencies should be resolvable from projectRoot',
    )

    return null
  }

  const framework = {} as SourcedDependency

  try {
    const frameworkJsonPath = require.resolve(`${sourceOfRspack}/package.json`, {
      paths: [config.cypressConfig.projectRoot],
    })
    const frameworkPathRoot = path.dirname(frameworkJsonPath)

    // Want to make sure we're sourcing this from the user's code. Otherwise we can
    // warn and tell them they don't have their dependencies installed
    framework.importPath = frameworkPathRoot
    framework.packageJson = require(frameworkJsonPath)

    debug('Framework: Successfully sourced framework - %o', framework)

    return framework
  } catch (e) {
    debug('Framework: Failed to source framework - %s', e)

    // TODO
    return null
  }
}

// Source the rspack module from the provided framework or projectRoot. We override the module resolution
// so that other packages that import rspack resolve to the version we found.
export function sourceRspack(
  config: DevServerConfig,
  framework: SourcedDependency | null,
): SourcedRspack {
  const searchRoot = framework?.importPath ?? config.cypressConfig.projectRoot

  debug('Rspack: Attempting to source rspack from %s', searchRoot)

  const rspack = {} as SourcedRspack

  const rspackJsonPath: string = require.resolve('@rspack/core/package.json', {
    paths: [searchRoot],
  })

  rspack.importPath = path.dirname(rspackJsonPath)
  rspack.packageJson = require(rspackJsonPath)
  rspack.module = require(rspack.importPath).rspack

  debug('Rspack: Successfully sourced rspack - %o', rspack)
  ;(Module as ModuleClass)._load = function (request, parent, isMain) {
    if (request === 'rspack' || request.startsWith('rspack/')) {
      const resolvePath = require.resolve(request, {
        paths: [rspack.importPath],
      })

      debug('Rspack: Module._load resolvePath - %s', resolvePath)

      return originalModuleLoad(resolvePath, parent, isMain)
    }

    return originalModuleLoad(request, parent, isMain)
  }
  ;(Module as ModuleClass)._resolveFilename = function (request, parent, isMain, options) {
    if (request === 'rspack' || (request.startsWith('rspack/') && !options?.paths)) {
      const resolveFilename = originalModuleResolveFilename(request, parent, isMain, {
        paths: [rspack.importPath],
      })

      debug('Rspack: Module._resolveFilename resolveFilename - %s', resolveFilename)

      return resolveFilename
    }

    return originalModuleResolveFilename(request, parent, isMain, options)
  }

  return rspack
}

// Source the @rspack/dev-server module from the provided framework or projectRoot.
// If none is found, we fallback to the version bundled with this package.
export function sourceRspackDevServer(
  config: DevServerConfig,
  framework?: SourcedDependency | null,
): SourcedRspackDevServer {
  const searchRoot = framework?.importPath ?? config.cypressConfig.projectRoot

  debug('RspackDevServer: Attempting to source @rspack/dev-server from %s', searchRoot)

  const rspackDevServer = {} as SourcedRspackDevServer
  let rspackDevServerJsonPath: string

  try {
    rspackDevServerJsonPath = require.resolve('@rspack/dev-server/package.json', {
      paths: [searchRoot],
    })
  } catch (e) {
    if ((e as { code?: string }).code !== 'MODULE_NOT_FOUND') {
      debug('RspackDevServer: Failed to source @rspack/dev-server - %s', e)
      throw e
    }

    debug('RspackDevServer: Falling back to bundled version')

    rspackDevServerJsonPath = require.resolve('@rspack/dev-server/package.json', {
      paths: [__dirname],
    })
  }

  rspackDevServer.importPath = path.dirname(rspackDevServerJsonPath)
  rspackDevServer.packageJson = require(rspackDevServerJsonPath)
  rspackDevServer.module = require(rspackDevServer.importPath).RspackDevServer

  debug('RspackDevServer: Successfully sourced @rspack/dev-server - %o', rspackDevServer)

  return rspackDevServer
}

// Most frameworks follow a similar path for sourcing rspack dependencies so this is a utility to handle all the sourcing.
export function sourceDefaultRspackDependencies(
  config: DevServerConfig,
): SourceRelativeRspackResult {
  const framework = sourceFramework(config)
  const rspack = sourceRspack(config, framework)
  const rspackDevServer = sourceRspackDevServer(config, framework)

  return { framework, rspack, rspackDevServer }
}

export function restoreLoadHook() {
  ;(Module as ModuleClass)._load = originalModuleLoad
  ;(Module as ModuleClass)._resolveFilename = originalModuleResolveFilename
}
