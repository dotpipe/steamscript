// quickjs_test_runner.js - Run test.js or test_shell.js in QuickJS
// Usage: qjs quickjs_shell.js quickjs_test_runner.js

importScripts = globalThis.importScripts || function(f) { /* no-op for QuickJS */ };

// Try to load test.js or test_shell.js
globalThis.stdout = stdout;
globalThis.stderr = stderr;

async function main() {
  let testFn = null;
  if (typeof run_tests === 'function') testFn = run_tests;
  else if (typeof test_shell === 'function') testFn = test_shell;
  if (!testFn) {
    stdout('No test function found. Please load test.js or test_shell.js after quickjs_shell.js.\n');
    return;
  }
  const result = await testFn([], { stdout, stderr, stdin: () => '' });
  if (result === 0) stdout('ALL TESTS PASSED\n');
  else stderr('SOME TESTS FAILED\n');
}

main();
