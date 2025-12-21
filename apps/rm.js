// rm.js - universal rm command (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
  if (!args.length) return io.stderr('rm: No file specified.\n');
  args.forEach(file => {
    try {
      fs.unlinkSync(file);
    } catch (e) {
      io.stderr('rm: ' + file + ': ' + e.message + '\n');
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
      }
    }
  } else {
    io.stdout('rm: Not supported in this environment.\n');
  }
};