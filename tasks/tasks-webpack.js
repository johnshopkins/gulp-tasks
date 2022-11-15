const
  destination = require('../lib/destination'),
  gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  webpack = require('webpack-stream');

exports.default = function (config) {

  config = config || [];
  const dest = destination.find(config);

  const webpackTask = () => {

    const opts = config.opts || {};

    return gulp.src(config.src)
      .pipe(webpack(opts))
      .pipe(plumber())
      .pipe(gulp.dest(dest));
  }

  return gulp.series(webpackTask);

};
