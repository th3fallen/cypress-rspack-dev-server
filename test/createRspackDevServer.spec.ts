import EventEmitter from 'events'

import { describe, it, expect, vi } from 'vitest'

vi.mock('@rspack/core', () => ({
  HtmlRspackPlugin: class HtmlRspackPlugin {
    name = 'HtmlRspackPlugin'
    _args: any[]
    constructor(...args: any[]) {
      this._args = args
    }
  },
}))

import { createRspackDevServer } from '../src/createRspackDevServer'
import { createModuleMatrixResult } from './test-helper/createModuleMatrixResult'

describe('createRspackDevServer', () => {
  it('creates a dev server with correct config', async () => {
    const mockCompiler = { options: {} }
    const mockServer = { options: {} }

    const rspackFn = vi.fn().mockReturnValue(mockCompiler)

    class MockRspackDevServer {
      config: any
      compiler: any
      options: any
      constructor(config: any, compiler: any) {
        this.config = config
        this.compiler = compiler
        Object.assign(this, mockServer)
      }
    }

    const sourceRspackModulesResult = createModuleMatrixResult()
    sourceRspackModulesResult.rspack.module = rspackFn
    sourceRspackModulesResult.rspackDevServer.module = MockRspackDevServer as any

    const result = await createRspackDevServer({
      devServerConfig: {
        specs: [],
        cypressConfig: {
          projectRoot: '/test/project',
          devServerPublicPathRoute: '/__cypress/src',
          supportFile: false,
          indexHtmlFile: 'cypress/support/component-index.html',
          isTextTerminal: false,
        } as Cypress.PluginConfigOptions,
        devServerEvents: new EventEmitter(),
        rspackConfig: {},
      },
      sourceRspackModulesResult,
    })

    expect(rspackFn).toHaveBeenCalled()
    expect(result.server).toBeInstanceOf(MockRspackDevServer)
    expect((result.server as any).config).toEqual(
      expect.objectContaining({
        host: 'localhost',
        port: 'auto',
        hot: false,
        liveReload: true, // open mode (isTextTerminal: false)
        client: { overlay: false },
      }),
    )
    expect(result.compiler).toBe(mockCompiler)
  })

  it('disables liveReload in run mode', async () => {
    const mockCompiler = { options: {} }

    class MockDevServer {
      config: any
      constructor(config: any) {
        this.config = config
      }
    }

    const sourceRspackModulesResult = createModuleMatrixResult()
    sourceRspackModulesResult.rspack.module = vi.fn().mockReturnValue(mockCompiler)
    sourceRspackModulesResult.rspackDevServer.module = MockDevServer as any

    const result = await createRspackDevServer({
      devServerConfig: {
        specs: [],
        cypressConfig: {
          projectRoot: '/test/project',
          devServerPublicPathRoute: '/__cypress/src',
          supportFile: false,
          indexHtmlFile: 'cypress/support/component-index.html',
          isTextTerminal: true, // run mode
        } as Cypress.PluginConfigOptions,
        devServerEvents: new EventEmitter(),
        rspackConfig: {},
      },
      sourceRspackModulesResult,
    })

    expect((result.server as any).config).toEqual(
      expect.objectContaining({
        liveReload: false,
      }),
    )
  })
})
