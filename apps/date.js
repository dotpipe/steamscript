// date.js - universal date command (Node.js)
module.exports = function(args, io) {
  io.stdout((new Date()).toString() + '\n');
};