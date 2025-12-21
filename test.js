// test.js - Minimal silent test runner for js_shell
// Usage: run as a JS app inside js_shell or browser

async function run_tests(args, io) {
  let results = [];
  async function ttest(cmd, args, expect, desc) {
    let output = '';
    let status = 0;
    try {
      status = await runApp(cmd, args, {
        stdout: s => output += s,
        stderr: s => output += s,
        stdin: () => ''
      });
    } catch (e) {
      status = 1;
    }
    const pass = expect(output, status);
    results.push({ cmd, args, pass, desc });
    io.stdout(`TEST ${cmd} ${desc} ${pass ? 'PASS' : 'FAIL'}\n`);
  }

  // Test touch
  await ttest('touch', ['afile.txt'], (out, st) => st === 0, 'create file');
  // Test ls
  await ttest('ls', [], (out) => out.indexOf('afile.txt') !== -1, 'list file');
  // Test echo
  await ttest('echo', ['hello'], (out) => out.indexOf('hello') !== -1, 'echo output');
  // Test cat
  await ttest('cat', ['afile.txt'], (out) => true, 'cat file');
  // Test rm
  await ttest('rm', ['afile.txt'], (out, st) => st === 0, 'remove file');
  // Test ls after rm
  await ttest('ls', [], (out) => out.indexOf('afile.txt') === -1, 'file removed');

  // Admin command (should fail for non-home)
  if (typeof JS_SHELL_USER !== 'undefined' && JS_SHELL_USER !== 'home') {
    await ttest('resetkey', ['testuser'], (out) => out.indexOf('Only the home user') !== -1, 'admin only');
  }

  // Summary
  const failed = results.filter(r => !r.pass);
  if (failed.length === 0) io.stdout('ALL TESTS PASSED\n');
  else io.stderr('SOME TESTS FAILED\n');
  return failed.length === 0 ? 0 : 1;
}

// Expose for browser or shell
if (typeof window !== 'undefined') {
  window.run_tests = run_tests;
}
