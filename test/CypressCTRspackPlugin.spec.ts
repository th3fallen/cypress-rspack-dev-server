import EventEmitter from 'events'

import { describe, it, expect, vi } from 'vitest'

import { CypressCTRspackPlugin } from '../src/CypressCTRspackPlugin'

vi.mock('fs-extra', () => ({
  default: {
    pathExists: vi.fn().mockResolvedValue(true),
    utimesSync: vi.fn(),
  },
  pathExists: vi.fn().mockResolvedValue(true),
  utimesSync: vi.fn(),
}))

function createPluginOptions(
  overrides: Partial<ConstructorParameters<typeof CypressCTRspackPlugin>[0]> = {},
) {
  return {
    files: [],
    projectRoot: '/test/project',
    supportFile: 'cypress/support/component.ts',
    devServerEvents: new EventEmitter(),
    indexHtmlFile: 'cypress/support/component-index.html',
    ...overrides,
  }
}

function createMockCompiler() {
  const hooks = {
    beforeCompile: { tapAsync: vi.fn() },
    compilation: { tap: vi.fn() },
    done: { tap: vi.fn() },
  }

  return { hooks }
}

describe('CypressCTRspackPlugin', () => {
  it('creates plugin with correct properties', () => {
    const options = createPluginOptions({
      files: [
        {
          name: 'test.cy.ts',
          relative: 'cypress/test.cy.ts',
          absolute: '/test/project/cypress/test.cy.ts',
        } as Cypress.Spec,
      ],
      supportFile: 'cypress/support/component.ts',
    })

    const plugin = new CypressCTRspackPlugin(options)

    expect(plugin).toBeInstanceOf(CypressCTRspackPlugin)
  })

  describe('apply', () => {
    it('registers all required compiler hooks', () => {
      const options = createPluginOptions()
      const plugin = new CypressCTRspackPlugin(options)
      const compiler = createMockCompiler()

      plugin.apply(compiler)

      expect(compiler.hooks.beforeCompile.tapAsync).toHaveBeenCalledWith(
        'CypressCTPlugin',
        expect.any(Function),
      )
      expect(compiler.hooks.compilation.tap).toHaveBeenCalledWith(
        'CypressCTPlugin',
        expect.any(Function),
      )
      expect(compiler.hooks.done.tap).toHaveBeenCalledWith('CypressCTPlugin', expect.any(Function))
    })

    it('listens for dev-server:specs:changed events', () => {
      const devServerEvents = new EventEmitter()
      const spy = vi.spyOn(devServerEvents, 'on')
      const options = createPluginOptions({ devServerEvents })
      const plugin = new CypressCTRspackPlugin(options)

      plugin.apply(createMockCompiler())

      expect(spy).toHaveBeenCalledWith('dev-server:specs:changed', expect.any(Function))
    })

    it('emits dev-server:compile:success on done hook', () => {
      const devServerEvents = new EventEmitter()
      const spy = vi.spyOn(devServerEvents, 'emit')
      const options = createPluginOptions({ devServerEvents })
      const plugin = new CypressCTRspackPlugin(options)
      const compiler = createMockCompiler()

      plugin.apply(compiler)

      // Trigger the done hook callback
      const doneCallback = compiler.hooks.done.tap.mock.calls[0][1]
      doneCallback()

      expect(spy).toHaveBeenCalledWith('dev-server:compile:success')
    })
  })
})
