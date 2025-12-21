// explorer.js - Simple CLI file explorer for js_shell
const fs = require('fs');
const path = require('path');

module.exports = async function explorer(args, stdin, stdout, stderr) {
    let cwd = args[0] || process.cwd();
    try {
        let files = fs.readdirSync(cwd, { withFileTypes: true });
        files = files.map(f => (f.isDirectory() ? `[DIR] ${f.name}` : `     ${f.name}`));
        stdout(`Directory: ${cwd}\n`);
        files.forEach(f => stdout(f + '\n'));
        stdout('\nCommands: cd <dir>, cat <file>, rm <file>, touch <file>, cp <src> <dst>, mv <src> <dst>\n');
    } catch (e) {
        stderr('explorer: ' + e.message + '\n');
    }
    return 0;
};
