'use strict';

const fs = require('fs');

const prepare = function() {
  const version = JSON.parse(fs.readFileSync('./version.json')).version.slice(1);
  const options = {
    name: 'Droplet',
    version: version,
    main: 'main.js'
  };

  fs.writeFileSync('./dist/package.json', JSON.stringify(options));
}

prepare();
