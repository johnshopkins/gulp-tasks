const fs = require('fs');

exports.RevisionManifest = function (config) {

  this.manifestFilename = config.filename;
  this.manifestFileDest = config.dest;
  this.manifestFileLocation = this.manifestFileDest + this.manifestFilename;
  this.mergedmanifestFileLocation = this.manifestFileDest + config.mergedFilename;

  this.get = () => {

    let manifestData = false;

    try {
      const file = fs.readFileSync(this.manifestFileLocation);
      manifestData = JSON.parse(file.toString());
    } catch(e) {
      // file does not exist
    }

    return manifestData;

  };

  this.oldManifestData = this.get();

  this.useNewManifest = () => {
    return this.manifestFileLocation;
  };

  this.useMergedManifest = () => {
    return this.mergedmanifestFileLocation;
  };

  this.merge = () => {
    // there isn't a current manifest; nothing to merge.
    if (this.oldManifestData === false) {
      return this.useNewManifest();
    }

    const mergedManifest = this.createMergedManifest();

    if (!mergedManifest) {
      // no filename revisions
      return false;
    }

    // there are filename changes; write to merged manifest file.
    // note: cannot be written to the manifest file location because
    // that would render the next merge impossible.
    fs.writeFileSync(this.mergedmanifestFileLocation, JSON.stringify(mergedManifest, null, "\t"));

    return this.useMergedManifest();
  };


  /**
   * Compare the old manifest to the new manifest to write
   * changes in filenames to the merged manifest.
   * @return {object} Merged manifest
   */
  this.createMergedManifest = () => {
    this.newManifestData = this.get();

    const merged = {};

    Object.keys(this.newManifestData).forEach(function (key) {

      const oldFilename = this.oldManifestData[key];
      const newFilename = this.newManifestData[key];

      if (oldFilename === newFilename) {
        // filename did not change; do nothing
        return;
      }


      if (typeof oldFilename === "undefined") {
        // new file; add to merged manifest
        merged[key] = newFilename;
        return;
      }

      // filename changed; add to merged manifest
      merged[oldFilename] = newFilename;

    }, this);

    return Object.keys(merged).length > 0 ? merged : false;
  }

};
