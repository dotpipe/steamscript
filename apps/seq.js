#!/usr/bin/env node
// seq
const argv = process.argv.slice(2);
const start = argv.length === 3 ? parseInt(argv[0]) : 1;
const end = argv.length === 3 ? parseInt(argv[1]) : parseInt(argv[0]);
const step = argv.length === 3 ? parseInt(argv[2]) : 1;
if (isNaN(start) || isNaN(end) || isNaN(step)) {
  process.stderr.write('seq: usage: seq [start] end [step]\n');
  process.exit(1);
}
for (let i = start; i <= end; i += step) console.log(i);
