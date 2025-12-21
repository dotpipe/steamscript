#!/usr/bin/env node
// bc
const argv = process.argv.slice(2);
if (!argv.length) {
  process.stderr.write('bc: usage: bc expression\n');
  process.exit(1);
}
try {
  // Evaluate as floating point
  const result = eval(argv.join(' '));
  console.log(result);
} catch (e) {
  process.stderr.write('bc: invalid expression\n');
}
