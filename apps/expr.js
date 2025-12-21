#!/usr/bin/env node
// expr
const argv = process.argv.slice(2);
if (!argv.length) {
  process.stderr.write('expr: usage: expr expression\n');
  process.exit(1);
}
try {
  // Evaluate simple arithmetic expressions
  const result = eval(argv.join(' '));
  console.log(result);
} catch (e) {
  process.stderr.write('expr: invalid expression\n');
}
