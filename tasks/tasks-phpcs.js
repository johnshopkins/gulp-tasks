const
  gulp          = require('gulp'),
  plumber       = require('gulp-plumber'),
  phpcs        = require('gulp-phpcs');

exports.default = function (config) {

  config = config || {};

  const phpcsTask = () => {

    const opts = config.opts || {};
    const reporter = config.reporter || { type: 'log', opts: {}};
    const reporterOpts = reporter.opts || {};

    return gulp.src(config.src)
      .pipe(plumber())
      .pipe(phpcs(opts))
      .pipe(phpcs.reporter(reporter.type, reporterOpts));
  }

  return gulp.series(phpcsTask);

};
