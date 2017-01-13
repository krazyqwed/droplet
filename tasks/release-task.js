'use strict';

const fs = require('fs');
const conventionalRecommendedBump = require('conventional-recommended-bump');
const gitLatestSemverTag = require('git-latest-semver-tag');
const semver = require('semver');
const execSync = require('child_process').execSync;

let getRevision = function(callback) {
  gitLatestSemverTag(function(err, revision) {
    callback(revision);
  });
};

let bumpRevision = function(revision, callback) {
  conventionalRecommendedBump({ preset: 'angular' }, function(err, result) {
    let nextRevision = semver.inc(revision, result.releaseType);
    callback(nextRevision);
  });
};

let setRevision = function(revision) {
  revision = 'v' + revision;

  execSync('git tag "' + revision + '"');
  execSync('git push --tags');
};

let push = function() {
  execSync('git push origin master');
};

if (!process.argv[2]) {
  getRevision(function(revision) {
    bumpRevision(revision, function(nextRevision) {
      setRevision(nextRevision);
      push();
    });
  });
} else {
  push();
}
