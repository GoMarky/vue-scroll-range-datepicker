var merge = require('webpack-merge');
var base = require('./webpack.config.base');
var path = require('path');

var outputFile = 'vue-scroll-range-datepicker';
var globalName = 'VueScrollRangeDatepicker';

module.exports = merge(base, {
    entry: "./dev/index.js",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: outputFile + '.common.js',
        library: globalName,
        libraryTarget: 'umd',
    },
    devtool: 'source-map'
});
