const { RevisionManifest } = require('../lib/revision-manifest')
const
  fs            = require('fs'),
  gulp          = require('gulp'),
  getLogger     = require('glogg'),
  rev           = require('gulp-rev'),
  revReplace    = require('gulp-rev-replace'),
  rimraf        = require('rimraf');

exports.default = function (config) {

  config = config || {};

  const dest = config.dist; // destination is always dist files
  const manifest = new RevisionManifest(config.manifest);

  const tempDir = "./gulptemp";
  const tempGlob = "./gulptemp/**";

  const logger = getLogger('Gulp Rev');

  /**
   * Moves the compiled files (from either ./build or ./dist)
   * to a temporary directory, where they will be revved.
   * @param callback
   */
  const moveToTemp = (callback) => {

    try {

      // find first file in the manifest
      const keys = Object.keys(manifest.oldManifestData);
      const firstFile = manifest.oldManifestData[keys[0]];

      // if loading the file doesn't error out, the files are already revisioned; throw error
      fs.readFileSync(config.dist + '/' + firstFile);

      callback(new Error('The files in ' + config.dist + ' are already revisioned! Please recompile and try again.'));

    } catch(e) {

      // files are not revved; continue as planned
      return gulp.src(config.src)
        .pipe(gulp.dest(tempDir));

    }

  };

  /**
   * Deletes the ./build or ./dist folder
   * @param callback
   */
  const removeDest = (callback) => {
    rimraf(dest, callback);
  };

  const revFiles = () => {

    logger.info('Revising filenames and creating new mapping...');

    return gulp.src(tempGlob)
      // rev files
      .pipe(rev())
      .pipe(gulp.dest(dest))

      // write manifest to the root directory
      .pipe(rev.manifest(manifest.manifestFilename))
      .pipe(gulp.dest(manifest.manifestFileDest));

  };

  /**
   * Removes the temporary directory
   * @param callback
   */
  const removeTemp = (callback) => {
    rimraf(tempDir, callback);
  };

  /**
   * Updates file references in template files to match
   * the new filenames.
   * @param callback
   */
  const updateFileReferences = (callback) => {

    // replace source filenames with new revisions in ./dist files
    // example: font-awesome.woff => font-awesome-1223455.woff

    // since these files are compiled from source, they never
    // contain previously revved filenames

    logger.info('Updating filenames in compiled (' + config.dist + ') files...');

    gulp.src(config.src, { base: "./" })
      .pipe(revReplace({
        manifest: gulp.src(manifest.manifestFileLocation),
        replaceInExtensions: ['.js', '.css']
      }))
      .pipe(gulp.dest('.'));


    // replace old revved filenames with new in template files

    logger.info('Merging old and new mapping files...');

    // merge the new and old manifest
    const merged = manifest.merge();

    if (!merged) {
      // no filenames changed; return
      logger.info('No filenames changed in templates during the revisioning process.');
      return callback();
    }

    logger.info('Updating filenames in template files...');

    return gulp.src(config.templates, { base: './'} )
      .pipe(revReplace({
        manifest: gulp.src(merged),
        replaceInExtensions: ['.twig', '.php', '.js']
      }))
      .pipe(gulp.dest('.'));

  };

  return gulp.series(moveToTemp, removeDest, revFiles, removeTemp, updateFileReferences);

};