'use strict';

const execSync = require('child_process').execSync;

const pull = function() {
  execSync('git pull');
  execSync('git fetch --tags');
};

pull();
