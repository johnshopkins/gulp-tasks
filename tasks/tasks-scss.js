const
  argv          = require('minimist')(process.argv.slice(2)),
  cleanCSS      = require('gulp-clean-css'),
  destination   = require('../lib/destination'),
  gulp          = require('gulp'),
  gulpif        = require('gulp-if'),
  plumber       = require('gulp-plumber'),
  rimraf        = require('rimraf'),
  sass          = require('gulp-dart-sass'),
  sassLint      = require('gulp-sass-lint'),
  sourcemaps    = require('gulp-sourcemaps');

exports.default = function (config) {

  config = config || {};
  const dest = destination.find(config);

  const lint = (callback) => {

    if (!config.lint || !config.lint.src) {
      return callback();
    }

    let opts = config.lint.opts || { formatter: 'stylish' };

    if (config.lint.config) {
      opts.configFile = config.lint.config;
    }

    return gulp.src(config.lint.src)
      .pipe(plumber())
      .pipe(sassLint(opts))
      .pipe(sassLint.format())
      .pipe(sassLint.failOnError());
  };

  const remove = (callback) => {
    rimraf(dest, callback);
  };

  const compile = () => {

    let opts = config.opts || {};

    return gulp.src(config.src)
      .pipe(plumber())
      .pipe(gulpif(!argv.production, sourcemaps.init()))
      .pipe(sass(opts).on('error', sass.logError))
      .pipe(gulpif(!argv.production, sourcemaps.write()))
      .pipe(gulpif(argv.production, cleanCSS()))
      .pipe(gulp.dest(dest));
  };

  return gulp.series(lint, remove, compile);

};