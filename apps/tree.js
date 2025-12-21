#!/usr/bin/env node
// tree
const fs = require('fs');
const path = require('path');
const argv = process.argv.slice(2);
const root = argv[0] || '.';
function walk(dir, prefix) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach((f, i) => {
      const p = path.join(dir, f);
      const isLast = i === files.length - 1;
      console.log(prefix + (isLast ? '└── ' : '├── ') + f);
      if (fs.statSync(p).isDirectory()) walk(p, prefix + (isLast ? '    ' : '│   '));
    });
  } catch (e) {}
}
console.log(root);
walk(root, '');
