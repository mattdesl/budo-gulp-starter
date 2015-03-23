var domify = require('domify')

require('domready')(() => {
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
    <p>Features:</p>
    <ul>${list}</ul>`)
  document.body.appendChild(list)
})