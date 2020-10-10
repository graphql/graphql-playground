const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const path = require('path')
const fs = require('fs')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HappyPack = require('happypack')
const { renderPlaygroundPage } = require('graphql-playground-html')

const appEntrypoint = 'src/renderer/index.html'

// Create the playground entry point if it doesn't exist
if (!fs.existsSync(appEntrypoint)) {
  fs.writeFileSync(appEntrypoint, renderPlaygroundPage({ env: 'react' }))
}

module.exports = [
  {
    devtool: 'cheap-module-eval-source-map',
    mode: 'development',
    entry: './src/renderer',
    target: 'electron-renderer',
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
        // {
        //   test: /\.json$/, // TODO check if still needed
        //   loader: 'json-loader',
        // },
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
          test: /.*\.(png|gif)$/,
          loader: 'file-loader',
        },
        {
          test: /\.html$/,
          loader: 'html-loader',
        },
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ForkTsCheckerWebpackPlugin({}),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
        __EXAMPLE_ADDR__: '"https://dynamic-resources.graph.cool"',
      }),
      new HtmlWebpackPlugin({
        favicon: 'static/favicon.png',
        template: 'src/renderer/index.html',
      }),
      new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
      // See https://github.com/graphql/graphql-language-service/issues/111
      new webpack.ContextReplacementPlugin(
        /graphql-language-service-interface[\/\\]dist/,
        /\.js$/,
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
      extensions: ['.mjs', '.js', '.ts', '.tsx'],
    },
  },
]
