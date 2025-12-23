#!/usr/bin/env node
// Core modules
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Persistent command history
const HISTORY_FILE = path.join(os.homedir(), '.js_shell_history');
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const lines = fs.readFileSync(HISTORY_FILE, 'utf-8').split(/\r?\n/).filter(Boolean);
      return lines.slice(-50);
    }
  } catch { }
  return [];
}
function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, history.slice(-50).join('\n') + '\n', { mode: 0o600 });
  } catch { }
}

// Utility: Count total user comments (feedback)
function getFeedbackCount() {
  try {
    const COMMENTS_FILE = path.join(__dirname, 'comments.json');
    if (!fs.existsSync(COMMENTS_FILE)) return 0;
    const comments = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
    let count = 0;
    for (const user in comments) {
      for (const day in comments[user]) {
        count += comments[user][day].length;
      }
    }
    return count;
  } catch { return 0; }
}

// Admin command to view all user comments (feedback)
const COMMENTS_FILE = path.join(__dirname, 'comments.json');
// Built-in apps container must be defined before any function uses it
const builtins = {};
builtins.viewcomments = async (args, io) => {
  let username = process.env.JS_SHELL_USER || os.userInfo().username || 'unknown';
  if (username !== 'admin' && username !== 'home') {
    io.stdout('Only the admin can view all comments.\n');
    return 1;
  }
  if (!fs.existsSync(COMMENTS_FILE)) {
    io.stdout('No comments yet.\n');
    return 0;
  }
  const comments = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
  io.stdout('--- User Comments ---\n');
  for (const user in comments) {
    for (const day in comments[user]) {
      for (const msg of comments[user][day]) {
        io.stdout(`[${user} @ ${day}]: ${msg}\n`);
      }
    }
  }
  io.stdout('---------------------\n');
  return 0;
};
// Utility: Get user's public identity token (first 15 chars of SHELLKEY_TOKEN or .shellkey hash)
function getUserPublicToken(userHomeDir) {
  let token = null;
  if (process.env.SHELLKEY_TOKEN && process.env.SHELLKEY_TOKEN.length >= 15) {
    token = process.env.SHELLKEY_TOKEN.slice(0, 15);
  } else {
    const keyFilePath = path.join(userHomeDir, '.shellkey');
    if (fs.existsSync(keyFilePath)) {
      const keyHash = fs.readFileSync(keyFilePath, 'utf-8').trim();
      token = keyHash.slice(0, 15);
    }
  }
  return token;
}

module.exports.getUserPublicToken = getUserPublicToken;

// js_shell.js - Secure, multi-user Node.js shell with robust session, input, and command logic

// Built-in apps container must be defined before any function uses it
// Core modules
// ...existing code...

// Password hashing
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (e) {
  process.stdout.write('bcrypt not found. Please run "npm install bcrypt" in js_shell directory.\n');
  process.exit(1);
}

// Path to the apps directory (change './js_shell/apps' to your preferred directory)
const appsDir = path.join(__dirname, 'apps');

// Path to the users directory (always absolute, inside Docker should be /os/users)
const usersRoot = path.resolve(__dirname, 'users');

// Path to the session database file
const sessionDbPath = path.join(__dirname, '../sessions.json');

// (users.json removed, use only shadow.json)

// Path to the permissions database file (system-wide, now in /etc)
const permissionsPath = path.join('/etc', 'permissions.json');
// Set permissions for permissions.json (system file)
try { require('fs').chmodSync(permissionsPath, 0o600); } catch (e) { }
try { require('fs').chmodSync('/etc', 0o755); } catch (e) { }
// Set permissions for permissions.json (system file)
try { require('fs').chmodSync(permissionsPath, 0o600); } catch (e) { }


// Action logger (logs to console and audit.log)
const { logAction } = require('./action_log');

// ========== Raw Input Handler ==========


/**
 * Read a line from stdin in raw mode, with full interactive editing, history, and tab completion.
 * @param {string} prompt - The prompt to display.
 * @param {boolean} hide - If true, mask input (for passwords).
 * @param {string[]} scriptedInputLines - Optional scripted input for automation/testing.
 * @returns {Promise<string>} - The user input line.
 */
function readLineRaw(prompt, hide, scriptedInputLines) {
  return new Promise(resolve => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    let input = '';
    let cursor = 0;
    let lastChar = '';
    let echoing = false;
    let history = [];
    let histIndex = 0;
    let searchMatches = [];
    let searchIndex = 0;
    // Defensive: ensure scriptedInputLines is always an array if not provided
    if (!Array.isArray(scriptedInputLines)) scriptedInputLines = [];

    // --- History support (global for all shell sessions) ---
    if (!global.__SHELL_HISTORY) {
      global.__SHELL_HISTORY = [];
      global.__SHELL_HIST_INDEX = 0;
    }
    history = Array.isArray(global.__SHELL_HISTORY) ? global.__SHELL_HISTORY : [];
    histIndex = history.length;

    // Clear the current line and move cursor to start, then print prompt (only once)
    stdout.write('\r\x1b[2K');
    stdout.write(prompt);
    if (stdout.flush) stdout.flush();

    // Fallback for non-TTY or scripted input
    if (typeof stdin.setRawMode !== 'function' || !stdin.isTTY) {
      if (scriptedInputLines && scriptedInputLines.length > 0) {
        const line = scriptedInputLines.shift();
        resolve(line || '');
      } else {
        resolve('');
      }
      return;
    }

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    // Redraw the input line and move cursor (never print a newline)
    function redraw() {
      stdout.write('\r\x1b[2K');
      stdout.write(prompt + (hide ? '*'.repeat(input.length) : input));
      // Move cursor to correct position
      const totalLen = prompt.length + input.length;
      const moveLeft = input.length - cursor;
      if (moveLeft > 0) stdout.write(`\x1b[${moveLeft}D`);
    }

    // Handle all keypresses
    function onData(char) {
      if (echoing && char === lastChar) return;
      echoing = true;
      lastChar = char;

      // Enter: finish input
      if (char === '\r' || char === '\n') {
        if (!hide) {
          stdout.write('\n');
          if (stdout.flush) stdout.flush();
        }
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        // Only save to history if not hide and prompt is the main shell prompt
        const isMainPrompt = typeof getPrompt === 'function' && prompt === getPrompt();
        if (!hide && isMainPrompt && input.trim() && (history.length === 0 || history[history.length - 1] !== input.trim())) {
          history.push(input.trim());
          if (history.length > 50) history.shift();
          saveHistory(history);
        }
        global.__SHELL_HISTORY = history;
        global.__SHELL_HIST_INDEX = history.length;
        resolve(input);
      }
      // Ctrl+C: exit
      else if (char === '\u0003') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.exit();
      }
      // Backspace
      else if (char === '\u0008' || char === '\u007f') {
        if (cursor > 0) {
          input = input.slice(0, cursor - 1) + input.slice(cursor);
          cursor--;
          redraw();
        }
      }
      // Left arrow
      else if (char === '\u001b[D') {
        if (cursor > 0) {
          cursor--;
          redraw();
        }
      }
      // Right arrow
      else if (char === '\u001b[C') {
        if (cursor < input.length) {
          cursor++;
          redraw();
        }
      }
      // Up arrow (history)
      else if (char === '\u001b[A') {
        if (history.length > 0 && histIndex > 0) {
          histIndex--;
          input = history[histIndex];
          cursor = input.length;
          redraw();
        }
      }
      // Down arrow (history)
      else if (char === '\u001b[B') {
        if (history.length > 0 && histIndex < history.length - 1) {
          histIndex++;
          input = history[histIndex];
          cursor = input.length;
          redraw();
        } else if (histIndex === history.length - 1) {
          histIndex++;
          input = '';
          cursor = 0;
          redraw();
        }
      }
      // Tab completion (from history and builtins)
      else if (char === '\t') {
        const allCmds = Array.from(new Set([...history, ...Object.keys(builtins)]));
        if (input.length > 0) {
          searchMatches = allCmds.filter(cmd => cmd.startsWith(input));
          if (searchMatches.length > 0) {
            input = searchMatches[searchIndex % searchMatches.length];
            cursor = input.length;
            searchIndex++;
            redraw();
          }
        } else {
          // If nothing typed, show last command
          if (history.length > 0) {
            input = history[history.length - 1];
            cursor = input.length;
            redraw();
          }
        }
      }
      // Printable characters
      else if (char.length === 1 && char >= ' ' && char <= '~') {
        input = input.slice(0, cursor) + char + input.slice(cursor);
        cursor++;
        redraw();
      }
      echoing = false;
    }

    // Only attach F12/dashboard handler in main shell loop, not during login
    stdin.on('data', onData);
  });
}

// Async getUser function using raw mode input for login (single echo per keystroke)
async function getUser() {
  // Show prompt indicator for TODOs/comments
  let username = process.env.JS_SHELL_USER || require('os').userInfo().username || 'unknown';
  let todoCount = 0;
  let feedbackCount = 0;
  try {
    const TODO_FILE = path.join(__dirname, 'todo.json');
    if (fs.existsSync(TODO_FILE)) {
      todoCount = JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8')).length;
    }
    feedbackCount = getFeedbackCount();
  } catch { }
  // Removed extra login status line for admin/home users
  // Only print debug/status lines at first login
  if (!process.env.JS_SHELL_FIRST_LOGIN) {
    if (process.env.SHELLKEY_TOKEN) {
      const dbg = process.env.SHELLKEY_TOKEN;
      // process.stdout.write(`[DEBUG] SHELLKEY_TOKEN (first 15): ${dbg.slice(0, 15)}\n`);
    } else {
      // process.stdout.write('[DEBUG] SHELLKEY_TOKEN: (not set)\n');
    }
    // process.stdout.write(`[DEBUG] usersRoot: ${usersRoot}\n`);
    process.env.JS_SHELL_FIRST_LOGIN = '1';
  }
  // Check for active session
  let sessions = {};
  let changed = false;
  let users = {};
  let shadow = {};
  const shadowPath = path.join('/etc/js_shell', 'shadow.json');
  // Defensive: ensure process.env is defined
  if (typeof process.env !== 'object') process.env = {};
  if (fs.existsSync(sessionDbPath)) {
    try {
      const raw = fs.readFileSync(sessionDbPath, 'utf-8');
      if (raw && typeof raw === 'string' && raw.trim()) {
        sessions = JSON.parse(raw);
      }
    } catch (e) {
      // If parse fails, treat as empty
      sessions = {};
    }
    const pid = process.pid.toString();
    if (sessions[pid]) {
      return sessions[pid];
    }
    // Remove stale sessions (PIDs not running)
    for (const sessionPid in sessions) {
      if (sessionPid === pid) continue;
      try {
        process.kill(Number(sessionPid), 0);
      } catch (e) {
        // Not running, remove stale session
        delete sessions[sessionPid];
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(sessionDbPath, JSON.stringify(sessions, null, 2));
    }
  }
  // Prompt for login, or use env vars if provided
  // Temporarily relax permissions to allow login read access
  if (fs.existsSync(shadowPath)) {
    let origMode = null;
    try {
      origMode = fs.statSync(shadowPath).mode & 0o777;
      fs.chmodSync(shadowPath, 0o640); // owner and group can read
      const rawShadow = fs.readFileSync(shadowPath, 'utf-8');
      if (rawShadow && typeof rawShadow === 'string' && rawShadow.trim()) {
        const parsed = JSON.parse(rawShadow);
        shadow = parsed.users || {};
      }
    } catch (e) {
      shadow = {};
    } finally {
      if (origMode !== null) {
        try { fs.chmodSync(shadowPath, origMode); } catch (e) { }
      }
    }
  }
  // passwd command: change password for current user
  builtins.passwd = async (args, io) => {
    const shadowPath = path.join('/etc/js_shell', 'shadow.json');
    let shadow = {};
    if (fs.existsSync(shadowPath)) {
      shadow = JSON.parse(fs.readFileSync(shadowPath, 'utf-8')).users || {};
    }
    const user = process.env.JS_SHELL_USER || 'unknown';
    const oldpw = await readLineRaw('Current password: ', true);
    if (!shadow[user] || !shadow[user].hash || !bcrypt.compareSync(oldpw, shadow[user].hash)) {
      io.stderr('Incorrect current password.\n');
      return;
    }
    const newpw = await readLineRaw('New password: ', true);
    const hash = bcrypt.hashSync(newpw, 10);
    shadow[user] = { hash };
    fs.writeFileSync(shadowPath, JSON.stringify({ users: shadow }, null, 2));
    io.stdout('Password updated.\n');
  };
  // Always prompt for username and password interactively
  username = '';
  password = '';
  let failedAttempts = 0;
  let usernameInputLines = 0;
  while (true) {
    username = await readLineRaw('Username: ');
    process.stdout.write('\n');
    usernameInputLines++;
    const debugUserHome = path.resolve(usersRoot, username);
    process.stdout.write(`[DEBUG] userHome: ${debugUserHome}\n`);
    const userHomeDir = path.resolve(usersRoot, username);
    if (
      typeof username !== 'string' ||
      !username.trim() ||
      !shadow[username] ||
      !fs.existsSync(userHomeDir) ||
      !fs.statSync(userHomeDir).isDirectory()
    ) {
      process.stdout.write('No such user.\n');
      continue;
    }
    // Only use .shellkey as the persistent envelope
    const keyFilePath = path.join(userHomeDir, '.shellkey');
    let key;
    if (fs.existsSync(keyFilePath)) {
      key = fs.readFileSync(keyFilePath, 'utf-8').trim();
    } else {
      // First login: generate key and envelope
      key = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(keyFilePath, key + '\n', { mode: 0o600 });
    }
    process.env.SHELLKEY_TOKEN = key;
    // Always write .shellkey as sha256 hash of the envelope
    const shellkeyPath = keyFilePath;
    let keyHash;
    try {
      const keyBytes = Buffer.from(key, 'hex');
      keyHash = crypto.createHash('sha256').update(keyBytes).digest('hex');
    } catch (e) {
      keyHash = crypto.createHash('sha256').update(key, 'utf-8').digest('hex');
    }
    fs.writeFileSync(shellkeyPath, keyHash + '\n', { mode: 0o600 });
    password = await readLineRaw('Password: ', true);
    process.stdout.write('\n');
    usernameInputLines++;
    if (shadow[username] && shadow[username].hash && bcrypt.compareSync(password, shadow[username].hash)) {
      // Successful password login
      // Erase Username and Password input lines from terminal
      for (let i = 0; i < usernameInputLines; i++) {
        process.stdout.write('\x1b[1A'); // Move cursor up
        process.stdout.write('\x1b[2K'); // Erase entire line
      }
      usernameInputLines = 0;
      break;
    } else {
      failedAttempts++;
      process.stdout.write('Incorrect password.\n');
      if (failedAttempts >= 3) {
        // Mandatory hash challenge after 3 failed attempts
        let hashPrefix = keyHash.slice(0, 15);
        // If SHELLKEY_TOKEN is set, use its first 15 chars as valid prefix too
        if (process.env.SHELLKEY_TOKEN && process.env.SHELLKEY_TOKEN.length >= 15) {
          hashPrefix = process.env.SHELLKEY_TOKEN.slice(0, 15);
        }
        const challenge = await readLineRaw('Enter first 15 chars of your shell key hash to log in: ', true);
        process.stdout.write('\n');
        if (challenge === hashPrefix) {
          // Allow login and password reset
          process.stdout.write('Hash prefix accepted. You may now change your password.\n');
          const newpw = await readLineRaw('New password: ', true);
          process.stdout.write('\n');
          const hash = bcrypt.hashSync(newpw, 10);
          shadow[username] = { hash };
          const shadowPath = path.join('/etc/js_shell', 'shadow.json');
          fs.writeFileSync(shadowPath, JSON.stringify({ users: shadow }, null, 2));
          process.stdout.write('Password updated. Please login again.\n');
          failedAttempts = 0;
          continue;
        } else {
          process.stdout.write('Incorrect hash prefix. You are now locked out. Contact an admin to reset your account.\n');
          process.exit(1);
        }
      }
      continue;
    }
  }
  // Only one session per user
  if (fs.existsSync(sessionDbPath)) {
    try {
      const raw = fs.readFileSync(sessionDbPath, 'utf-8');
      if (raw.trim()) {
        sessions = JSON.parse(raw);
      }
    } catch (e) {
      sessions = {};
    }
    const pid = process.pid.toString();
    let changed = false;
    for (const sessionPid in sessions) {
      if (sessionPid === pid) continue; // Ignore current PID
      // Check if PID is running
      let isRunning = true;
      try {
        process.kill(Number(sessionPid), 0);
      } catch (e) {
        isRunning = false;
      }
      if (!isRunning) {
        delete sessions[sessionPid];
        changed = true;
        continue;
      }
      if (sessions[sessionPid] === username) {
        process.stdout.write('User already logged in elsewhere.\n');
        process.exit(1);
      }
    }
    if (changed) {
      fs.writeFileSync(sessionDbPath, JSON.stringify(sessions, null, 2));
    }
  }
  sessions[process.pid.toString()] = username;
  fs.writeFileSync(sessionDbPath, JSON.stringify(sessions, null, 2));
  return username;
}

// Pipe-aware shell loop




// (getUser async version is now defined below and used)

function getPermissions(user) {
  let perms = {};
  if (!fs.existsSync(permissionsPath)) return {};
  try {
    const rawPerms = fs.readFileSync(permissionsPath, 'utf-8');
    if (rawPerms && typeof rawPerms === 'string' && rawPerms.trim()) {
      perms = JSON.parse(rawPerms);
    }
  } catch (e) {
    perms = {};
  }
  // Non-home users: remove home-only commands
  if (user !== 'home' && perms.users && perms.users.home) {
    const homeCmds = Array.isArray(perms.users.home.allowed_cmds) ? perms.users.home.allowed_cmds : [];
    const userPerms = perms.users[user] || perms.default || {};
    userPerms.allowed_cmds = (userPerms.allowed_cmds || []).filter(cmd => !homeCmds.includes(cmd));
    return userPerms;
  }
  return (perms.users && perms.users[user]) || perms.default || {};
}


// Use logAction from action_log.js for real-time logging




/**
 * Clear the screen (works in most terminals)
 */
builtins.clear = async (args, io) => {
  if (!io || typeof io.stdout !== 'function') return;
  io.stdout('\x1b[2J\x1b[0;0H');
};

/**
 * Show current date and time
 */
builtins.date = async (args, io) => {
  if (!io || typeof io.stdout !== 'function') return;
  io.stdout(new Date().toString() + '\n');
};

/**
 * Show current user
 */
builtins.whoami = async (args, io) => {
  const user = (process.env && process.env.JS_SHELL_USER) ? process.env.JS_SHELL_USER : 'unknown';
  if (!io || typeof io.stdout !== 'function') return;
  io.stdout(user + '\n');
};

/**
 * Make directory
 */
builtins.mkdir = async (args, io) => {
  if (!Array.isArray(args)) return;
  if (!io || typeof io.stderr !== 'function') return;
  for (const dir of args) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      io.stderr('mkdir: ' + e.message + '\n');
    }
  }
};

/**
 * Remove directory
 */
builtins.rmdir = async (args, io) => {
  if (!Array.isArray(args)) return;
  if (!io || typeof io.stderr !== 'function') return;
  for (const dir of args) {
    try {
      fs.rmdirSync(dir);
    } catch (e) {
      io.stderr('rmdir: ' + e.message + '\n');
    }
  }
};

/**
 * Print working directory
 */
builtins.pwd = async (args, io) => {
  if (!io || typeof io.stdout !== 'function') return;
  io.stdout(process.cwd() + '\n');
};

/**
 * Echo arguments
 */
builtins.echo = async (args, io) => {
  if (!Array.isArray(args)) return;
  if (!io || typeof io.stdout !== 'function') return;
  io.stdout(args.join(' ') + '\n');
};

// builtins.ls and builtins.dir removed; use enhanced apps/ls.js

/**
 * Concatenate and print files
 */
builtins.cat = async (args, io) => {
  if (!Array.isArray(args)) return;
  if (!io || typeof io.stdout !== 'function' || typeof io.stderr !== 'function') return;
  for (const file of args) {
    try {
      const data = fs.readFileSync(file, 'utf-8');
      io.stdout(data);
    } catch (e) {
      io.stderr('cat: ' + e.message + '\n');
    }
  }
};

/**
 * Create empty files
 */
builtins.touch = async (args, io) => {
  if (!Array.isArray(args)) return;
  if (!io || typeof io.stderr !== 'function') return;
  for (const file of args) {
    try {
      fs.closeSync(fs.openSync(file, 'a'));
    } catch (e) {
      io.stderr('touch: ' + e.message + '\n');
    }
  }
};

/**
 * Remove files
 */
builtins.rm = async (args, io) => {
  if (!Array.isArray(args)) return;
  if (!io || typeof io.stderr !== 'function') return;
  for (const file of args) {
    try {
      fs.unlinkSync(file);
    } catch (e) {
      io.stderr('rm: ' + e.message + '\n');
    }
  }
};

/**
 * List built-in commands
 */
builtins.help = async (args, io) => {
  if (!io || typeof io.stdout !== 'function') return;
  io.stdout('Built-in commands: ' + Object.keys(builtins).join(', ') + '\n');
};

// Color utility
function highlight(text, color = 'cyan') {
  if (typeof text !== 'string') text = String(text);
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
  };
  return (colors[color] || colors.cyan) + text + colors.reset;
}

// App loader
async function runApp(cmd, args, io) {
  const user = await getUser();
  const perms = getPermissions(user);
  // Accept scriptedInputLines as an optional property of io
  const scriptedInputLines = (io && Array.isArray(io.scriptedInputLines)) ? io.scriptedInputLines : undefined;
  // Defensive: instantiate variables
  const fileCmds = Array.isArray(['ls', 'cat', 'rm', 'touch', 'cp', 'mv']) ? ['ls', 'cat', 'rm', 'touch', 'cp', 'mv'] : [];
  let target = '';
  let appsDirAbs = '';
  // Check command permission
  if (perms && Array.isArray(perms.denied_cmds) && perms.denied_cmds.includes(cmd)) {
    if (io && typeof io.stderr === 'function') io.stderr('Permission denied for command: ' + cmd + '\n');
    return;
  }
  if (perms && Array.isArray(perms.allowed_cmds) && !perms.allowed_cmds.includes(cmd)) {
    if (io && typeof io.stderr === 'function') io.stderr('Command not allowed: ' + cmd + '\n');
    return;
  }
  // Per-user filesystem isolation (DISABLED: run in current process.cwd())
  // Prevent any user from writing to apps dir or files (system apps)
  if (Array.isArray(fileCmds) && fileCmds.includes(cmd) && args && args[0]) {
    target = path.resolve(process.cwd(), args[0]);
    appsDirAbs = path.resolve(appsDir);
    if (target.startsWith(appsDirAbs)) {
      if (io && typeof io.stderr === 'function') io.stderr('Access denied: cannot modify system utilities.\n');
      return;
    }
    if (perms && Array.isArray(perms.denied_dirs) && perms.denied_dirs.some(d => target.startsWith(d))) {
      if (io && typeof io.stderr === 'function') io.stderr('Access denied to directory: ' + args[0] + '\n');
      return;
    }
    if (perms && Array.isArray(perms.allowed_dirs) && !perms.allowed_dirs.some(d => target.startsWith(d))) {
      if (io && typeof io.stderr === 'function') io.stderr('Directory not allowed: ' + args[0] + '\n');
      return;
    }
  }
  if (builtins[cmd]) {
    // In test/scripted mode, do not launch subprocesses or GUI
    let output = '';
    try {
      await builtins[cmd](args, {
        stdout: (s) => { output += s; if (io && typeof io.stdout === 'function') io.stdout(s); },
        stderr: (s) => { output += s; if (io && typeof io.stderr === 'function') io.stderr(s); },
        stdin: io && typeof io.stdin === 'function' ? io.stdin : () => Promise.resolve(''),
      });
    } catch (err) {
      const { logSystemError } = require('./action_log');
      logSystemError(`Error in built-in command '${cmd}': ${err && err.message ? err.message : err}`);
      if (io && typeof io.stderr === 'function') io.stderr(`System error: ${err && err.message ? err.message : err}\n`);
    }
    // Only launch GUI if interactive
    if (!scriptedInputLines) {
      const { spawn } = require('child_process');
      const launcher = path.join(__dirname, '..', 'launcher.py');
      const htmlPath = path.join(__dirname, 'shell.html');
      let pythonCmd = 'python';
      try {
        require('child_process').execSync('python --version', { stdio: 'ignore' });
      } catch {
        pythonCmd = 'python3';
      }
      spawn(pythonCmd, [launcher, htmlPath, '--shellout', output], { detached: true, stdio: 'ignore' });
    }
    return;
  }
    // Try loading from apps dir
    const appPath = path.join(appsDir, cmd + '.js');
    if (fs.existsSync(appPath)) {
      let mod;
      try {
        mod = require(appPath);
      } catch (e) {
        const { logSystemError } = require('./action_log');
        logSystemError(`Error loading app '${cmd}': ${e && e.message ? e.message : e}`);
        if (io && typeof io.stderr === 'function') io.stderr('Failed to load app: ' + appPath + '\n' + e.message + '\n');
        return;
      }
      if (typeof mod === 'function' || (mod && typeof mod.default === 'function')) {
        let output = '';
        const fn = typeof mod === 'function' ? mod : mod.default;
        try {
          await fn(args, {
            stdout: (s) => { output += s; if (io && typeof io.stdout === 'function') io.stdout(s); },
            stderr: (s) => { output += s; if (io && typeof io.stderr === 'function') io.stderr(s); },
            stdin: io && typeof io.stdin === 'function' ? io.stdin : () => Promise.resolve(''),
          });
        } catch (err) {
          const { logSystemError } = require('./action_log');
          logSystemError(`Error in app '${cmd}': ${err && err.message ? err.message : err}`);
          if (io && typeof io.stderr === 'function') io.stderr(`System error: ${err && err.message ? err.message : err}\n`);
        }
        // Only launch GUI if interactive
        if (!scriptedInputLines) {
          const htmlPath = path.join(__dirname, 'shell.html');
          const { spawn } = require('child_process');
          const launcher = path.join(__dirname, '.', 'launcher.py');
          let pythonCmd = 'python';
          try {
            require('child_process').execSync('python --version', { stdio: 'ignore' });
          } catch {
            pythonCmd = 'python3';
          }
          spawn(pythonCmd, [launcher, htmlPath, '--shellout', output], { detached: true, stdio: 'ignore' });
        }
        return;
      }
    }
    if (io && typeof io.stderr === 'function') io.stderr(`Command not found: ${cmd}\n`);
}

function getPrompt() {
  // Custom prompt: newline, dot, [HH:MM:SS], /<subdirectory>, %
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];
  const user = (process.env && process.env.JS_SHELL_USER) ? process.env.JS_SHELL_USER : 'home';
  let cwd = typeof process.cwd === 'function' ? process.cwd() : '';
  let userRoot = typeof usersRoot === 'string' ? usersRoot : '';
  let relCwd = '';
  if (user !== 'home') {
    userRoot = path.join(usersRoot, user);
    relCwd = path.relative(userRoot, cwd);
    if (!relCwd || relCwd === '' || relCwd === '.') relCwd = '/';
    else relCwd = '/' + relCwd.replace(/\\/g, '/');
  } else {
    // For home, show from root
    relCwd = path.relative('/', cwd);
    if (!relCwd || relCwd === '' || relCwd === '.') relCwd = '/';
    else relCwd = '/' + relCwd.replace(/\\/g, '/');
  }
  let dot = '\x1b[32m●\x1b[0m';
  return `${dot} [${timeStr}] ${relCwd} % `;
}

function main() {
  if (!fs.existsSync(appsDir)) fs.mkdirSync(appsDir);
  let history = Array.isArray([]) ? [] : [];
  let histIndex = 0;
  let lastCmd = '';
  // Define scriptedInputLines as empty array unless set elsewhere
  let scriptedInputLines = Array.isArray([]) ? [] : [];

  // If a command is provided as a CLI argument, run it once and exit
  const cliArgs = process.argv.slice(2);
  (async () => {
    const user = await getUser();
    process.env.JS_SHELL_USER = user;
    if (cliArgs.length > 0) {
      const cmd = cliArgs[0];
      const args = cliArgs.slice(1);
      await runApp(cmd, args, {
        stdout: (s) => process.stdout.write(s),
        stderr: (s) => process.stderr.write(s),
        stdin: () => Promise.resolve(''),
        scriptedInputLines: []
      });
      process.exit(0);
      return;
    }
    async function shellLoop() {
      const stdin = process.stdin;
      let dashboardActive = false;
      async function showDashboard() {
        try {
          let htodo;
          try {
            htodo = require('./apps/htodo');
          } catch (e1) {
            try {
              htodo = require(path.join(__dirname, 'apps', 'htodo.js'));
            } catch (e2) {
              throw e2;
            }
          }
          await htodo([], { stdout: process.stdout });
        } catch (e) {
          process.stdout.write('[htodo not available or error running dashboard]\n');
        }
      }
      function onDataWithF12(char) {
        // F12 key: '\u001b[24~' or '\u001b[21~' (varies by terminal)
        if (char === '\u001b[24~' || char === '\u001b[21~' || char === '\u001b[\u001b[24~') {
          dashboardActive = !dashboardActive;
          process.stdout.write('\x1b[2J\x1b[0;0H'); // Clear screen
          if (dashboardActive) {
            showDashboard();
          }
          return;
        }
        if (!dashboardActive) {
          onDataShell(char);
        }
      }
      async function onDataShell(char) {
        // This is a placeholder; input is handled by readLineRaw
      }
      stdin.removeAllListeners('data');
      stdin.on('data', onDataWithF12);
      let maxIterations = 50;
      let iterations = 0;
      while (true) {
        if (dashboardActive) {
          // Wait for F12 to toggle off
          await new Promise(resolve => {
            function check() {
              if (!dashboardActive) resolve();
              else setTimeout(check, 100);
            }
            check();
          });
          process.stdout.write('\x1b[2J\x1b[0;0H'); // Clear screen
        }
        if (Array.isArray(scriptedInputLines) && iterations++ > maxIterations) {
          process.stdout.write('\n[ERROR] Max shell loop iterations reached. Exiting.\n');
          break;
        }
        let trimmed = '';
        do {
          process.stdout.write('\x1b[0J');
          const line = await readLineRaw(getPrompt());
          if (typeof line === 'undefined' || line === null) {
            if (Array.isArray(scriptedInputLines) && scriptedInputLines.length > 0) break;
            continue;
          }
          trimmed = typeof line === 'string' ? line.trim() : '';
        } while (!trimmed);
        if (trimmed && trimmed !== lastCmd) {
          history.push(trimmed);
          lastCmd = trimmed;
        }
        histIndex = history.length;
        const splitCmd = typeof trimmed === 'string' ? trimmed.split(/\s+/) : [];
        const cmd = splitCmd[0];
        const args = splitCmd.slice(1);
        if (!cmd) {
          if (Array.isArray(scriptedInputLines) && scriptedInputLines.length === 0) break;
          continue;
        }
        if (cmd === 'exit') break;
        await runApp(cmd, args, {
          stdout: (s) => { process.stdout.write(s); if (Array.isArray(scriptedInputLines)) process.stdout.write(''); },
          stderr: (s) => { process.stdout.write(s); if (Array.isArray(scriptedInputLines)) process.stdout.write(''); },
          stdin: () => Promise.resolve(''),
          scriptedInputLines
        });
        if (Array.isArray(scriptedInputLines) && scriptedInputLines._scriptedMode && scriptedInputLines.length === 0) break;
      }
    }
    shellLoop();
  })();
}


// Crash-proof main
try {
  main();
} catch (err) {
  const fs = require('fs');
  const os = require('os');
  const auditLogPath = require('path').join(__dirname, 'audit.log');
  const ts = new Date().toISOString();
  const msg = `[${ts}] SHELL CRASH: ${err && err.stack ? err.stack : err}${os.EOL}`;
  try { fs.appendFileSync(auditLogPath, msg); } catch { }
  console.error('Shell crashed:', err);
  process.exit(1);
};