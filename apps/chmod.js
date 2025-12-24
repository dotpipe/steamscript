// chmod.js - universal chmod command
module.exports = function(args, io) {
  if (typeof require !== 'undefined') {
    const fs = require('fs');
    const { addAlertFromException } = require('./htodo_alert');
    try {
      fs.chmodSync(args[1], parseInt(args[0], 8));
    } catch (e) {
      io.stderr('chmod: ' + args[1] + ': ' + e.message + '\n');
      addAlertFromException('chmod', e);
    }
  } else {
    io.stdout('chmod: Not supported in this environment.\n');
  }
};