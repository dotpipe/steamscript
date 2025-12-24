// index.js - CLI utility for managing and querying the file index
const FileIndex = require('../file_index');
const path = require('path');

const { addAlertFromException } = require('./htodo_alert');
module.exports = async function index(args, stdin, stdout, stderr) {
    const indexPath = path.join(__dirname, '../file_index.json');
    let idx;
    try {
        idx = new FileIndex(indexPath);
    } catch (e) {
        addAlertFromException('index', e);
        stderr('index: failed to load file index: ' + e.message);
        return 1;
    }
    try {
        if (args[0] === 'add-dir' && args[1]) {
            const parentId = args[2] ? parseInt(args[2]) : 0;
            const id = idx.addDirectory(args[1], parentId);
            stdout(`Directory '${args[1]}' added with id ${id}`);
            return 0;
        }
        if (args[0] === 'add-file' && args[1] && args[2]) {
            const dirId = parseInt(args[2]);
            const id = idx.addFile(args[1], dirId);
            stdout(`File '${args[1]}' added to dir ${dirId} with id ${id}`);
            return 0;
        }
        if (args[0] === 'find-file' && args[1]) {
            const id = idx.findFile(args[1]);
            if (id) stdout(`File '${args[1]}' id: ${id}`);
            else stderr(`File '${args[1]}' not found`);
            return id ? 0 : 1;
        }
        if (args[0] === 'find-dir' && args[1]) {
            const id = idx.findDir(args[1]);
            if (id) stdout(`Dir '${args[1]}' id: ${id}`);
            else stderr(`Dir '${args[1]}' not found`);
            return id ? 0 : 1;
        }
        if (args[0] === 'get-path' && args[1]) {
            const filePath = idx.getFilePath(args[1]);
            if (filePath) stdout(`Path: ${filePath}`);
            else stderr('File or directory not found');
            return filePath ? 0 : 1;
        }
        stderr('Usage: index <add-dir|add-file|find-file|find-dir|get-path> ...');
        return 1;
    } catch (e) {
        addAlertFromException('index', e);
        stderr('index: error: ' + e.message);
        return 1;
    }
};
