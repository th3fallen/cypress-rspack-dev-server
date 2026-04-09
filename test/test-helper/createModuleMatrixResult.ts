import path from 'path'
import { vi } from 'vitest'
import type { SourceRelativeRspackResult } from '../../src/helpers/sourceRelativeRspackModules'

export function createModuleMatrixResult(): SourceRelativeRspackResult {
  const rspackImportPath = path.dirname(require.resolve('@rspack/core/package.json'))
  const rspackDevServerImportPath = path.dirname(require.resolve('@rspack/dev-server/package.json'))

  return {
    framework: null,
    rspack: {
      importPath: rspackImportPath,
      packageJson: require('@rspack/core/package.json'),
      module: vi.fn(),
    },
    rspackDevServer: {
      importPath: rspackDevServerImportPath,
      packageJson: require('@rspack/dev-server/package.json'),
      module: vi.fn() as any,
    },
  }
}
