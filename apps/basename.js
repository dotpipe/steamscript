#!/usr/bin/env node
// basename
const path = require('path');
const argv = process.argv.slice(2);
if (!argv[0]) {
  process.stderr.write('basename: usage: basename path\n');
  process.exit(1);
}
console.log(path.basename(argv[0]));
