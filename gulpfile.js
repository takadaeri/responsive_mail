// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// gulp node modules
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// gulp ----------
var gulp        = require('gulp')
var _           = require('lodash')
var rename      = require('gulp-rename')

// html ----------
var jade        = require('gulp-jade')
var prettify    = require('gulp-prettify')
var replace     = require('gulp-replace')

// build & watch ----------
var plumber     = require('gulp-plumber')          
var debug       = require('gulp-debug')            
var runSequence = require('run-sequence')          
var through2    = require('through2')              
var watch       = require('gulp-watch')            
var fs          = require('fs-extra')              
var path        = require('path')                  
var ssi         = require('browsersync-ssi')
var browserSync = require('browser-sync')


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// setting
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var DEST = './dist';
var SRC = './src';
var paths = {
  html: [SRC + "/**/*.jade", "!" + SRC + "/**/_**/*.jade", "!" + SRC + "/**/_*.jade", "!" + SRC + "/_**/_**/*.jade"]
};
var expand = function(ext) {
  return rename(function(path) {
    return _.tap(path, function(p) {
      return p.extname = "." + ext;
    });
  });
};


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// task
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// html jade
// --------------------------------------------------------------

var PATH_ = '';
var DISTPATH_ = '';

gulp.task('jade_first', function() {
  gulp.src(paths.html)
    .pipe(debug())
    .pipe(plumber())
    .pipe(jade({ pretty: false, basedir: 'src/_jade/' }))
    .pipe(expand('html'))
    .pipe(prettify({ indent_size: 2}))
    .pipe(gulp.dest(DEST));
});

gulp.task('jade', function() {
  gulp.src(PATH_)
    .pipe(debug())
    .pipe(plumber())
    .pipe(jade({ pretty: false, basedir: 'src/_jade/' }))
    .pipe(expand('html'))
    .pipe(prettify({ indent_size: 2}))
    .pipe(gulp.dest(DISTPATH_));
});

var jadeWatch = function(epath) {
  var c, distpath, filepaths, i, j, ref;
  PATH_ = epath;
  c = PATH_.split('¥').join('/');
  c = c.split('\\').join('/');
  filepaths = c.split('/');
  distpath = '';
  for (i = j = 0, ref = filepaths.length - 2; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
    if (filepaths[i] === 'src') {
      distpath = distpath + 'dist/';
    } else {
      distpath = distpath + filepaths[i] + '/';
    }
  }
  return DISTPATH_ = distpath;
};

// browser-sync
// --------------------------------------------------------------

gulp.task("browser-sync", function() {
  return browserSync({
    ghostMode: false,
    reloadDebounce: 400,
    scrollProportionally: true,
    port: 4300,
    server: {
      baseDir: DEST,
      middleware: ssi({
        baseDir: DEST,
        ext: '.html'
      })
    }
  });
});
gulp.task("browser-sync-reload", function() {
  browserSync.reload({
    once: true
  });
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// watch
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

gulp.task('watch', function(e) {

  watch([paths.html[0], SRC + "**/_*.jade"], function(e) {
    var PATH_, re;
    console.log('----------------------------------------');
    re = /( - )/;
    PATH_ = e.path;
    if (PATH_.match(re)) {
      console.log('this is copipe file ...');
      return false;
    } else {
      jadeWatch(e.path);
      if (e.path.match(/_jade/)) {
        return console.log(e.path + ' is template file ...');
      } else if (e.path.match(/include/)) {
        return runSequence('jade','browser-sync-reload');
      } else {
        return runSequence('jade','browser-sync-reload');
      }
    }
  });

});


gulp.task('default', function() {
  return runSequence('jade_first', 'browser-sync', 'watch');
});




