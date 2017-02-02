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
    js:     'dev/js/**/*.js', 
    css:    'dev/css', 
    styles: 'dev/styles', 
    html:   'dev/index.html',
    images: 'dev/images', 
    dist:   'dist/'
  }; 
  //## 
  // Begin Script Tasks 
  //## 
  gulp.task('lint', function () { 
    return gulp.src([ 
        paths.js 
      ]) 
      .pipe(jshint()) 
      .pipe(jshint.reporter(stylish)) 
  }); 
  //## 
  // Stylus Tasks 
  //## 
  gulp.task('styles', function () { 
    gulp.src(paths.styles + '/*.styl') 
      .pipe(sourcemaps.init()) 
      .pipe(stylus({ 
        paths:  ['node_modules'], 
        import: ['stylus-type-utils', 'nib'], 
        use: [nib()], 
        'include css': true 
      })) 
      .on('error', function(err){console.log(err.toString());this.emit('end');}) 
      .pipe(sourcemaps.write('.')) 
      .pipe(gulp.dest(paths.css)) 
      .pipe(browserSync.stream()); 
  }); 
  //## 
  // Autoprefixer Tasks 
  //## 
  gulp.task('prefix', function () { 
    gulp.src(paths.css + '/*.css') 
      .pipe(prefix(["last 8 version", "> 1%", "ie 8"])) 
      .pipe(gulp.dest(paths.css)); 
  }); 
  //## 
  // Watch 
  //## 
  gulp.task('watch', function () { 
    gulp.watch(paths.js, ['lint']); 
    gulp.watch(paths.styles + '/**/*.styl', ['styles']); 
    gulp.watch('dev/**/*.js').on('change', reload); 
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

  //## 
  // Copy Dist
  //## 
  gulp.task('copyDist', function () { 
    return gulp.src([ 
        paths.js 
      ]) 
      .pipe(jshint()) 
      .pipe(jshint.reporter(stylish)) 
  }); 




  // Delete the dist directory
  gulp.task('clean', function() {
    return gulp.src(paths.dist)
    .pipe(clean());
  });

  // // Process scripts and concatenate them into one output file
  // gulp.task('scripts', ['clean'], function() {
  //   gulp.src(paths.scripts, {cwd: bases.app})
  //   .pipe(jshint())
  //   .pipe(jshint.reporter('default'))
  //   .pipe(uglify())
  //   .pipe(concat('app.min.js'))
  //   .pipe(gulp.dest(bases.dist + 'scripts/'));
  // });

  // // Imagemin images and ouput them in dist
  // gulp.task('imagemin', ['clean'], function() {
  //   gulp.src(paths.images)
  //   .pipe(imagemin())
  //   .pipe(gulp.dest(bases.dist + 'images/'));
  // });

  // Copy all other files to dist directly
  gulp.task('copy', ['clean'], function() {
    // Copy html
    gulp.src(paths.html)
    .pipe(gulp.dest(paths.dist));

    // Copy images
    gulp.src(paths.images)
    .pipe(gulp.dest(paths.dist + 'images/'));

    // Copy css
    gulp.src(paths.css + '/*.css')
    .pipe(gulp.dest(paths.dist + 'css/'));

    // Copy scripts
    gulp.src(paths.js)
    .pipe(gulp.dest(paths.dist + 'js/'));
  });
  gulp.task('productionserver', function() {
    connect.server({
      port: 80,
      root: 'dist'
    });
  });

  //## 
  // Server Tasks 
  //## 
  gulp.task('default', ['clean', 'copy', 'productionserver']);
  gulp.task('serve', ['styles', 'lint', 'watch', 'prefix', 'browserSyncStatic']) 
