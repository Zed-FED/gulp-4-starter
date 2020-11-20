const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const terser = require('gulp-terser');
const webpack = require('webpack-stream');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const mode = require('gulp-mode')();
const browserSync = require('browser-sync').create();
var sassPaths = ["./node_modules"];
// const fileinclude = require('gulp-file-include');

const clean = () => {
  return del(['dist']);
}

const cleanImages = () => {
  return del(['dist/assets/images']);
}

const cleanFonts = () => {
  return del(['dist/assets/fonts']);
}

const css = () => {
  return src('src/scss/index.scss')
    .pipe(mode.development( sourcemaps.init() ))
    .pipe(sass({includePaths: sassPaths}))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename('app.css'))
    .pipe(mode.production( csso() ))
    .pipe(mode.development( sourcemaps.write() ))
    .pipe(dest('dist'))
    .pipe(mode.development( browserSync.stream()) );
}

const js = () => {
  return src('src/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(webpack({
      mode: 'development',
      devtool: 'inline-source-map'
    }))
    .pipe(mode.development( sourcemaps.init({ loadMaps: true }) ))
    .pipe(rename('app.js'))
    .pipe(mode.production( terser({ output: { comments: false } }) ))
    .pipe(mode.development( sourcemaps.write() ))
    .pipe(dest('dist'))
    .pipe(mode.development( browserSync.stream() ));
}

const copyImages = () => {
  return src('src/assets/images/**/*.{png,jpg,jpeg,gif,svg}')
    .pipe(dest('dist/assets/images'));
}

const copyFonts = () => {
  return src('src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}')
    .pipe(dest('dist/assets/fonts'));
}

// const copyHtml = () => {
//   return src('*.html')
//     .pipe(dest('dist/html'));
// }

// const include = () => {
//     return src(['*.html'])
//     .pipe(fileinclude({
//       prefix: '@@',
//       basepath: '@file'
//     }))
//     .pipe(dest('./'));
// }

const watchForChanges = () => {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  watch('src/scss/**/*.scss', css);
  watch('src/**/*.js', js);
  watch('**/*.html').on('change', browserSync.reload);
  watch('src/assets/images/**/*.{png,jpg,jpeg,gif,svg}', series(cleanImages, copyImages));
  watch('src/assets/fonts/**/*.{svg,eot,ttf,woff,woff2}', series(cleanFonts, copyFonts));
}

exports.default = series(clean, parallel(css, js, copyImages, copyFonts), watchForChanges);
exports.build = series(clean, parallel(css, js, copyImages, copyFonts));