import commonjs from 'rollup-plugin-commonjs'
import VuePlugin from 'rollup-plugin-vue'

export default [
  {
    input: './dev/index.js',
    output: {
      name: 'test',
      file: './dist/build.js',
      format: 'umd',
    },
    plugins: [
      commonjs(),
      VuePlugin(),
    ],
  },
]
