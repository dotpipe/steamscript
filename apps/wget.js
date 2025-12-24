// wget.js - universal wget command
module.exports = async function(args, io, input) {
  if (typeof fetch !== 'undefined') {
    const { addAlertFromException } = require('./htodo_alert');
    try {
      const resp = await fetch(args[0]);
      const text = await resp.text();
      io.stdout(text + '\n');
    } catch (e) {
      io.stderr('wget: ' + e.message + '\n');
      addAlertFromException('wget', e);
    }
  } else {
    io.stdout('wget: Not supported in this environment.\n');
  }
};