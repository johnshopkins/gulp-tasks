const
  argv          = require('minimist')(process.argv.slice(2)),
  browserify    = require('browserify'),
  concatJS      = require('gulp-concat'),
  destination   = require('../lib/destination'),
  fs            = require('fs'),
  gulp          = require('gulp'),
  gulpESLintNew = require('gulp-eslint-new'),
  gulpif        = require('gulp-if'),
  plumber       = require('gulp-plumber'),
  rimraf        = require('rimraf'),
  sourcemaps    = require('gulp-sourcemaps'),
  through2      = require('through2'),
  uglify        = require('gulp-uglify')
  webpack       = require('webpack-stream');

exports.default = function (config) {

  config = config || {};
  const dest = destination.find(config);

  const lint = (callback) => {

    if (!config.lint || !config.lint.src) {
      return callback();
    }

    let opts = config.opts || {};

    if (config.lint.config) {
      opts.overrideConfigFile = config.lint.config;
    }

    return gulp.src(config.lint.src)
      .pipe(plumber())
      .pipe(gulpESLintNew(opts))
      .pipe(gulpESLintNew.format('stylish'))
      .pipe(gulpESLintNew.failAfterError());
  };

  const remove = (callback) => {
    rimraf(dest, callback);
  };

  const webpackTask = (callback) => {

    if (!config.webpack) {
      return callback();
    }

    return gulp.src(config.webpack.src)
      .pipe(plumber())
      .pipe(webpack(config.webpack.config || {}))
      // .pipe(gulpif(argv.production, uglify()))
      .pipe(gulp.dest(dest));
  };

  const compileJS = (config, dest) => {

    if (!config.src) return;

    let transforms = config.transform || [];

    return gulp.src(config.src)
      .pipe(plumber())
      .pipe(through2.obj(function (file, enc, callback) {

        let b = browserify(file.path, config.browserifyOptions || {});

        transforms.forEach((transform) => {

          let type = typeof transform;
          let opts = {};
          let t = function () {};

          if (type === 'function') {
            t = transform;
          } else if (type === 'object') {
            t = transform[0];
            opts = transform[1] || {};
          }

          b.transform(t, opts);

        });

        b.bundle(function (err, res) {

          if (err) {
            throw new Error(err);
          } else {
            file.contents = res;
            callback(null, file);
          }

        });

      }))
      .pipe(gulpif(!argv.production, sourcemaps.init()))
      .pipe(gulpif(argv.production, uglify()))
      .pipe(gulpif(!argv.production, sourcemaps.write()))
      .pipe(gulp.dest(dest));
  };

  /**
   * Compile JavaScript files
   *
   * Browserify technique borrowed from:
   * https://github.com/substack/node-browserify/issues/1044#issuecomment-72384131
   *
   * Due to `write after end` error when implementing:
   * https://github.com/gulpjs/gulp/blob/master/docs/recipes/browserify-uglify-sourcemap.md
   *
   */
  const compile = (callback) => {

    if (!config.compile) {
      return callback();
    }

    if (Array.isArray(config.compile)) {
      config.compile.map(config => compileJS(config, dest));
    } else {
      compileJS(config.compile, dest);
    }

    callback();

  };

  const concat = (callback) => {

    if (!config.concat) {
      return callback();
    }

    for (let destinationFilename in config.concat) {

      gulp.src(config.concat[destinationFilename])
        .pipe(plumber())
        .pipe(concatJS({ path: destinationFilename + '.js'}))
        .pipe(gulpif(argv.production, uglify()))
        .pipe(gulp.dest(dest));
    }

    callback();

  };

  const minify = (callback) => {

    if (!config.minify) {
      return callback();
    }

    return gulp.src(config.minify.src)
      .pipe(plumber())
      .pipe(gulpif(argv.production, uglify()))
      .pipe(gulp.dest(dest));
  };

  // return gulp.series(lint, compile, concat, minify);
  return gulp.series(lint, remove, webpackTask, compile, concat, minify);

};
