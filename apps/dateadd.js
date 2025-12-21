#!/usr/bin/env node
// dateadd
const argv = process.argv.slice(2);
if (argv.length < 2) {
  process.stderr.write('dateadd: usage: dateadd date days\n');
  process.exit(1);
}
const date = new Date(argv[0]);
const days = parseInt(argv[1]);
if (isNaN(date.getTime()) || isNaN(days)) {
  process.stderr.write('dateadd: invalid input\n');
  process.exit(1);
}
date.setDate(date.getDate() + days);
console.log(date.toISOString().slice(0,10));
