// rm.js - universal rm command (Node.js)
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
  if (!args.length) return io.stderr('rm: No file specified.\n');
  args.forEach(file => {
    if (!isAllowed(file, true)) {
      io.stderr('rm: access denied: ' + file + '\n');
      return;
    }
    const { addAlertFromException } = require('./htodo_alert');
    try {
      fs.unlinkSync(file);
    } catch (e) {
      io.stderr('rm: ' + file + ': ' + e.message + '\n');
      addAlertFromException('rm', e);
    }
  });
};
// rm.js - universal rm command
module.exports = function(args, io) {
  if (typeof require !== 'undefined') {
    const fs = require('fs');
    for (const file of args) {
      try {
        fs.unlinkSync(file);
      } catch (e) {
        io.stderr('rm: ' + file + ': ' + e.message + '\n');
        addAlertFromException('rm', e);
      }
    }
  } else {
    io.stdout('rm: Not supported in this environment.\n');
  }
};