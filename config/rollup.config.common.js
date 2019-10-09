import commonjs from 'rollup-plugin-commonjs'
import VuePlugin from 'rollup-plugin-vue'

export default [
  {
    input: './src/index.js',
    output: {
      file: './dist/vue-scroll-range-datepicker.common.js',
      format: 'cjs',
    },
    plugins: [
      commonjs(),
      VuePlugin(),
    ],
  },
]
