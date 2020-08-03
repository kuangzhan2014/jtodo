const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const merge = require('webpack-merge')
const webpack = require('webpack')
const HTMLPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const baseConfig = require('./webpack.config.base')

const isDev = process.env.NODE_ENV === 'development'
const defaultPlugins = [
  new VueLoaderPlugin(),
  new CleanWebpackPlugin(),
  new HTMLPlugin(),
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // all options are optional
    filename: '[name].css',
    chunkFilename: '[id].css',
    ignoreOrder: false // Enable to remove warnings about conflicting order
  })

  // new webpack.DefinePlugin({
  // 'process.env':{
  //     NODE_ENV:isDev?'"development"':'"production"'
  //    }
  // })
]
const devServer = {
  port: 8080,
  host: '0.0.0.0',
  overlay: {
    errors: true
  },
  // open:true  //每次打开新的页面
  // historyFallback:{},
  hot: true
}

let config
if (isDev) {
  config = merge(baseConfig, {
    devtool: 'inline-source-map',
    // devtool: '#cheap-module-eval-source-map',
    module: {
      rules: [{
        test: /\.styl/,
        use: [
          'vue-style-loader',
          'css-loader', {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
          'stylus-loader'
        ]
      }]
    },
    devServer,
    plugins: defaultPlugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ])
  })
} else {
  config = merge(baseConfig, {
    entry: {
      app: path.join(__dirname, '../client/index.js'),
      vendor: ['vue']
    },
    output: {
      filename: '[name].[chunkhash:8].js'
    },
    module: {
      rules: [
        {
          test: /\.styl/,
          use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
              hmr: process.env.NODE_ENV === 'development'
            }
          },
            'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          },
            'stylus-loader'
          ]
        }]
    },
    plugins: defaultPlugins.concat([
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: 'styles.[chunkhash].[name].css',
        chunkFilename: '[id].css',
        ignoreOrder: false // Enable to remove warnings about conflicting order
      })
    ])
  })
}

module.exports = config
