// touch.js - universal touch command (Node.js)
const fs = require('fs');
const path = require('path');
function isAllowed(file, write = false) {
  const user = process.env.JS_SHELL_USER;
  if (user === 'home') return true;
  const homeDir = path.resolve('users', user);
  const abs = path.resolve(file);
  if (abs.startsWith(path.resolve('apps'))) return !write;
  if (abs === path.resolve('js_shell.js')) return !write;
  return abs.startsWith(homeDir);
}
module.exports = function(args, io) {
  if (!args.length) return io.stderr('touch: No file specified.\n');
  args.forEach(file => {
    if (!isAllowed(file, true)) {
      io.stderr('touch: access denied: ' + file + '\n');
      return;
    }
    try {
      fs.closeSync(fs.openSync(file, 'a'));
    } catch (e) {
      io.stderr('touch: ' + file + ': ' + e.message + '\n');
    }
  });
};