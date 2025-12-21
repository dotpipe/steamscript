// touch.js - universal touch command (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
  if (!args.length) return io.stderr('touch: No file specified.\n');
  args.forEach(file => {
    try {
      fs.closeSync(fs.openSync(file, 'a'));
    } catch (e) {
      io.stderr('touch: ' + file + ': ' + e.message + '\n');
    }
  });
};