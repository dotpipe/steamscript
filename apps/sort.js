// sort.js - Sort lines from a file, with options -n (numeric), -r (reverse)
const fs = require('fs');
module.exports = function(args, io) {
    let file = null;
    let numeric = false, reverse = false;
    // Parse args for options and file
    args.forEach(arg => {
        if (arg === '-n') numeric = true;
        else if (arg === '-r') reverse = true;
        else if (!arg.startsWith('-')) file = arg;
    });
    if (!file) {
        io.stderr('sort: No file specified.\n');
        return;
    }
    try {
        let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(l => l.length > 0);
        lines.sort((a, b) => {
            if (numeric) {
                return Number(a) - Number(b);
            } else {
                return a.localeCompare(b);
            }
        });
        if (reverse) lines.reverse();
        lines.forEach(line => io.stdout(line + '\n'));
    const { addAlertFromException } = require('./htodo_alert');
    } catch (e) {
        io.stderr(`sort: ${file}: ${e.message}\n`);
        addAlertFromException('sort', e);
    }
};
