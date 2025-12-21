#!/usr/bin/env node
// findall
const fs = require('fs');
const path = require('path');
const argv = process.argv.slice(2);
let name = null, dir = '.';
for (let i = 0; i < argv.length; ++i) {
  if (argv[i] === '-name' && argv[i+1]) name = argv[++i];
  else dir = argv[i];
}
function walk(d) {
  try {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      if (!name || f === name) process.stdout.write(p + '\n');
    }
  } catch (e) {}
}
walk(dir);
