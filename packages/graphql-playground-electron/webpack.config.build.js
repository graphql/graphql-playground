const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cssnano = require('cssnano')
const path = require('path')
const config = require('./webpack.config')
const os = require('os')
const fs = require('fs')
const UglifyJSParallelPlugin = require('webpack-uglify-parallel')
const { renderPlaygroundPage } = require('graphql-playground-html')

const appEntrypoint = 'src/renderer/index.html'

// Create the playground entry point if it doesn't exist
if (!fs.existsSync(appEntrypoint)) {
  fs.writeFileSync(appEntrypoint, renderPlaygroundPage({ env: 'react' }))
}

module.exports = {
  devtool: 'source-map',
  mode: 'production',
  target: 'electron-renderer',
  entry: {
    app: ['./src/renderer'],
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].[hash].js',
    sourceMapFilename: '[file].map',
    publicPath: './',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts(x?)$/,
        loader: 'tslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.scss$/,
        loader:
          'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader!sass-loader',
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        },
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto"
      },
      {
        test: /\.mp3$/,
        loader: 'file-loader',
      },
      {
        test: /icons\/.*\.svg$/,
        loader:
          'raw-loader!svgo-loader?{"plugins":[{"removeStyleElement":true}]}',
      },
      {
        test: /graphics\/.*\.svg$/,
        loader: 'file-loader',
      },
      {
        test: /.*\.(png|gif)$/,
        loader: 'file-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
      __EXAMPLE_ADDR__: '"https://dynamic-resources.graph.cool"',
    }),
    new HtmlWebpackPlugin({
      favicon: 'static/favicon.png',
      template: appEntrypoint,
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    /* new UglifyJSParallelPlugin({
      workers: os.cpus().length,
      compress: {
        unused: true,
        dead_code: true,
        warnings: false,
      },
      sourceMap: false,
      mangle: false,
    }), */
    // https://github.com/graphql/graphql-language-service/issues/111
    new webpack.ContextReplacementPlugin(
      /graphql-language-service-interface[\/\\]dist/,
      /\.js$/,
    ),
    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          cssnano({
            autoprefixer: {
              add: true,
              remove: true,
              browsers: ['last 2 versions'],
            },
            discardComments: {
              removeAll: true,
            },
            safe: true,
          }),
        ],
        svgo: {
          plugins: [{ removeStyleElement: true }],
        },
      },
    }),
  ],
  resolve: {
    modules: [path.resolve('./src'), 'node_modules'],
    extensions: ['.mjs','.js', '.ts', '.tsx'],
  },
}
