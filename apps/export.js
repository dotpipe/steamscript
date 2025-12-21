// export.js - universal export command (Node.js)
module.exports = function(args, io) {
  if (args.length < 1) return io.stderr('Usage: export VAR=VALUE\n');
  args.forEach(pair => {
    const [k, v] = pair.split('=');
    process.env[k] = v;
  });
};