// echo.js - universal echo command (Node.js)
module.exports = function(args, io) {
  io.stdout(args.join(' ') + '\n');
};