// unset.js - universal unset command
module.exports = function(args, io) {
  if (typeof process !== 'undefined' && process.env) {
    if (args.length < 1) return io.stderr('Usage: unset VAR\n');
    args.forEach(k => { delete process.env[k]; });
  } else {
    io.stdout('unset: Not supported in this environment.\n');
  }
};