// more.js - universal more command
module.exports = function(args, io, input) {
  const text = input || '';
  io.stdout(text);
};