// man.js - universal man command
module.exports = function(args, io) {
  io.stdout('man: No manual entry for ' + (args[0] || '') + '\n');
};