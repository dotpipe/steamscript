#!/usr/bin/env node
// js_shell.js - Secure, multi-user Node.js shell with robust session, input, and command logic

// Built-in apps container must be defined before any function uses it
const builtins = {};
// Core modules
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

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

// Path to the users directory
const usersRoot = path.join(__dirname, '../users');

// Path to the session database file
const sessionDbPath = path.join(__dirname, '../sessions.json');

// Path to the users database file
const usersDbPath = path.join(__dirname, '../users.json');

// Path to the permissions database file
const permissionsPath = path.join(__dirname, '../permissions.json');


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

    // Print prompt
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

    // Redraw the input line and move cursor
    function redraw() {
      stdout.write('\r');
      stdout.write(prompt + (hide ? '*'.repeat(input.length) : input));
      // Move cursor to correct position
      const totalLen = prompt.length + input.length;
      const moveLeft = totalLen - (prompt.length + cursor);
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
        // Save to history if not empty and not duplicate
        if (!hide && input.trim() && (history.length === 0 || history[history.length - 1] !== input.trim())) {
          history.push(input.trim());
          if (history.length > 100) history.shift();
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
      // Tab completion (from history)
      else if (char === '\t') {
        if (input.length > 0) {
          searchMatches = history.filter(cmd => cmd.startsWith(input));
          if (searchMatches.length > 0) {
            input = searchMatches[searchIndex % searchMatches.length];
            cursor = input.length;
            searchIndex++;
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

    stdin.on('data', onData);
  });
}

// Async getUser function using raw mode input for login (single echo per keystroke)
async function getUser() {
  // Check for active session
  let sessions = {};
  let changed = false;
  let users = {};
  let shadow = {};
  const shadowPath = path.join(__dirname, 'shadow', 'shadow.json');
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
  if (fs.existsSync(shadowPath)) {
    try {
      const rawShadow = fs.readFileSync(shadowPath, 'utf-8');
      if (rawShadow && typeof rawShadow === 'string' && rawShadow.trim()) {
        const parsed = JSON.parse(rawShadow);
        shadow = parsed.users || {};
      }
    } catch (e) {
      shadow = {};
    }
  }
  // passwd command: change password for current user
  builtins.passwd = async (args, io) => {
    const shadowPath = path.join(__dirname, 'shadow', 'shadow.json');
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
  let username = '';
  let password = '';
  while (true) {
    username = await readLineRaw('Username: ');
    if (typeof username !== 'string' || !username.trim() || !shadow[username]) {
      process.stdout.write('No such user.\n');
      continue;
    }
    password = await readLineRaw('Password: ', true);
    // Only require shell key for password reset, not for every login
    const keyPath = path.join(usersRoot, username, '.shellkey');
    if (!fs.existsSync(keyPath)) {
      // First login: generate key
      const key = crypto.randomBytes(32).toString('hex');
      fs.mkdirSync(path.dirname(keyPath), { recursive: true });
      fs.writeFileSync(keyPath, key + '\n', { mode: 0o600 });
      process.stdout.write('\n*** IMPORTANT: Your new shell key is:\n');
      process.stdout.write(key + '\n');
      process.stdout.write('Copy and save this key in a safe place. You will need it for password resets. If you lose it, only the admin can reset it.***\n\n');
    }
    // Check password hash in shadow.json
    if (shadow[username] && shadow[username].hash && bcrypt.compareSync(password, shadow[username].hash)) break;
    else {
      process.stdout.write('Incorrect password.\n');
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
    logAction(`${user} DENIED command: ${cmd} ${args && Array.isArray(args) ? args.join(' ') : ''}`);
    return;
  }
  if (perms && Array.isArray(perms.allowed_cmds) && !perms.allowed_cmds.includes(cmd)) {
    if (io && typeof io.stderr === 'function') io.stderr('Command not allowed: ' + cmd + '\n');
    logAction(`${user} BLOCKED command: ${cmd} ${args && Array.isArray(args) ? args.join(' ') : ''}`);
    return;
  }
  // Per-user filesystem isolation (DISABLED: run in current process.cwd())
  // Prevent any user from writing to apps dir or files (system apps)
  if (Array.isArray(fileCmds) && fileCmds.includes(cmd) && args && args[0]) {
    target = path.resolve(process.cwd(), args[0]);
    appsDirAbs = path.resolve(appsDir);
    if (target.startsWith(appsDirAbs)) {
      if (io && typeof io.stderr === 'function') io.stderr('Access denied: cannot modify system utilities.\n');
      logAction(`${user} DENIED apps dir: ${args[0]} for ${cmd}`);
      return;
    }
    if (perms && Array.isArray(perms.denied_dirs) && perms.denied_dirs.some(d => target.startsWith(d))) {
      if (io && typeof io.stderr === 'function') io.stderr('Access denied to directory: ' + args[0] + '\n');
      logAction(`${user} DENIED dir: ${args[0]} for ${cmd}`);
      return;
    }
    if (perms && Array.isArray(perms.allowed_dirs) && !perms.allowed_dirs.some(d => target.startsWith(d))) {
      if (io && typeof io.stderr === 'function') io.stderr('Directory not allowed: ' + args[0] + '\n');
      logAction(`${user} BLOCKED dir: ${args[0]} for ${cmd}`);
      return;
    }
  }
  logAction(`${user} ran: ${cmd} ${args && Array.isArray(args) ? args.join(' ') : ''}`);
  if (builtins[cmd]) {
    // In test/scripted mode, do not launch subprocesses or GUI
    let output = '';
    await builtins[cmd](args, {
      stdout: (s) => { output += s; if (io && typeof io.stdout === 'function') io.stdout(s); },
      stderr: (s) => { output += s; if (io && typeof io.stderr === 'function') io.stderr(s); },
      stdin: io && typeof io.stdin === 'function' ? io.stdin : () => Promise.resolve(''),
    });
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
      if (io && typeof io.stderr === 'function') io.stderr('Failed to load app: ' + appPath + '\n' + e.message + '\n');
      return;
    }
    if (typeof mod === 'function' || (mod && typeof mod.default === 'function')) {
      let output = '';
      const fn = typeof mod === 'function' ? mod : mod.default;
      await fn(args, {
        stdout: (s) => { output += s; if (io && typeof io.stdout === 'function') io.stdout(s); },
        stderr: (s) => { output += s; if (io && typeof io.stderr === 'function') io.stderr(s); },
        stdin: io && typeof io.stdin === 'function' ? io.stdin : () => Promise.resolve(''),
      });
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
  // If the command is a .js or .html file, launch it in a window using launcher.py
  if ((typeof cmd === 'string') && (cmd.endsWith('.js') || cmd.endsWith('.html')) && fs.existsSync(cmd)) {
    if (!scriptedInputLines) {
      const { spawn } = require('child_process');
      const launcher = path.join(__dirname, '..', 'launcher.py');
      let pythonCmd = 'python';
      try {
        require('child_process').execSync('python --version', { stdio: 'ignore' });
      } catch {
        pythonCmd = 'python3';
      }
      const child = spawn(pythonCmd, [launcher, cmd], { stdio: 'inherit' });
      child.on('exit', (code) => {
        if (io && typeof io.stderr === 'function' && code !== 0) io.stderr(`launcher.py exited with code ${code}\n`);
      });
    }
    return;
  }
  if (io && typeof io.stderr === 'function') io.stderr(`Command not found: ${cmd}\n`);
}

function getPrompt() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  // Show relative path to user's root
  let userRoot = typeof usersRoot === 'string' ? usersRoot : '';
  const user = (process.env && process.env.JS_SHELL_USER) ? process.env.JS_SHELL_USER : 'home';
  let cwd = '';
  let relCwd = '';
  if (user !== 'home') {
    userRoot = path.join(usersRoot, user);
  }
  cwd = typeof process.cwd === 'function' ? process.cwd() : '';
  relCwd = (userRoot && cwd) ? path.relative(userRoot, cwd) : '';
  if (!relCwd || relCwd === '') relCwd = '.';
  return (
    highlight(`[${hh}:${mm}:${ss}]`, 'yellow') +
    ' ' +
    highlight(relCwd, 'green') +
    ' ' +
    highlight('%', 'cyan') +
    ' '
  );
  // Prevent default users from writing to apps dir or files
  const isHome = user === 'home';
  const fileCmds = ['ls', 'cat', 'rm', 'touch', 'cp', 'mv'];
  if (fileCmds.includes(cmd) && args[0]) {
    const target = path.resolve(process.cwd(), args[0]);
    const appsDirAbs = path.resolve(appsDir);
    if (!isHome && target.startsWith(appsDirAbs)) {
      io.stderr('Access denied: cannot modify system utilities.\n');
      auditLog(`${user} DENIED apps dir: ${args[0]} for ${cmd}`);
      return;
    }
  }
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
      let maxIterations = 50;
      let iterations = 0;
      while (true) {
        if (Array.isArray(scriptedInputLines) && iterations++ > maxIterations) {
          process.stdout.write('\n[ERROR] Max shell loop iterations reached. Exiting.\n');
          break;
        }
        const line = await readLineRaw(getPrompt());
        if (typeof line === 'undefined' || line === null) {
          // Only exit on undefined/null in scripted mode
          if (Array.isArray(scriptedInputLines) && scriptedInputLines.length > 0) break;
          // In interactive mode, ignore and prompt again
          continue;
        }
        const trimmed = typeof line === 'string' ? line.trim() : '';
        if (!trimmed) {
          // In scripted mode, break if no more input
          if (Array.isArray(scriptedInputLines) && scriptedInputLines.length > 0) break;
          // In interactive mode, just prompt again
          continue;
        }
        if (trimmed && trimmed !== lastCmd) {
          history.push(trimmed);
          lastCmd = trimmed;
        }
        histIndex = history.length;
        const splitCmd = typeof trimmed === 'string' ? trimmed.split(/\s+/) : [];
        const cmd = splitCmd[0];
        const args = splitCmd.slice(1);
        if (!cmd) {
          // In scripted mode, break if no more input
          if (Array.isArray(scriptedInputLines) && scriptedInputLines.length === 0) break;
          // In interactive mode, just prompt again
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
  try { fs.appendFileSync(auditLogPath, msg); } catch {}
  console.error('Shell crashed:', err);
  process.exit(1);
};