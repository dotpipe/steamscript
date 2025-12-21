#!/usr/bin/env node
// datemath
const argv = process.argv.slice(2);
if (argv.length < 3) {
  process.stderr.write('datemath: usage: datemath date op days\n');
  process.exit(1);
}
const date = new Date(argv[0]);
const op = argv[1];
const days = parseInt(argv[2]);
if (isNaN(date.getTime()) || isNaN(days)) {
  process.stderr.write('datemath: invalid input\n');
  process.exit(1);
}
if (op === '+') date.setDate(date.getDate() + days);
else if (op === '-') date.setDate(date.getDate() - days);
else {
  process.stderr.write('datemath: invalid operator\n');
  process.exit(1);
}
console.log(date.toISOString().slice(0,10));
