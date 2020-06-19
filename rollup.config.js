import  resolve  from '@rollup/plugin-node-resolve';

export default {
  input: [
    'node_modules/lit-element/lit-element.js',
    'node_modules/lit-html/lit-html.js',
    'node_modules/lit-html/directives/if-defined.js',
    'node_modules/lit-html/directives/cache.js',
    'node_modules/lit-html/directives/class-map.js',
    'node_modules/lit-html/directives/guard.js',
    'node_modules/lit-html/directives/repeat.js',
    'node_modules/lit-html/directives/style-map.js',
    'node_modules/lit-html/directives/template-content.js',
    'node_modules/lit-html/directives/unsafe-html.js',
    'node_modules/lit-html/directives/until.js',
    'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js'
  ],
  output: {
    dir: 'client/libs',
    format: 'esm'
  },
  plugins: [resolve()]
};