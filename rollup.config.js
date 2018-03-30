import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

export default {
  input: 'src/js/Main.js',
  output: {
    file: 'dist/app.js',
    format: 'iife',
    sourcemap: 'inline'
  },
  plugins: [
    resolve(),
    json({ exclude: 'node_modules/**' }),
    string({ exclude: 'node_modules/**', include: './src/shaders/*.frag' }),
    (process.env.NODE_ENV === 'production' && uglify({}, minify))
  ]
};
