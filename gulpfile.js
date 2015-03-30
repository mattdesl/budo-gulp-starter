const argv = require('minimist')(process.argv.slice(2))
const openURL = require('opn')
const path = require('path')
const once = require('once')

const gulp = require('gulp')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const streamify = require('gulp-streamify')
const source = require('vinyl-source-stream')

const budo = require('budo')
const browserify = require('browserify')
const resetCSS = require('node-reset-scss').includePath

const entry = './src/index.js'
const transforms = ['babelify']
const outfile = 'bundle.js'

//our CSS pre-processor
gulp.task('sass', function() {
  gulp.src('./src/sass/main.scss')
    .pipe(sass({ 
      errLogToConsole: true,
      outputStyle: argv.production ? 'compressed' : undefined,
      includePaths: [ resetCSS ] 
    }))
    .pipe(gulp.dest('./app'))
})

//the development task
gulp.task('watch', ['sass'], function(cb) {
  //watch SASS
  gulp.watch('src/sass/*.scss', ['sass'])

  var ready = function(){}
  
  //dev server
  budo(entry, {
    live: true,            //live reload & CSS injection
    verbose: true,         //verbose watchify logging
    dir: 'app',            //directory to serve
    plugin: 'errorify',    //display errors in browser
    transform: transforms, //browserify transforms
    delay: 0,              //speed up watchify interval
    outfile: outfile       //output bundle relative to dir
  })
  .on('exit', cb)
  .on('connect', function(ev) {
    console.log("Server running on", ev.uri)
    ready = once(openURL.bind(null, ev.uri))
  })
  .on('watch', function(type, file) {
    var open = argv.open || argv.o

    //open the browser
    if (open && path.basename(file) === outfile) {
      ready()
    }
  })
})

//the distribution bundle task
gulp.task('bundle', ['sass'], function() {
  var bundler = browserify(entry, { transform: transforms })
        .bundle()
  return bundler
    .pipe(source('index.js'))
    .pipe(streamify(uglify()))
    .pipe(rename(outfile))
    .pipe(gulp.dest('./app'))
})