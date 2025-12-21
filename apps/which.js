// which.js - Locate a command
const fs = require('fs');
const path = require('path');

module.exports = async function which(args, stdin, stdout, stderr) {
    stdin = stdin || (() => '');
    stdout = stdout || (() => {});
    stderr = stderr || (() => {});
    if (args.length < 1) {
        stderr('Usage: which <command>');
        stderr('You entered: which ' + args.join(' '));
        return 1;
    }
    const cmd = args[0];
    const builtins = ['ls','cat','echo','touch','rm','pwd','help','cp','mv','grep','head','tail','which'];
    if (builtins.includes(cmd)) {
        stdout(`[builtin] ${cmd}`);
        return 0;
    }
    const appPath = path.join(__dirname, cmd + '.js');
    if (fs.existsSync(appPath)) {
        stdout(appPath);
        return 0;
    }
    stderr(`which: ${cmd} not found`);
    return 1;
};
