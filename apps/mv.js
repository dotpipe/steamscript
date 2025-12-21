// mv.js - universal mv command (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
  if (args.length < 2) return io.stderr('Usage: mv <src> <dst>\n');
  const [src, dst] = args;
  try {
    fs.renameSync(src, dst);
  } catch (e) {
    io.stderr('mv: ' + src + ' -> ' + dst + ': ' + e.message + '\n');
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
      } catch (e) {
        io.stderr('mv: ' + args[i] + ': ' + e.message + '\n');
      }
    }
  } else {
    io.stdout('mv: Not supported in this environment.\n');
  }
};
