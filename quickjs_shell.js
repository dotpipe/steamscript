// quickjs_shell.js - Minimal QuickJS-compatible shell runner
// Usage: qjs quickjs_shell.js

// This runner loads and runs shell apps from ./apps/ using only standard JS (no Node.js modules)
// Only supports a subset of commands (echo, cat, ls, touch, rm, etc.)

const files = {};

function stdout(s) { globalThis.print ? print(s) : (typeof window !== 'undefined' ? (window.shellout ? window.shellout(s) : console.log(s)) : console.log(s)); }
function stderr(s) { stdout('[ERR] ' + s); }

// Minimal in-memory FS for demo
function ls(args) {
  let out = Object.keys(files).join('\n') + '\n';
  stdout(out);
  return 0;
}
function touch(args) {
  files[args[0]] = '';
  return 0;
}
function echo(args) {
  stdout(args.join(' ') + '\n');
  return 0;
}
function cat(args) {
  if (files[args[0]]) stdout(files[args[0]] + '\n');
  else stderr('No such file: ' + args[0] + '\n');
  return 0;
}
function rm(args) {
  if (files[args[0]]) { delete files[args[0]]; return 0; }
  else { stderr('No such file: ' + args[0] + '\n'); return 1; }
}


// Dynamic app loader for *.js in ./apps
async function dynamicApp(cmd, args, io) {
  try {
    let mod = null;
    try {
      mod = await import('./apps/' + cmd);
    } catch (e) {
      if (typeof require !== 'undefined') {
        mod = require('./apps/' + cmd);
      } else {
        throw e;
      }
    }
    if (mod && typeof mod.default === 'function') {
      return await mod.default(args, io);
    } else {
      io.stderr('App does not export default function.\n');
      return 1;
    }
  } catch (e) {
    io.stderr('Failed to load app: ' + e + '\n');
    return 1;
  }
}

const commands = { ls, touch, echo, cat, rm };

async function runApp(cmd, args, io) {
  io = io || { stdout, stderr, stdin: () => '' };
  // Patch global for test.js/test_shell.js compatibility
  globalThis.runApp = async (c, a, i) => commands[c] ? commands[c](a, i || io) : dynamicApp(c, a, i || io);
  if (commands[cmd]) return commands[cmd](args, io);
  // Try dynamic app loader for *.js in ./apps
  if (cmd.endsWith('.js')) return await dynamicApp(cmd, args, io);
  io.stderr('Unknown command: ' + cmd + '\n');
  return 1;
}

globalThis.runApp = runApp;
globalThis.stdout = stdout;
globalThis.stderr = stderr;
globalThis.files = files;


stdout('QuickJS shell ready. Type commands below.\n');

// Interactive prompt for QuickJS (if running in CLI, not browser)
if (typeof globalThis.input === 'function') {
  (async function() {
    while (true) {
      let line = input('> ');
      if (!line) continue;
      let [cmd, ...args] = line.trim().split(/\s+/);
      if (cmd === 'exit' || cmd === 'quit') break;
      let io = { stdout, stderr, stdin: () => '' };
      try {
        if (commands[cmd]) {
          commands[cmd](args, io);
        } else if (cmd.endsWith('.js')) {
          await dynamicApp(cmd, args, io);
        } else {
          stdout('Unknown command: ' + cmd + '\n');
        }
      } catch (e) {
        stderr('Error: ' + e + '\n');
      }
    }
  })();
}

// Optionally, auto-run test.js or test_shell.js if loaded (for non-interactive use)
if (typeof run_tests === 'function') run_tests([], { stdout, stderr, stdin: () => '' });
