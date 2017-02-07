'use strict';

const fs = require('fs');
const getLatestTag = require('git-latest-tag');

const setVersionJson = function(revision) {
  fs.writeFileSync('./version.json', '{ "version": "' + revision + '" }');
}

getLatestTag(true, function(err, tag) {
  setVersionJson(tag);
});
