'use strict';

const fs = require('fs');
const getLatestSemverTag = require('git-latest-semver-tag');

const setVersionJson = function(revision) {
  fs.writeFileSync('./version.json', '{ "version": "' + revision + '" }');
}

getLatestSemverTag(function(err, revision) {
  setVersionJson(revision);
});
