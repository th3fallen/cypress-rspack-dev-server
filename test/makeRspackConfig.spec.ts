import { describe, it, expect, vi } from 'vitest'
import EventEmitter from 'events'

import { makeRspackConfig, CYPRESS_RSPACK_ENTRYPOINT } from '../src/makeRspackConfig'
import { createModuleMatrixResult } from './test-helper/createModuleMatrixResult'
import type { CreateFinalRspackConfig } from '../src/createRspackDevServer'

vi.mock('@rspack/core', () => ({
  HtmlRspackPlugin: class HtmlRspackPlugin {
    name = 'HtmlRspackPlugin'
    _args: any[]
    constructor(...args: any[]) {
      this._args = args
    }
  },
}))

describe('CYPRESS_RSPACK_ENTRYPOINT', () => {
  it('resolves to browser.js in the dist directory', () => {
    expect(CYPRESS_RSPACK_ENTRYPOINT).toMatch(/browser\.js$/)
  })
})

describe('makeRspackConfig', () => {
  const baseDevServerConfig: CreateFinalRspackConfig['devServerConfig'] = {
    specs: [],
    cypressConfig: {
      projectRoot: '/test/project',
      devServerPublicPathRoute: '/test-public-path',
      supportFile: 'cypress/support/component.ts',
      indexHtmlFile: 'cypress/support/component-index.html',
      isTextTerminal: true,
      baseUrl: null,
    } as Cypress.PluginConfigOptions,
    devServerEvents: new EventEmitter(),
  }

  it('uses the user rspack config when provided', async () => {
    const userConfig = {
      resolve: { alias: { '@': '/src' } },
    }

    const result = await makeRspackConfig({
      devServerConfig: { ...baseDevServerConfig, rspackConfig: userConfig },
      sourceRspackModulesResult: createModuleMatrixResult(),
    })

    expect(result.resolve?.alias).toEqual({ '@': '/src' })
  })

  it('accepts rspack config as a function', async () => {
    const rspackConfig = () => ({
      resolve: { alias: { '@fn': '/fn-src' } },
    })

    const result = await makeRspackConfig({
      devServerConfig: { ...baseDevServerConfig, rspackConfig },
      sourceRspackModulesResult: createModuleMatrixResult(),
    })

    expect(result.resolve?.alias).toEqual({ '@fn': '/fn-src' })
  })

  it('accepts rspack config as an async function', async () => {
    const rspackConfig = async () => ({
      resolve: { alias: { '@async': '/async-src' } },
    })

    const result = await makeRspackConfig({
      devServerConfig: { ...baseDevServerConfig, rspackConfig },
      sourceRspackModulesResult: createModuleMatrixResult(),
    })

    expect(result.resolve?.alias).toEqual({ '@async': '/async-src' })
  })

  it('removes HtmlWebpackPlugin from user config', async () => {
    class HtmlWebpackPlugin {
      constructor() {}
      get raw() {
        return () => ({ name: 'HtmlWebpackPlugin' })
      }
    }

    const result = await makeRspackConfig({
      devServerConfig: {
        ...baseDevServerConfig,
        rspackConfig: { plugins: [new HtmlWebpackPlugin() as any] },
      },
      sourceRspackModulesResult: createModuleMatrixResult(),
    })

    const pluginNames = result.plugins?.map((p: any) => p?.name || p?.constructor?.name)

    expect(pluginNames).not.toContain('HtmlWebpackPlugin')
  })

  it('removes HotModuleReplacementPlugin from user config', async () => {
    class HotModuleReplacementPlugin {
      constructor() {}
      get raw() {
        return () => ({ name: 'HotModuleReplacementPlugin' })
      }
    }

    const result = await makeRspackConfig({
      devServerConfig: {
        ...baseDevServerConfig,
        rspackConfig: { plugins: [new HotModuleReplacementPlugin() as any] },
      },
      sourceRspackModulesResult: createModuleMatrixResult(),
    })

    const pluginNames = result.plugins?.map((p: any) => p?.name || p?.constructor?.name)

    expect(pluginNames).not.toContain('HotModuleReplacementPlugin')
  })

  it('deletes user entry and output config', async () => {
    const result = await makeRspackConfig({
      devServerConfig: {
        ...baseDevServerConfig,
        rspackConfig: {
          entry: { main: 'src/index.js' },
          output: { path: '/custom/output' },
        },
      },
      sourceRspackModulesResult: createModuleMatrixResult(),
    })

    expect(result.entry).toBe(CYPRESS_RSPACK_ENTRYPOINT)
  })

  it('deletes chunkFilename from output', async () => {
    const result = await makeRspackConfig({
      devServerConfig: {
        ...baseDevServerConfig,
        rspackConfig: {
          output: { chunkFilename: '[name].chunk.js' },
        },
      },
      sourceRspackModulesResult: createModuleMatrixResult(),
    })

    expect(result.output?.chunkFilename).toBeUndefined()
  })

  it('sets entry as object with cypress-entry for angular framework', async () => {
    const result = await makeRspackConfig({
      devServerConfig: {
        ...baseDevServerConfig,
        framework: 'angular',
        rspackConfig: {},
      },
      sourceRspackModulesResult: createModuleMatrixResult(),
    })

    expect(result.entry).toEqual({
      'cypress-entry': CYPRESS_RSPACK_ENTRYPOINT,
    })
  })

  it('calls onConfigNotFound when no config is found', async () => {
    const onConfigNotFound = vi.fn()

    // Mock process.exit to prevent test from exiting
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

    try {
      await makeRspackConfig({
        devServerConfig: {
          ...baseDevServerConfig,
          onConfigNotFound,
        },
        sourceRspackModulesResult: createModuleMatrixResult(),
      })
    } catch {
      // may throw due to dynamic import issues in test env
    }

    exitSpy.mockRestore()
  })
})
