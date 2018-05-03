/* eslint-env node */

const gulp = require('gulp');
const browserify = require('gulp-bro');
const htmlmin = require('gulp-htmlmin');
const babelify = require('babelify');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const responsive = require('gulp-responsive');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const smoosher = require('gulp-smoosher');

gulp.task('default', ['styles', 'copy-html', 'scripts', 'copy-manifest'],() => {
  gulp.watch('*/**/*.scss', ['styles']).on('change', browserSync.reload);
  gulp.watch(['dev/*.html'], ['copy-html']).on('change', browserSync.reload);
  gulp.watch(['dev/js/**/*.js', 'dev/sw.js'], ['scripts']).on('change', browserSync.reload);
  gulp.watch('dev/manifest.json', ['copy-manifest']).on('change', browserSync.reload);
  gulp.watch([
    'dist/index.html',
    'dist/restaurant.html'
  ]).on('change', browserSync.reload);
  browserSync.init({server: 'dist'});
});

gulp.task('build', ['styles', 'copy-html', 'scripts-dist', 'copy-manifest'], () => {
  gulp.watch('*/**/*.scss', ['styles']).on('change', browserSync.reload);
  gulp.watch(['dev/*.html'], ['copy-html']).on('change', browserSync.reload);
  gulp.watch(['dev/js/**/*.js', 'dev/sw.js'], ['scripts-dist']).on('change', browserSync.reload);
  gulp.watch('dev/manifest.json', ['copy-manifest']).on('change', browserSync.reload);
  gulp.watch([
    'dist/index.html',
    'dist/restaurant.html'
  ]).on('change', browserSync.reload);
  browserSync.init({server: 'dist'});
});

gulp.task('dist', ['styles', 'copy-html', 'scripts-dist', 'copy-data', 'copy-manifest']);

gulp.task('scripts', () => {
  gulp.src(['dev/js/main.js', 'dev/js/restaurant_info.js'])
    .pipe(browserify({
      transform: [
        babelify.configure({ presets: ['es2015'] })
      ]
    }))
    .pipe(gulp.dest('dist/js'));
  gulp.src('dev/sw.js')
    .pipe(browserify({
      transform: [
        babelify.configure({ presets: ['es2015'] })
      ]
    })) 
    .pipe(gulp.dest('dist'));
  });
  
  gulp.task('scripts-dist', () => {
    gulp.src(['dev/js/main.js', 'dev/js/restaurant_info.js'])
      .pipe(browserify({
        transform: [
          babelify.configure({ presets: ['es2015'] }),
          ['uglifyify', { global: true, sourceMap: false }]
        ]
      }))
      .pipe(uglify())
      .pipe(uglify())
      .pipe(uglify())
      .pipe(gulp.dest('dist/js'));
    gulp.src('dev/sw.js')
      .pipe(browserify({
        transform: [
          babelify.configure({ presets: ['es2015'] }),
          ['uglifyify', { global: true, sourceMap: false }]
        ]
      }))
      .pipe(gulp.dest('dist'));
});

gulp.task('copy-html', () => {
  gulp.src(['dev/index.html'])
    .pipe(smoosher())
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/'));
    gulp.src(['dev/restaurant.html'])
    .pipe(smoosher())
    .pipe(htmlmin({ collapseWhitespace: true}))
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy-data', () => {
  gulp.src('dev/data/*')
    .pipe(gulp.dest('dist/data'));
});

gulp.task('copy-manifest', () => {
  gulp.src('dev/manifest.webmanifest')
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-images', () => {
  gulp.src('dev/assets/img/jpg/*')
    .pipe(responsive({
      '*.jpg': [{
        width: 40,
        quality: 10,
        rename: {
          suffix: '-lazy',
        },
      }, {
        width: 280,
        quality: 50,
        rename: {
          suffix: '-small_x1',
          },
      }, {
        width: 350,
        rename: {
          suffix: '-small_x2',
          },
      }, {
        width: 500,
        rename: {
          suffix: '-medium_x1',
        },
      }, {
        width: 600,
        rename: {
          suffix: '-medium_x2',
        },
      }, {
        width: 800,
        rename: {
          suffix: '-large_x1',
        },
      }, {
        rename: { suffix: '-large_x2' },
      }],
    }, {
      quality: 40,
      progressive: true,
      withMetadata: false,
    }))
    // .pipe(imagemin({
    //   progressive: true
    // }))
    .pipe(gulp.dest('dist/assets/img/jpg'));
  gulp.src('dev/assets/img/png/*')
    .pipe(imagemin({
      optimizationLevel: 7,
    }))
    .pipe(gulp.dest('dist/assets/img/png'));
  gulp.src('dev/assets/img/svg/*')
    .pipe(gulp.dest('dist/assets/img/svg'));
});

gulp.task('webp', () => {
  gulp.src('dist/assets/img/jpg/*')
    .pipe(webp())
    .pipe(gulp.dest('dist/assets/img/webp'));
})

gulp.task('styles', () => {
  gulp.src('dev/assets/sass/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(gulp.dest('dev/assets/css'))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(browserSync.stream());
  gulp.src('dev/assets/css/fonts/*')
    .pipe(gulp.dest('dist/assets/css/fonts/'));
});