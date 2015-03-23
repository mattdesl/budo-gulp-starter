var budo = require('budo')
var gulp = require('gulp')
var sass = require('gulp-sass')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2))
var openURL = require('opn')
var onChange = require('once-file-changes')
var resetCSS = require('node-reset-scss').includePath

//our CSS pre-processor
gulp.task('sass', function() {
  gulp.src('./src/sass/main.scss')
    .pipe(sass({ 
      errLogToConsole: true,
      includePaths: [ resetCSS ] 
    }))
    .pipe(gulp.dest('./app'))
})

gulp.task('watch', ['sass'], function(cb) {
  //watch SASS
  gulp.watch('src/sass/*.scss', ['sass'])

  //dev server
  budo('./src/index.js', {
    live: true,            //live reload & CSS injection
    verbose: true,         //verbose watchify logging
    dir: 'app',            //directory to serve
    plugin: 'errorify',    //display errors in browser
    transform: ['babelify', 'brfs'], //browserify transforms
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