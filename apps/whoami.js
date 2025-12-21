// whoami.js - universal whoami command (Node.js)
module.exports = function(args, io) {
  const user = process.env.JS_SHELL_USER || process.env.USER || process.env.USERNAME || 'unknown';
  io.stdout(user + '\n');
};