// cp.js - universal cp command (Node.js)
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
    if (args.length < 2) return io.stderr('Usage: cp <src> <dst>\n');
    const [src, dst] = args;
    if (!isAllowed(src) || !isAllowed(dst, true)) {
      io.stderr('cp: access denied\n');
      return;
    }
    try {
      fs.copyFileSync(src, dst);
    } catch (e) {
      io.stderr('cp: ' + src + ' -> ' + dst + ': ' + e.message + '\n');
    }
};
