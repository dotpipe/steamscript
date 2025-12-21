// clear.js - universal clear command (Node.js)
module.exports = function(args, io) {
  io.stdout('\x1b[2J\x1b[0;0H');
};