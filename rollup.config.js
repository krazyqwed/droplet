import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';

export default {
  entry: 'src/js/main.js',
  dest: 'dist/app.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    (process.env.NODE_ENV === 'production' && uglify({}, minify))
  ]
};
