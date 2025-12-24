#!/usr/bin/env node
// lsfile
const fs = require('fs');
const argv = process.argv.slice(2);
const dir = argv[0] || '.';
const { addAlertFromException } = require('./htodo_alert');
try {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) if (f.isFile()) console.log(f.name);
} catch (e) {
  process.stderr.write('lsfile: ' + dir + ': ' + e.message + '\n');
  addAlertFromException('lsfile', e);
}
