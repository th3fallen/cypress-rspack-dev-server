import { describe, expect } from '@jest/globals'
import EventEmitter from 'events'
import { CreateFinalRspackConfig } from '../src/createRspackDevServer'
import { makeCypressRspackConfig } from '../src/makeDefaultRspackConfig'
import { createModuleMatrixResult } from './test-helper/createModuleMatrixResult'

describe('makeCypressRspackConfig', () => {
  // Returns a valid Configuration object with mode, optimization, output, plugins and devtool properties
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
      splitChunks: { chunks: 'all' },
    })
    expect(result.plugins).toMatchSnapshot()
    expect(result.devtool).toBe('inline-source-map')
    expect(result.optimization?.sideEffects).toBe(false)
  })

  // test('should replace backslashes with posixSeparator in the publicPath when path.sep is not equal to posixSeparator', () => {
  //   const originalPathSep = path.sep
  //   path.sep = '\\'

  //   const config: CreateFinalRspackConfig = {
  //     devServerConfig: {
  //       cypressConfig: {
  //         projectRoot: 'path/to/project',
  //         devServerPublicPathRoute: '/public',
  //         supportFile: 'path/to/supportFile',
  //         indexHtmlFile: 'path/to/indexHtmlFile',
  //         isTextTerminal: true,
  //       } as Cypress.PluginConfigOptions,
  //       specs: ['path/to/spec1', 'path/to/spec2'],
  //       devServerEvents: new EventEmitter(),
  //       framework: 'react',
  //     },
  //     sourceRspackModulesResult: createModuleMatrixResult(),
  //   }

  //   const result = makeCypressRspackConfig(config)

  //   expect(result.output.publicPath).toBe('/public/')
  //   path.sep = originalPathSep
  // })
})
