// test_shell.js - Pure JS/QuickJS-compatible system test for js_shell
// This script should be run inside the js_shell environment as a JS app
// It does not use Node.js modules

export default async function test_shell(args, io) {
  let passed = 0, failed = 0;
  function assert(cond, msg) {
    if (cond) {
      io.stdout('PASS: ' + msg + '\n');
      passed++;
    } else {
      io.stderr('FAIL: ' + msg + '\n');
      failed++;
    }
  }

  // Simulate shell commands using the shell's own command runner
  // Assume global runApp(cmd, args, io) is available in the shell context
  // If not, adapt to your shell's command execution API

  // Test: create a file
  let output = '';
  await runApp('touch', ['testfile.txt'], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  assert(output === '', 'touch should not error');

  // Test: list file
  output = '';
  await runApp('ls', [], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  assert(output.indexOf('testfile.txt') !== -1, 'ls should show testfile.txt');

  // Test: write and read file
  output = '';
  await runApp('echo', ['hello', 'world', '>', 'testfile.txt'], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  output = '';
  await runApp('cat', ['testfile.txt'], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  assert(output.indexOf('hello') !== -1, 'cat should show file contents');


  // Test: remove file
  output = '';
  await runApp('rm', ['testfile.txt'], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  output = '';
  await runApp('ls', [], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  assert(output.indexOf('testfile.txt') === -1, 'rm should remove testfile.txt');

  // Test: clear command (should emit ANSI clear sequence)
  output = '';
  await runApp('clear', [], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  assert(output.indexOf('\x1b[2J') !== -1, 'clear should emit ANSI clear sequence');

  // Test: date command (should output current year)
  output = '';
  await runApp('date', [], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  const year = new Date().getFullYear().toString();
  assert(output.indexOf(year) !== -1, 'date should show current year');

  // Test: whoami command (should output user)
  output = '';
  await runApp('whoami', [], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  assert(output.trim().length > 0, 'whoami should output user');

  // Test: mkdir and rmdir
  output = '';
  await runApp('mkdir', ['testdir'], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  assert(require('fs').existsSync('testdir'), 'mkdir should create directory');
  output = '';
  await runApp('rmdir', ['testdir'], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  assert(!require('fs').existsSync('testdir'), 'rmdir should remove directory');

  // Test: admin command (should fail for non-home)
  output = '';
  await runApp('resetkey', ['testuser'], {
    stdout: s => output += s,
    stderr: s => output += s,
    stdin: () => ''
  });
  if (typeof JS_SHELL_USER !== 'undefined' && JS_SHELL_USER !== 'home') {
    assert(output.indexOf('Only the home user') !== -1, 'resetkey should be admin-only');
  }

  io.stdout(`\nTests complete: ${passed} passed, ${failed} failed.\n`);
  if (failed === 0) io.stdout('ALL TESTS PASSED\n');
  else io.stderr('SOME TESTS FAILED\n');
  return failed === 0 ? 0 : 1;
}
