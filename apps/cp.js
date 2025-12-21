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
// cp.js - Copy files or directories
const fs = require('fs');
const path = require('path');

module.exports = async function cp(args, stdin, stdout, stderr) {
    stdin = stdin || (() => '');
    stdout = stdout || (() => {});
    stderr = stderr || (() => {});
// cp.js - universal cp command
module.exports = function(args, io) {
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        if (args.length < 2) return io.stderr('cp: missing file operand\n');
        const dest = args[args.length - 1];
        for (let i = 0; i < args.length - 1; ++i) {
            try {
                fs.copyFileSync(args[i], dest);
            } catch (e) {
                io.stderr('cp: ' + args[i] + ': ' + e.message + '\n');
            }
        }
    } else {
        io.stdout('cp: Not supported in this environment.\n');
    }
};
};

function copyDir(src, dest, stdin, stdout, stderr) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    for (const entry of fs.readdirSync(src)) {
        const srcPath = path.join(src, entry);
        const destPath = path.join(dest, entry);
        const stat = fs.statSync(srcPath);
        if (stat.isDirectory()) {
            copyDir(srcPath, destPath, stdin, stdout, stderr);
        } else {
            if (fs.existsSync(destPath)) {
                stdout(`cp: ${destPath} exists. Overwrite? (y/N): `);
                // For recursive, default to not overwrite for safety
                return;
            }
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
