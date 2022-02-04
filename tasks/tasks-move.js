const
  destination   = require('../lib/destination'),
  gulp          = require('gulp'),
  rimraf        = require('rimraf')

exports.default = function (config) {

  config = config || [];
  const destinationFolder = destination.findFolder();

  const move = (callback) => {

    config.forEach((move) => {

      let destination = move[destinationFolder];

      rimraf(destination, () => {
        gulp.src(move.src)
          .pipe(gulp.dest(destination));
      });

    });

    callback();

  }

  return gulp.series(move);

};