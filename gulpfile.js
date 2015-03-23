const argv = require('minimist')(process.argv.slice(2))
const openURL = require('opn')
const onChange = require('once-file-changes')

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
const transforms = ['babelify', 'brfs']

//our CSS pre-processor
gulp.task('sass', function() {
  gulp.src('./src/sass/main.scss')
    .pipe(sass({ 
      errLogToConsole: true,
      includePaths: [ resetCSS ] 
    }))
    .pipe(gulp.dest('./app'))
})

//the development task
gulp.task('watch', ['sass'], function(cb) {
  //watch SASS
  gulp.watch('src/sass/*.scss', ['sass'])

  //dev server
  budo('./src/index.js', {
    live: true,            //live reload & CSS injection
    verbose: true,         //verbose watchify logging
    dir: 'app',            //directory to serve
    plugin: 'errorify',    //display errors in browser
    transform: transforms, //browserify transforms
    delay: 0,              //speed up watchify interval
    outfile: 'bundle.js'   //output bundle
  }).on('connect', function(info) {
    console.log("Server running on", info.uri)
    
    //open the browser
    if (argv.open || argv.o) {
      onChange(info.output.glob, function() {
        openURL(info.uri)
      })
    }
  }).on('exit', cb)
})

//the distribution bundle task
gulp.task('bundle', ['sass'], function() {
  var bundler = browserify(entry, { transform: transforms })
        .bundle()
  return bundler
    .pipe(source('index.js'))
    .pipe(streamify(uglify()))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest('./app'))
})