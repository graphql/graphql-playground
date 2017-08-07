const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const path = require('path')
const fs = require('fs')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HappyPack = require('happypack')

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: './src/main',
  target: 'electron',
  output: {
    filename: '[name].[hash].js',
    publicPath: '/',
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
        test: /\.ts(x?)$/,
        include: [__dirname + '/src'],
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
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.mp3$/,
        loader: 'file-loader',
      },
      {
        test: /(icons|node_modules)\/.*\.svg$/,
        loader: 'raw-loader!svgo-loader',
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
    new webpack.HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin(
      {
        // watch: './src',
      }
    ),
    new webpack.DefinePlugin({
      __SUBSCRIPTIONS_EU_WEST_1__: JSON.stringify(
        process.env.SUBSCRIPTIONS_EU_WEST_1 ||
          'wss://dev.subscriptions.graph.cool'
      ),
      __SUBSCRIPTIONS_US_WEST_2__: JSON.stringify(
        process.env.SUBSCRIPTIONS_US_WEST_1 ||
          'wss://dev.subscriptions.us-west-2.graph.cool'
      ),
      __SUBSCRIPTIONS_AP_NORTHEAST_1__: JSON.stringify(
        process.env.SUBSCRIPTIONS_AP_NORTHEAST_1 ||
          'wss://dev.subscriptions.ap-northeast-1.graph.cool'
      ),
      __HEARTBEAT_ADDR__: false,
      __AUTH0_DOMAIN__: '"graphcool-customers-dev.auth0.com"',
      __AUTH0_CLIENT_ID__: '"2q6oEEGaIPv45R7v60ZMnkfAgY49pNnm"',
      __METRICS_ENDPOINT__: false,
      __GA_CODE__: false,
      __INTERCOM_ID__: '"rqszgt2h"',
      __STRIPE_PUBLISHABLE_KEY__: '"pk_test_BpvAdppmXbqmkv8NQUqHRplE"',
      __CLI_AUTH_TOKEN_ENDPOINT__: JSON.stringify(
        process.env.CLI_AUTH_TOKEN_ENDPOINT ||
          'https://cli-auth-api.graph.cool/dev'
      ),
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
      __EXAMPLE_ADDR__: '"https://dynamic-resources.graph.cool"',
    }),
    new HtmlWebpackPlugin({
      favicon: 'static/favicon.png',
      template: 'src/index.html',
    }),
    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
    // See https://github.com/graphql/graphql-language-service/issues/111
    new webpack.ContextReplacementPlugin(
      /graphql-language-service-interface[\/\\]dist/,
      /\.js$/
    ),
    new webpack.LoaderOptionsPlugin({
      options: {
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
    // new BundleAnalyzerPlugin(),
  ],
  resolve: {
    modules: [path.resolve('./src'), 'node_modules'],
    extensions: ['.js', '.ts', '.tsx'],
  },
}
