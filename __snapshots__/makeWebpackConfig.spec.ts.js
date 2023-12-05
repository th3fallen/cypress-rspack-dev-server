exports[
  'makeRspackConfig ignores userland rspack `output.publicPath` and `devServer.overlay` with rspack-dev-server v4 1'
] = {
  output: {
    publicPath: '/test-public-path/',
    filename: '[name].js',
  },
  devServer: {
    magicHtml: true,
    client: {
      progress: false,
      overlay: false,
    },
  },
  optimization: {
    emitOnErrors: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
    },
  },
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: ['HtmlRspackPlugin', 'CypressCTRspackPlugin'],
}

exports[
  'makeRspackConfig ignores userland rspack `output.publicPath` and `devServer.overlay` with rspack-dev-server v3 1'
] = {
  output: {
    publicPath: '/test-public-path/',
    filename: '[name].js',
  },
  devServer: {
    progress: true,
    overlay: false,
  },
  optimization: {
    noEmitOnErrors: false,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
    },
  },
  devtool: 'inline-source-map',
  mode: 'development',
  plugins: ['HtmlRspackPlugin', 'CypressCTRspackPlugin'],
}
