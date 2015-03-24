const domify = require('domify')
const fs = require('fs')

require('domready')(() => {
  //show canvas demo
  let context = require('./canvas')()
  document.body.appendChild(context.canvas)

  //show copy
  let url = 'https://github.com/mattdesl/budo-gulp-starter'
  let list = [
    'npm dependencies with browserify',
    'incremental bundling with watchify',
    'SASS for CSS pre-processor',
    'LiveReload for browser refresh and CSS injection',
    'Babel for ES6 transpiling',
    'syntax error reporting with errorify'
  ].map(x => `<li>${x}</li>`)
   .join('\n')

  list = domify(`
    <p>workflow</p>
    <ul>${list}</ul>
    <a href="${url}">[source]</a>`)
  document.body.appendChild(list)
})