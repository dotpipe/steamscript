// tail.js - Output the last N lines of a file (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
    let file = null;
    let n = 10;
    // Parse args for options and file
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n' && args[i+1] && !isNaN(args[i+1])) {
            n = parseInt(args[i+1], 10);
            i++;
        } else if (!args[i].startsWith('-')) {
            file = args[i];
        }
    }
    if (!file) {
        io.stderr('tail: No file specified.\n');
        return;
    }
        const { addAlertFromException } = require('./htodo_alert');
    try {
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
            const lastLines = lines.slice(-n);
        io.stdout(tailLines.join('\n') + '\n');
    } catch (e) {
        io.stderr(`tail: ${file}: ${e.message}\n`);
            addAlertFromException('tail', e);
    }
};
