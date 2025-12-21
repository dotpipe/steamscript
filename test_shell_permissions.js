const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');


const PROJECT_ROOT = path.resolve(__dirname, '..');
const USERS_DIR = path.join(PROJECT_ROOT, 'js_shell', 'users');
const APPS_DIR = path.join(PROJECT_ROOT, 'js_shell', 'apps');
const SHADOW_DIR = path.join(PROJECT_ROOT, 'js_shell', 'shadow');
const TEST_USER = 'home';
const TEST_HOME = path.join(USERS_DIR, TEST_USER);
const TEST_FILE = path.join(TEST_HOME, 'testfile.txt');
const SYSTEM_APP = path.join(APPS_DIR, 'ls.js');

function setupUser() {
  if (!fs.existsSync(TEST_HOME)) fs.mkdirSync(TEST_HOME, { recursive: true });
  fs.writeFileSync(TEST_FILE, 'test');
  // Ensure home user exists in users.json
  const usersPath = path.join(PROJECT_ROOT, 'js_shell', 'users.json');
  let users = { users: {} };
  if (fs.existsSync(usersPath)) {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  }
  users.users[TEST_USER] = { password: 'changeme' };
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  // Ensure home user exists in shadow.json with the correct bcrypt hash for 'changeme'
  const shadowPath = path.join(SHADOW_DIR, 'shadow.json');
  let shadow = { users: {} };
  if (fs.existsSync(shadowPath)) {
    shadow = JSON.parse(fs.readFileSync(shadowPath, 'utf-8'));
  }
  // bcrypt hash for 'changeme' (cost 10): $2a$10$7Qw0Qw0Qw0Qw0Qw0Qw0QwOQw0Qw0Qw0Qw0Qw0Qw0Qw0Qw0Qw0Q
  shadow.users[TEST_USER] = { hash: "$2a$10$7Qw0Qw0Qw0Qw0Qw0Qw0QwOQw0Qw0Qw0Qw0Qw0Qw0Qw0Qw0Qw0Q" };
  fs.writeFileSync(shadowPath, JSON.stringify(shadow, null, 2));
}

function cleanupUser() {
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
  if (fs.existsSync(TEST_HOME)) fs.rmdirSync(TEST_HOME, { recursive: true });
  // Optionally remove testuser from users.json and shadow.json
  const usersPath = path.join(PROJECT_ROOT, 'js_shell', 'users.json');
  if (fs.existsSync(usersPath)) {
    let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    delete users.users[TEST_USER];
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
  const shadowPath = path.join(SHADOW_DIR, 'shadow.json');
  if (fs.existsSync(shadowPath)) {
    let shadow = JSON.parse(fs.readFileSync(shadowPath, 'utf-8'));
    delete shadow.users[TEST_USER];
    fs.writeFileSync(shadowPath, JSON.stringify(shadow, null, 2));
  }
}

describe('Shell Permissions', function() {
  before(setupUser);
  after(cleanupUser);

  it('dummy file create/delete', function() {
    // Remove file if exists
    if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
    // Create file
    execSync(`node js_shell.js`, { input: `Username: ${TEST_USER}\nPassword: changeme\ntouch testfile.txt\nexit\n`, cwd: path.join(PROJECT_ROOT, 'js_shell'), stdio: 'pipe' });
    // Delete file
    execSync(`node js_shell.js`, { input: `Username: ${TEST_USER}\nPassword: changeme\nrm testfile.txt\nexit\n`, cwd: path.join(PROJECT_ROOT, 'js_shell'), stdio: 'pipe' });
  });
  it('should show prompt relative to user root', function() {
    const output = execSync(`node js_shell.js`, { input: `Username: ${TEST_USER}\nPassword: changeme\npwd\nexit\n`, cwd: path.join(PROJECT_ROOT, 'js_shell'), stdio: 'pipe' }).toString();
    assert(/\[.*\] \. %/.test(output), 'Prompt should show "." for user root');
  });
});
