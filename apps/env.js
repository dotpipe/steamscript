// env.js - universal env command (Node.js)
module.exports = function(args, io) {
  Object.keys(process.env).forEach(k => io.stdout(k + '=' + process.env[k] + '\n'));
};