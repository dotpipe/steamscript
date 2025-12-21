// cat.js - universal cat command
module.exports = function(args, io) {
  if (typeof require !== 'undefined') {
    const fs = require('fs');
    for (const file of args) {
      try {
        io.stdout(fs.readFileSync(file, 'utf8'));
      } catch (e) {
        io.stderr('cat: ' + file + ': ' + e.message + '\n');
      }
    }
  } else {
    io.stdout('cat: Not supported in this environment.\n');
  }
};