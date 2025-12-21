// test_system.js - Unittest for js_shell system
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
}

function runShell(args, env = {}) {
  const result = spawnSync('node', ['js_shell.js', ...args], {
    cwd: __dirname,
    env: { ...process.env, ...env },
    input: '',
    encoding: 'utf-8',
    timeout: 10000,
  });
  return result;
}

function testLogin() {
  // Add a test user
  const usermgr = path.join(__dirname, 'js_shell.js');
  spawnSync('node', [usermgr, 'usermgr', 'add', 'testuser', 'testpass'], { cwd: __dirname });
  // Generate a key for testuser
  const keygen = path.join(__dirname, 'keygen.js');
  spawnSync('node', [keygen, 'testuser'], { cwd: __dirname });
  const key = fs.readFileSync(path.join(__dirname, 'users', 'testuser', '.shellkey'), 'utf-8').trim();
  // Try login
  const result = runShell([], { SHELL_KEY: key, JS_SHELL_USER: 'testuser' });
  assert(result.status === 0, 'Login should succeed');
  assert(result.stdout.includes('testuser'), 'Prompt should show testuser');
}

function testCommands() {
  // Use testuser
  const key = fs.readFileSync(path.join(__dirname, 'users', 'testuser', '.shellkey'), 'utf-8').trim();
  // Test ls, touch, cat, rm
  let result = runShell(['touch', 'afile.txt'], { SHELL_KEY: key, JS_SHELL_USER: 'testuser' });
  assert(result.status === 0, 'touch should succeed');
  result = runShell(['ls'], { SHELL_KEY: key, JS_SHELL_USER: 'testuser' });
  assert(result.stdout.includes('afile.txt'), 'ls should show afile.txt');
  fs.writeFileSync(path.join(__dirname, 'users', 'testuser', 'afile.txt'), 'hello');
  result = runShell(['cat', 'afile.txt'], { SHELL_KEY: key, JS_SHELL_USER: 'testuser' });
  assert(result.stdout.includes('hello'), 'cat should show file contents');
  result = runShell(['rm', 'afile.txt'], { SHELL_KEY: key, JS_SHELL_USER: 'testuser' });
  assert(result.status === 0, 'rm should succeed');
}

function testAdmin() {
  // Home user can reset key
  const key = fs.readFileSync(path.join(__dirname, 'users', 'home', '.shellkey'), 'utf-8').trim();
  let result = runShell(['resetkey', 'testuser'], { SHELL_KEY: key, JS_SHELL_USER: 'home' });
  assert(result.stdout.includes('New key for testuser'), 'resetkey should work for admin');
}

function runAll() {
  try {
    testLogin();
    testCommands();
    testAdmin();
    console.log('ALL TESTS PASSED');
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

runAll();
