// mkdir.js - universal mkdir command (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
  if (!args.length) return io.stderr('mkdir: No directory specified.\n');
  args.forEach(dir => {
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