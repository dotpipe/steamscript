// pwd.js - universal pwd command
module.exports = function(args, io) {
  if (typeof process !== 'undefined' && process.cwd) {
    io.stdout(process.cwd() + '\n');
  } else {
    io.stdout('pwd: Not supported in this environment.\n');
  }
};