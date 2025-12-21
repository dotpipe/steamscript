#!/usr/bin/env node
// basenameext
const path = require('path');
const argv = process.argv.slice(2);
if (!argv[0]) {
  process.stderr.write('basenameext: usage: basenameext path\n');
  process.exit(1);
}
console.log(path.basename(argv[0], path.extname(argv[0])));
