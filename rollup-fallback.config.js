import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

export default {
  input: 'src/js/Main.js',
  output: {
    file: 'dist/app-fallback.js',
    format: 'iife'
  },
  sourcemap: 'inline',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: 'es2015-rollup'
    }),
    (process.env.NODE_ENV === 'production' && uglify({}, minify))
  ]
};
