'use strict'; 
  //## 
  var gulp = require('gulp'); 

  var clean = require('gulp-clean');
  var concat = require('gulp-concat');
  var uglify = require('gulp-uglify');
  var imagemin = require('gulp-imagemin');
  var connect = require('gulp-connect');

  var prefix = require('gulp-autoprefixer'); 
  var jshint = require('gulp-jshint'); 
  var stylish = require('jshint-stylish'); 
  var browserSync = require('browser-sync').create(); 
  var stylus = require('gulp-stylus'); 
  var sourcemaps = require('gulp-sourcemaps'); 
  var reload = browserSync.reload; 
  var nib = require('nib'); 
  //## 
  // Confingure our directories 
  var paths = { 
    dist:   'dist',
    dev:    'dev',
    scripts:'dev/scripts',
    styles: 'dev/styles', 
    html:   'dev/index.html',
    images: 'dev/images', 
  }; 
  //## 
  // Begin Script Tasks 
  //## 

  gulp.task('cleanDevBundles', function() {
    return gulp.src(paths.dev + '/bundles')
    .pipe(clean());
  });

  // Process scripts and concatenate them into one output file
  gulp.task('scripts', ['cleanDevBundles'], function() {
    return gulp.src(paths.scripts + '/**/*.js')
    .pipe(jshint()) 
    .pipe(jshint.reporter(stylish)) 
    .pipe(uglify())
    .on('error', function(){console.log('error, cant minify');this.emit('end');})
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest(paths.dev+'/bundles'));
  });
  //## 
  // Stylus Tasks 
  //## 
  gulp.task('styles', ['scripts'], function () { 
    return gulp.src(paths.styles + '/*.styl') 
      .pipe(sourcemaps.init()) 
      .pipe(stylus({ 
        paths:  ['node_modules'], 
        import: ['stylus-type-utils', 'nib'], 
        use: [nib()], 
        'include css': true 
      })) 
      .on('error', function(err){console.log(err.toString());this.emit('end');}) 
      .pipe(prefix(["last 8 version", "> 1%", "ie 8"])) 
      .pipe(concat('bundle.css'))
      .pipe(sourcemaps.write('.')) 
      .pipe(gulp.dest(paths.dev+'/bundles')) 
      .pipe(browserSync.stream());
  }); 

  //## 
  // Watch 
  //## 
  gulp.task('watch', ['cleanDevBundles'], function () { 
    gulp.watch(paths.dev + '/**/*.js', ['scripts', 'styles']); 
    gulp.watch(paths.dev + '/**/*.styl', ['scripts','styles']); 
    gulp.watch('dev/bundles/**/*.js').on('change', reload); 
    gulp.watch('dev/**/*.html').on('change', reload); 
  }); 
  //## 
  // BrowserSync Task 
  //## 
  gulp.task('browserSyncStatic', function () { 
    browserSync.init({ 
      server: { 
        baseDir: "./dev/" 
      } 
    }); 
  }); 
  //## 
  gulp.task('browserSyncProxy', function () { 
    browserSync.init({ 
      proxy: 'yourlocal.dev' 
    }); 
  }); 



  // Delete the dist directory
  gulp.task('clean', function() {
    return gulp.src(paths.dist)
    .pipe(clean());
  });

  // // Imagemin images and ouput them in dist
  // gulp.task('imagemin', ['clean'], function() {
  //   gulp.src(paths.images)
  //   .pipe(imagemin())
  //   .pipe(gulp.dest(bases.dist + 'images/'));
  // });

  // Copy files to dist directly
  gulp.task('copy', ['scripts', 'styles', 'clean'], function() {
    // Copy html
    gulp.src(paths.html)
    .pipe(gulp.dest(paths.dist));

    // Copy images
    gulp.src([paths.images], {dot: true, base:paths.images})
    .pipe(gulp.dest(paths.dist + '/images'));

    // Copy scripts
    gulp.src([paths.dev+'/bundles/**'], {dot: true, base:paths.dev+'/bundles'})
    .pipe(gulp.dest(paths.dist+'/bundles'));


  });
  gulp.task('startProdServer', ['scripts', 'styles', 'clean', 'copy'], function() {
    connect.server({
      port: 9003,
      root: 'dist'
    });
  });

  //## 
  // Server Tasks 
  //## 
  gulp.task('default', ['cleanDevBundles', 'scripts', 'styles', 'clean', 'copy', 'startProdServer']);
  gulp.task('serve', ['cleanDevBundles', 'scripts', 'styles', 'watch', 'browserSyncStatic']) 
