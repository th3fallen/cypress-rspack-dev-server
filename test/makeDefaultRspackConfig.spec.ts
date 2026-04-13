import EventEmitter from 'events'

import { describe, test, it, expect, beforeEach, vi } from 'vitest'

// Mock @rspack/core since it's a pure ESM package that can't be loaded directly
vi.mock('@rspack/core', () => ({
  HtmlRspackPlugin: class HtmlRspackPlugin {
    name = 'HtmlRspackPlugin'
    _args: any[]
    constructor(...args: any[]) {
      this._args = args
    }
  },
}))

import { CreateFinalRspackConfig } from '../src/createRspackDevServer'
import { makeCypressRspackConfig } from '../src/makeDefaultRspackConfig'
import { makeRspackConfig } from '../src/makeRspackConfig'
import { createModuleMatrixResult } from './test-helper/createModuleMatrixResult'

describe('makeCypressRspackConfig', () => {
  test('should return a valid Configuration object', () => {
    const config: CreateFinalRspackConfig = {
      devServerConfig: {
        cypressConfig: {
          projectRoot: 'path/to/project',
          devServerPublicPathRoute: '/public',
          supportFile: 'path/to/supportFile',
          indexHtmlFile: 'path/to/indexHtmlFile',
          isTextTerminal: true,
        } as Cypress.PluginConfigOptions,
        specs: [],
        devServerEvents: new EventEmitter(),
      },
      sourceRspackModulesResult: createModuleMatrixResult(),
    }

    const result = makeCypressRspackConfig(config)

    expect(result.mode).toBe('development')
    expect(result.optimization).toEqual({
      sideEffects: false,
      splitChunks: false,
    })
    expect(result.plugins).toMatchSnapshot()
    expect(result.devtool).toBe('inline-source-map')
    expect(result.optimization?.sideEffects).toBe(false)
  })
})

describe('experimentalJustInTimeCompile', () => {
  const devServerConfig: CreateFinalRspackConfig['devServerConfig'] = {
    specs: [],
    cypressConfig: {
      projectRoot: '.',
      indexHtmlFile: 'path/to/supportFile',
      devServerPublicPathRoute: '/test-public-path',
      justInTimeCompile: true,
      baseUrl: null,
    } as Cypress.PluginConfigOptions,
    rspackConfig: {
      entry: { main: 'src/index.js' },
    },
    devServerEvents: new EventEmitter(),
  }

  describe('run mode', () => {
    beforeEach(() => {
      devServerConfig.cypressConfig.isTextTerminal = true
    })

    it('enables watching', async () => {
      const actual = await makeRspackConfig({
        devServerConfig,
        sourceRspackModulesResult: createModuleMatrixResult(),
      })

      expect(actual.watchOptions?.ignored).toStrictEqual(/node_modules/)
    })
  })
})
