// Variable imports
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var cache = require('gulp-cache');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var del = require('del');
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');


// Dev tasks
// ---------


// Start browserSync server
gulp.task('browserSync', function(){
    browserSync.init({
        server: {
            baseDir: 'app'
        }
    })
})

// Sass to css compilation
gulp.task('sass', function(){
    return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
        .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
        .pipe(gulp.dest('app/css')) // Outputs it in the css folder
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


// Optimizing CSS and JavaScript
gulp.task('useref', function(){
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulpIf('**/*.js', uglify()))
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulp.dest('dist'));
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
        'sass',
        'js-build',
        ['useref', 'images', 'fonts'],
        'browserSync',
        callback
    )
})


// Watchers
// -------

gulp.task('watch', ['build'], function(){
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/js/**/*.js', ['js-build']);
    gulp.watch('app/*.html', browserSync.reload);
})