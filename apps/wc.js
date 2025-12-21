// wc.js - Word, line, and character count (Node.js)
const fs = require('fs');
module.exports = function(args, io) {
    let file = null;
    let showLines = false, showWords = false, showChars = false;
    // Parse args for options and file
    args.forEach(arg => {
        if (arg === '-l') showLines = true;
        else if (arg === '-w') showWords = true;
        else if (arg === '-c') showChars = true;
        else if (!arg.startsWith('-')) file = arg;
    });
    if (!file) {
        io.stderr('wc: No file specified.\n');
        return;
    }
    try {
        const text = fs.readFileSync(file, 'utf8');
        const lines = text.split(/\r?\n/).length - 1;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const chars = text.length;
        // If no options, show all
        if (!showLines && !showWords && !showChars) {
            io.stdout(`${lines} ${words} ${chars}\n`);
        } else {
            let out = [];
            if (showLines) out.push(lines);
            if (showWords) out.push(words);
            if (showChars) out.push(chars);
            io.stdout(out.join(' ') + '\n');
        }
    } catch (e) {
        io.stderr(`wc: ${file}: ${e.message}\n`);
    }
};
