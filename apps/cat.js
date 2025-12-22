// cat.js - universal cat command
const path = require('path');
const fs = require('fs');
function isAllowed(file) {
  const user = process.env.JS_SHELL_USER;
  if (user === 'home') return true;
  const homeDir = path.resolve('users', user);
  const abs = path.resolve(file);
  // Allow system files (apps, shell core)
  if (abs.startsWith(path.resolve('apps')) || abs === path.resolve('js_shell.js')) return true;
  return abs.startsWith(homeDir);
}
module.exports = function(args, io) {
  for (const file of args) {
    if (!isAllowed(file)) {
      io.stderr('cat: access denied: ' + file + '\n');
      continue;
    }
    try {
      io.stdout(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      io.stderr('cat: ' + file + ': ' + e.message + '\n');
    }
  }
};