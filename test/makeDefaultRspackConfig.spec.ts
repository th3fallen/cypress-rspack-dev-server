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
        framework: 'react',
      },
      sourceRspackModulesResult: createModuleMatrixResult(),
    }

    const result = makeCypressRspackConfig(config)

    expect(result.mode).toBe('development')
    expect(result.optimization).toBeDefined()
    expect(result.output).toBeDefined()
    expect(result.plugins).toBeDefined()
    expect(result.devtool).toBe('inline-source-map')
    expect(result.optimization?.sideEffects).toBe(false)
  })

  // it('should set output.filename, output.path and output.publicPath', () => {
  //   const config: CreateFinalRspackConfig = {
  //     devServerConfig: {
  //       cypressConfig: {
  //         projectRoot: 'path/to/project',
  //         devServerPublicPathRoute: '/public',
  //         supportFile: 'path/to/supportFile',
  //         indexHtmlFile: 'path/to/indexHtmlFile',
  //         isTextTerminal: true,
  //       },
  //       specs: ['path/to/spec1', 'path/to/spec2'],
  //       devServerEvents: new EventEmitter(),
  //       framework: 'framework',
  //     },
  //     sourceRspackModulesResult: createModuleMatrixResult(),
  //   }

  //   const result = makeCypressRspackConfig(config)

  //   expect(result.output.filename).toBe('[name].js')
  //   expect(result.output.path).toBe(OUTPUT_PATH)
  //   expect(result.output.publicPath).toBe('/public/')
  // })

  // // Includes an HtmlRspackPlugin and a CypressCTRspackPlugin in the plugins array
  // it('should include HtmlRspackPlugin and CypressCTRspackPlugin in the plugins array', () => {
  //   const config: CreateFinalRspackConfig = {
  //     devServerConfig: {
  //       cypressConfig: {
  //         projectRoot: 'path/to/project',
  //         devServerPublicPathRoute: '/public',
  //         supportFile: 'path/to/supportFile',
  //         indexHtmlFile: 'path/to/indexHtmlFile',
  //         isTextTerminal: true,
  //       },
  //       specs: ['path/to/spec1', 'path/to/spec2'],
  //       devServerEvents: new EventEmitter(),
  //       framework: 'framework',
  //     },
  //     sourceRspackModulesResult: {
  //       rspack: { module: () => {} },
  //     },
  //   }

  //   const result = makeCypressRspackConfig(config)

  //   expect(result.plugins).toHaveLength(2)
  //   expect(result.plugins[0]).toBeInstanceOf(HtmlRspackPlugin)
  //   expect(result.plugins[1]).toBeInstanceOf(CypressCTRspackPlugin)
  // })

  // // Sets devtool to 'inline-source-map'
  // it('should set devtool to "inline-source-map"', () => {
  //   const config: CreateFinalRspackConfig = {
  //     devServerConfig: {
  //       cypressConfig: {
  //         projectRoot: 'path/to/project',
  //         devServerPublicPathRoute: '/public',
  //         supportFile: 'path/to/supportFile',
  //         indexHtmlFile: 'path/to/indexHtmlFile',
  //         isTextTerminal: true,
  //       },
  //       specs: ['path/to/spec1', 'path/to/spec2'],
  //       devServerEvents: new EventEmitter(),
  //       framework: 'framework',
  //     },
  //     sourceRspackModulesResult: {
  //       rspack: { module: () => {} },
  //     },
  //   }

  //   const result = makeCypressRspackConfig(config)

  //   expect(result.devtool).toBe('inline-source-map')
  // })

  // // When path.sep is not equal to posixSeparator, replaces backslashes with posixSeparator in the publicPath
  // it('should replace backslashes with posixSeparator in the publicPath when path.sep is not equal to posixSeparator', () => {
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
  //       },
  //       specs: ['path/to/spec1', 'path/to/spec2'],
  //       devServerEvents: new EventEmitter(),
  //       framework: 'framework',
  //     },
  //     sourceRspackModulesResult: {
  //       rspack: { module: () => {} },
  //     },
  //   }

  //   const result = makeCypressRspackConfig(config)

  //   expect(result.output.publicPath).toBe('/public/')
  //   path.sep = originalPathSep
  // })
})
