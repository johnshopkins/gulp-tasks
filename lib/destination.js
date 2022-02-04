const argv = require('minimist')(process.argv.slice(2));

exports.find = function (config) {
  return argv.production || argv.staging ? config.dist : config.build;
};

exports.findFolder = function (config) {
  return argv.production || argv.staging ? 'dist' : 'build';
};