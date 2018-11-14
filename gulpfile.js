// Variable imports
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var cache = require('gulp-cache');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var csso = require('gulp-csso');
var del = require('del');
var gulpIf = require('gulp-if');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var rename = require("gulp-rename");
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');

const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

// Dev tasks
// ---------


// Start browserSync server
gulp.task('browserSync', function(){
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    })
})


// Sass to css compilation
// Gulp task to minify CSS files
gulp.task('styles', function () {
    return gulp.src('./app/scss/main.scss')
      // Compile SASS files
      .pipe(sass({
        outputStyle: 'nested',
        precision: 10,
        includePaths: ['.'],
        onError: console.error.bind(console, 'Sass error:')
      }))
      // Auto-prefix css styles for cross browser compatibility
      .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
      .pipe(gulp.dest('./dist/css'))
      // Minify the file
      .pipe(csso())
      .pipe(rename('main.min.css'))
      // Output
      .pipe(gulp.dest('./dist/css'))
      .pipe(browserSync.reload({ // Reloading with Browser Sync
        stream: true
    }))
  });


// JS  tasks
// ---------

// Checking js for syntax errors
gulp.task('jshint', function(){
    return gulp.src('app/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
})

// Concatinating js
gulp.task('js-concat', ['jshint'],  function(){
    return gulp.src('app/js/**/*.js')
        .pipe(sourcemaps.init())
            .pipe(concat('all.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'))
})

// Building min.js
gulp.task('js-build', ['js-concat'], function(){
    return gulp.src('dist/js/all.js')
        .pipe(uglify().on('error', function(e){
            console.log(e.message);
        }))
        .pipe(concat('all.min.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({ // Reloading with Browser Sync
            stream: true
        }))
})

// Optimizing Images
gulp.task('images', function(){
    return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
})

// Copying fonts
gulp.task('fonts', function(){
    return gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
})

gulp.task('pages', function() {
    return gulp.src(['./app/index.html'])
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }))
      .pipe(gulp.dest('./dist'));
  });

// Cleaning
gulp.task('clean:dist', function(){
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
})


// Build tasks 
// -----------

// Build everything
gulp.task('build', function(callback){
    runSequence(
        'clean:dist',
        'styles',
        'js-build',
        'pages',
        ['images', 'fonts'],
        'browserSync',
        callback
    )
})


// Watchers
// -------

gulp.task('watch', ['build'], function(){
    gulp.watch('app/scss/**/*.scss', ['styles'], browserSync.reload);
    gulp.watch('app/js/**/*.js', ['js-build'], browserSync.reload);
    gulp.watch('dist/index.html', browserSync.reload);
})