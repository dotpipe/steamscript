// help.js - universal help command (Node.js)
const fs = require('fs');
const path = require('path');
module.exports = function(args, io) {
  const appsDir = path.join(__dirname);
  let cmds = [];
  try {
    cmds = fs.readdirSync(appsDir)
      .filter(f => f.endsWith('.js'))
      .map(f => f.replace(/\.js$/, ''));
  } catch {}
  io.stdout('Available commands: ' + cmds.join(', ') + '\n');
};