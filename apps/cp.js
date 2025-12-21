// cp.js - universal cp command (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
    if (args.length < 2) return io.stderr('Usage: cp <src> <dst>\n');
    const [src, dst] = args;
    try {
        fs.copyFileSync(src, dst);
    } catch (e) {
        io.stderr('cp: ' + src + ' -> ' + dst + ': ' + e.message + '\n');
    }
};
