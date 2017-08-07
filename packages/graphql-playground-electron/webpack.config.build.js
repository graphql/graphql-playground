const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cssnano = require('cssnano')
const path = require('path')
const config = require('./webpack.config')
const HappyPack = require('happypack')
const os = require('os')
const UglifyJSParallelPlugin = require('webpack-uglify-parallel')

module.exports = {
  devtool: 'source-map',
  target: 'electron-renderer',
  entry: {
    app: ['./src/main'],
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
        test: /\.json$/, // TODO check if still needed
        loader: 'json-loader',
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
        test: /\.ts(x?)$/,
        include: __dirname + '/src',
        use: [
          {
            loader: 'happypack/loader?id=babel',
          },
          {
            loader: 'happypack/loader?id=ts',
          },
        ],
      },
      {
        test: /\.js$/,
        loader: 'happypack/loader?id=babel',
        include: __dirname + '/src',
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
        test: /(graphics|gifs)\/.*\.(png|gif)$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      },
      __EXAMPLE_ADDR__: '"https://dynamic-resources.graph.cool"',
    }),
    new HtmlWebpackPlugin({
      favicon: 'static/favicon.png',
      template: 'src/index.html',
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
    new webpack.ContextReplacementPlugin(/graphql-language-service-interface[\/\\]dist/, /\.js$/),
    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
    new webpack.optimize.CommonsChunkPlugin('vendor'),
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
    new HappyPack({
      id: 'ts',
      threads: 2,
      loaders: ['ts-loader?' + JSON.stringify({ happyPackMode: true })],
    }),
    new HappyPack({
      id: 'babel',
      threads: 2,
      loaders: ['babel-loader'],
    }),
  ],
  resolve: {
    modules: [path.resolve('./src'), 'node_modules'],
    extensions: ['.js', '.ts', '.tsx'],
  },
}
