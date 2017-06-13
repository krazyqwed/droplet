'use strict';

const fs = require('fs');
const conventionalRecommendedBump = require('conventional-recommended-bump');
const gitLatestTag = require('git-latest-tag');
const semver = require('semver');
const execSync = require('child_process').execSync;

const getRevision = function(callback) {
  gitLatestTag(function(err, revision) {
    callback(revision);
  });
};

const bumpRevision = function(revision, callback) {
  conventionalRecommendedBump({ preset: 'angular' }, function(err, result) {
    let nextRevision = semver.inc(revision, result.releaseType);
    callback(nextRevision);
  });
};

const setRevision = function(revision) {
  revision = 'v' + revision;

  execSync('git tag "' + revision + '"');
  execSync('git push --tags');
};

const push = function() {
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
