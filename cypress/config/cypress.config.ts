import { defineConfig } from 'cypress'
import { devServer } from '../../dist/devServer'

export default defineConfig({
  component: {
    video: false,
    supportFile: './support/component.ts',
    specPattern: './component/*.cy.{tsx,jsx,js,ts}',
    indexHtmlFile: '../support/component-index.html',
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        framework: 'react',
        rspackConfig: require('./rspack.config.js'),
      })
    },
  },
})
