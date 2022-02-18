const
  destination   = require('../lib/destination'),
  gulp          = require('gulp'),
  plumber       = require('gulp-plumber'),
  rimraf        = require('rimraf');

exports.default = function (config) {

  config = config || [];
  const destinationFolder = destination.findFolder();

  const move = (callback) => {

    config.forEach((move) => {

      let destination = move[destinationFolder];

      rimraf(destination, () => {
        gulp.src(move.src)
          .pipe(plumber())
          .pipe(gulp.dest(destination));
      });

    });

    callback();

  }

  return gulp.series(move);

};
