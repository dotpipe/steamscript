// mkdir.js - universal mkdir command (Node.js)
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
  if (!args.length) return io.stderr('mkdir: No directory specified.\n');
  args.forEach(dir => {
    if (!isAllowed(dir, true)) {
      io.stderr('mkdir: access denied: ' + dir + '\n');
      return;
    }
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      io.stderr('mkdir: ' + dir + ': ' + e.message + '\n');
    }
  });
};
// mkdir.js - universal mkdir command
module.exports = function(args, io) {
  if (typeof require !== 'undefined') {
    const fs = require('fs');
    for (const dir of args) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (e) {
        io.stderr('mkdir: ' + dir + ': ' + e.message + '\n');
      }
    }
  } else {
    io.stdout('mkdir: Not supported in this environment.\n');
  }
};