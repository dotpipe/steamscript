#!/usr/bin/env node
// factor
const argv = process.argv.slice(2);
const n = parseInt(argv[0]);
if (isNaN(n) || n < 1) {
  process.stderr.write('factor: usage: factor number\n');
  process.exit(1);
}
let f = 2, out = [];
let x = n;
while (x > 1) {
  if (x % f === 0) {
    out.push(f);
    x /= f;
  } else {
    f++;
  }
}
console.log(out.join(' '));
