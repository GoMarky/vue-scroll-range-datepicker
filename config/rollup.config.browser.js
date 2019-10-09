import commonjs from 'rollup-plugin-commonjs'
import VuePlugin from 'rollup-plugin-vue'

export default [
  {
    input: './src/index.js',
    output: {
      name: 'vue-scroll-range-datepicker',
      file: './dist/vue-scroll-range-datepicker.browser.js',
      format: 'umd',
    },
    plugins: [
      commonjs(),
      VuePlugin(),
    ],
  },
]
