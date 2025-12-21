// curl.js - universal curl command
module.exports = async function(args, io, input) {
  if (typeof fetch !== 'undefined') {
    try {
      const resp = await fetch(args[0]);
      const text = await resp.text();
      io.stdout(text + '\n');
    } catch (e) {
      io.stderr('curl: ' + e.message + '\n');
    }
  } else {
    io.stdout('curl: Not supported in this environment.\n');
  }
};