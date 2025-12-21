#!/usr/bin/env node
// lsdir
const fs = require('fs');
const argv = process.argv.slice(2);
const dir = argv[0] || '.';
try {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) if (f.isDirectory()) console.log(f.name);
} catch (e) {
  process.stderr.write('lsdir: ' + dir + ': ' + e.message + '\n');
}
