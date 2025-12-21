// history.js - universal history command (Node.js)
module.exports = function(args, io) {
  const hist = global.__SHELL_HISTORY || [];
  hist.slice(-100).forEach((cmd, i) => io.stdout((i+1) + '  ' + cmd + '\n'));
};