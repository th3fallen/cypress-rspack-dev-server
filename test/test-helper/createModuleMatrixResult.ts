import path from 'path'
import type { SourceRelativeRspackResult } from '../../src/helpers/sourceRelativeRspackModules'

const moduleSources = {
  rspack: '@rspack/dev-server',
  rspackDevServer: '@rspack/dev-server',
  htmlRspackPlugin: 'HtmlRspackPlugin',
} as const

export function createModuleMatrixResult(): SourceRelativeRspackResult {
  return {
    rspack: resolveModule('rspack'),
    rspackDevServer: resolveModule('rspackDevServer'),
  }
}

function resolveModule<K extends keyof typeof moduleSources>(name: K) {
  return {
    importPath: path.dirname(require.resolve(`${moduleSources[name]}/package.json`)),
    packageJson: require(`${moduleSources[name]}/package.json`),
    module: require(`${moduleSources[name]}`),
  }
}
