// find.js - Search kernel's file index for files and their directories
const FileIndex = require('../file_index');
const path = require('path');

async function find(args, stdin, stdout, stderr) {
    stdin = stdin || (() => '');
    stdout = stdout || (() => {});
    stderr = stderr || (() => {});
    if (args.length < 1) {
        stderr('Usage: find <pattern>');
        stderr('You entered: find ' + args.join(' '));
        return 1;
    }
    const pattern = args[0] || '';
    const indexPath = path.join(__dirname, '../file_index.json');
    const idx = new FileIndex(indexPath);
    let found = false;
    for (const fileId in idx.files) {
        const file = idx.files[fileId];
        if (file.name.includes(pattern)) {
            const dir = idx.directories[file.dir];
            stdout(`File: ${file.name} | Dir: ${dir ? dir.name : 'unknown'} | ID: ${fileId}`);
            found = true;
        }
    }
    if (!found) stderr('No files found matching pattern.');
    return found ? 0 : 1;
}

module.exports = find;
