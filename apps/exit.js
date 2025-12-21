// exit.js - universal exit command
module.exports = function(args, io, input) {
  if (typeof process !== 'undefined') process.exit(0);
  io.stdout('Shell exited.\n');
};