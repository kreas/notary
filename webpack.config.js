var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var path = require('path')

let resolve =
dir => path.join(__dirname, dir)

var config = {
  context: resolve('/src'), // `__dirname` is root of project and `src` is source
  entry: {
    browser: './browser.js',
    'content/index': './content/index.js',
    'options/index': './options/index.js'
  },
  output: {
    path: resolve('/dist'), // `dist` is the destination
    filename: '[name].bundle.js'
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules')
    ]
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        query: {
          presets: ['env']
        }
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: resolve('/src/manifest.json'), to: resolve('/dist')},
      // {from: resolve('/src/index.js'), to: resolve('/dist')},
      {from: resolve('/src/assets/popup.html'), to: resolve('/dist')},
      {from: resolve('/src/options/index.html'), to: resolve('/dist/options')},
      {from: resolve('/src/assets/icon.png'), to: resolve('/dist')}
    ]),
    new HtmlWebpackPlugin({
      template: resolve('/src/index.html')
    })
  ],
  node: {
    fs: 'empty',
    child_process: 'empty'
  }
}

module.exports = config
