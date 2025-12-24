// rmdir.js - universal rmdir command (Node.js)
const fs = require('fs');
const path = require('path');
function isAllowed(dir, write = false) {
  const user = process.env.JS_SHELL_USER;
  if (user === 'home') return true;
  const homeDir = path.resolve('users', user);
  const abs = path.resolve(dir);
  if (abs.startsWith(path.resolve('apps'))) return !write;
  if (abs === path.resolve('js_shell.js')) return !write;
  return abs.startsWith(homeDir);
}
module.exports = function(args, io) {
  if (!args.length) return io.stderr('rmdir: No directory specified.\n');
  args.forEach(dir => {
    if (!isAllowed(dir, true)) {
      io.stderr('rmdir: access denied: ' + dir + '\n');
      return;
    }
    const { addAlertFromException } = require('./htodo_alert');
    try {
      fs.rmdirSync(dir);
    } catch (e) {
      io.stderr('rmdir: ' + dir + ': ' + e.message + '\n');
      addAlertFromException('rmdir', e);
    }
  });
};
// rmdir.js - universal rmdir command
module.exports = function(args, io) {
  if (typeof require !== 'undefined') {
    const fs = require('fs');
    for (const dir of args) {
      try {
        fs.rmdirSync(dir);
      } catch (e) {
        io.stderr('rmdir: ' + dir + ': ' + e.message + '\n');
        addAlertFromException('rmdir', e);
      }
    }
  } else {
    io.stdout('rmdir: Not supported in this environment.\n');
  }
};