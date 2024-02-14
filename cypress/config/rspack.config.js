const rspack = require('@rspack/core')

module.exports = {
  plugins: [new rspack.ProvidePlugin({ process: 'process' })],
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        loader: 'builtin:swc-loader',
        options: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
        },
      },
    ],
  },
}
