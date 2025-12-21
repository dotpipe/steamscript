// uniq.js - Filter adjacent matching lines (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
    let file = null;
    let showCount = false;
    // Parse args for options and file
    args.forEach(arg => {
        if (arg === '-c') showCount = true;
        else if (!arg.startsWith('-')) file = arg;
    });
    if (!file) {
        io.stderr('uniq: No file specified.\n');
        return;
    }
    try {
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
        let prev = null;
        let count = 0;
        for (const line of lines) {
            if (line !== prev && prev !== null) {
                if (showCount) io.stdout(count + ' ' + prev + '\n');
                else io.stdout(prev + '\n');
                count = 1;
            } else {
                count++;
            }
            prev = line;
        }
        if (prev !== null) {
            if (showCount) io.stdout(count + ' ' + prev + '\n');
            else io.stdout(prev + '\n');
        }
    } catch (e) {
        io.stderr(`uniq: ${file}: ${e.message}\n`);
    }
};

module.exports = uniq;
// uniq.js - Filter adjacent matching lines (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
    let file = null;
    let showCount = false;
    // Parse args for options and file
    args.forEach(arg => {
        if (arg === '-c') showCount = true;
        else if (!arg.startsWith('-')) file = arg;
    });
    if (!file) {
        io.stderr('uniq: No file specified.\n');
        return;
    }
    try {
        const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
        let prev = null;
        let count = 0;
        for (const line of lines) {
            if (line !== prev && prev !== null) {
                if (showCount) io.stdout(count + ' ' + prev + '\n');
                else io.stdout(prev + '\n');
                count = 1;
            } else {
                count++;
            }
            prev = line;
        }
        if (prev !== null) {
            if (showCount) io.stdout(count + ' ' + prev + '\n');
            else io.stdout(prev + '\n');
        }
    } catch (e) {
        io.stderr(`uniq: ${file}: ${e.message}\n`);
    }
};
