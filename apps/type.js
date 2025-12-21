// type.js - universal type command (Node.js)
const fs = require('fs');
const path = require('path');
module.exports = function(args, io) {
  if (!args[0]) return io.stderr('Usage: type <command>\n');
  const cmd = args[0];
  const appsDir = path.join(__dirname);
  if (fs.existsSync(path.join(appsDir, cmd + '.js'))) {
    io.stdout(cmd + ' is an app\n');
  } else {
    io.stdout(cmd + ' is not found\n');
  }
};