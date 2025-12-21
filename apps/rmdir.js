// rmdir.js - universal rmdir command (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
  if (!args.length) return io.stderr('rmdir: No directory specified.\n');
  args.forEach(dir => {
    try {
      fs.rmdirSync(dir);
    } catch (e) {
      io.stderr('rmdir: ' + dir + ': ' + e.message + '\n');
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
      }
    }
  } else {
    io.stdout('rmdir: Not supported in this environment.\n');
  }
};