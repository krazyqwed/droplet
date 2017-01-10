import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';

export default {
  entry: 'src/js/Main.js',
  dest: 'dist/app-fallback.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: 'es2015-rollup'
    }),
    (process.env.NODE_ENV === 'production' && uglify({}, minify))
  ]
};
