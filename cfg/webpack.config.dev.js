import merge from 'webpack-merge'
import path from 'path'
import base from './webpack.config.base'

const outputFile = 'vue-scroll-range-datepicker'
const globalName = 'VueScrollRangeDatepicker'

module.exports = merge(base, {
  entry: './dev/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFile + '.common.js',
    library: globalName,
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
})
