#!/usr/bin/env node
// units
const argv = process.argv.slice(2);
if (argv.length < 2) {
  process.stderr.write('units: usage: units value unit\n');
  process.exit(1);
}
const value = parseFloat(argv[0]);
const unit = argv[1];
if (isNaN(value)) {
  process.stderr.write('units: invalid value\n');
  process.exit(1);
}
console.log(`${value} ${unit} = ${value} ${unit} (no conversion)`);
