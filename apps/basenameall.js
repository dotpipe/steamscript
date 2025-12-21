#!/usr/bin/env node
// basenameall
const path = require('path');
const argv = process.argv.slice(2);
if (!argv.length) {
  process.stderr.write('basenameall: usage: basenameall path1 [path2 ...]\n');
  process.exit(1);
}
for (const p of argv) console.log(path.basename(p));
