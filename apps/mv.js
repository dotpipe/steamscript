// mv.js - universal mv command (Node.js)
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
  if (args.length < 2) return io.stderr('Usage: mv <src> <dst>\n');
  const [src, dst] = args;
  if (!isAllowed(src) || !isAllowed(dst, true)) {
    io.stderr('mv: access denied\n');
    return;
  }
  try {
    fs.renameSync(src, dst);
    const { addAlertFromException } = require('./htodo_alert');
  } catch (e) {
    io.stderr('mv: ' + src + ' -> ' + dst + ': ' + e.message + '\n');
    addAlertFromException('mv', e);
  }
};
// mv.js - universal mv command
module.exports = function(args, io, input) {
  if (typeof require !== 'undefined') {
    const fs = require('fs');
    if (args.length < 2) return io.stderr('mv: missing file operand\n');
    const dest = args[args.length - 1];
    for (let i = 0; i < args.length - 1; ++i) {
      try {
        fs.renameSync(args[i], dest);
        const { addAlertFromException } = require('./htodo_alert');
      } catch (e) {
        io.stderr('mv: ' + args[i] + ': ' + e.message + '\n');
        addAlertFromException('mv', e);
      }
    }
  } else {
    io.stdout('mv: Not supported in this environment.\n');
  }
};
