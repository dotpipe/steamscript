// head.js - Output the first N lines of a file (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
    let file = null;
    let n = 10;
    let numberLines = false;
    let options = [];
    args.forEach(arg => {
      if (arg === '-n') numberLines = true;
      else if (!isNaN(arg)) n = parseInt(arg, 10);
      else if (arg.startsWith('-')) options.push(arg);
      else file = arg;
    });
    if (!file) {
        io.stderr('head: No file specified.\n');
        return;
    }
    const { addAlertFromException } = require('./htodo_alert');
    try {
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).slice(0, n);
        if (numberLines) {
            lines.forEach((line, i) => io.stdout((i+1) + '  ' + line + '\n'));
        } else {
            io.stdout(lines.join('\n') + '\n');
        }
    } catch (e) {
        io.stderr('head: ' + file + ': ' + e.message + '\n');
        addAlertFromException('head', e);
    }
};
