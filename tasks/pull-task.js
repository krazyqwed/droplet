'use strict';

const execSync = require('child_process').execSync;

let pull = function() {
  execSync('git pull');
  execSync('git fetch --tags');
};

pull();
