const { src, dest, watch, parallel, series } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const scss = require('gulp-sass')(require('sass'));
const del = require('del');

function browserWatch() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }, notify: false, browser: 'chrome'
  })
};

function buildStyles() {
  return src('app/scss/style.scss')
    .pipe(scss())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(concat('style.min.css'))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
};

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
};

function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
};

function build() {
  return src([
    'app/**/*.html',
    'app/css/style.min.css',
    'app/js/main.min.js'
  ], { base: 'app' })
    .pipe(dest('dist'))
};

function cleanDist() {
  return del('dist')
};

function watching() {
  watch(['app/scss/**/*.scss'], buildStyles),
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts),
    watch(['app/**/*.html']).on('change', browserSync.reload);
};

exports.buildStyles = buildStyles;
exports.scripts = scripts;
exports.browserWatch = browserWatch;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);
exports.default = parallel(buildStyles, scripts, browserWatch, watching);