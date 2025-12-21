#!/usr/bin/env node
// apropos
const argv = process.argv.slice(2);
if (!argv[0]) {
  process.stderr.write('apropos: usage: apropos keyword\n');
  process.exit(1);
}
process.stdout.write('apropos: no database (not implemented)\n');
