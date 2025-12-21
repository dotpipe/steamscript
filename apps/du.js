// du.js - Disk usage summary for Node.js with -h and -s options
const fs = require('fs');
const path = require('path');

function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function getDirSize(dir) {
    let total = 0;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            total += getDirSize(fullPath);
        } else {
            try {
                total += fs.statSync(fullPath).size;
            } catch {}
        }
    }
    return total;
}

module.exports = function(args, io) {
    let dir = '.';
    let human = false;
    let summary = false;
    let nonOptions = [];
    args.forEach(arg => {
        if (arg === '-h') human = true;
        else if (arg === '-s') summary = true;
        else if (!arg.startsWith('-')) nonOptions.push(arg);
    });
    if (nonOptions.length > 0) dir = nonOptions[nonOptions.length - 1];
    try {
        if (summary) {
            const size = getDirSize(dir);
            io.stdout((human ? humanSize(size) : size + ' bytes') + '\n');
        } else {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            files.forEach(file => {
                const fullPath = path.join(dir, file.name);
                let size = 0;
                if (file.isDirectory()) size = getDirSize(fullPath);
                else {
                    try { size = fs.statSync(fullPath).size; } catch {}
                }
                io.stdout((human ? humanSize(size) : size + ' bytes') + '\t' + file.name + '\n');
            });
        }
    } catch (e) {
        io.stderr('du: ' + e.message + '\n');
    }
};
