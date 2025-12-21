// file_index.js - Cartesian file index for js_shell
// Root directory is [0,0]. Each directory offset by one bit. Filenames indexed separately.
// Directories: { id: [x, y], name: string, parent: id }
// Files: { id: string, name: string, dir: id }
// Connections: { fileId: string, dirId: id, byteSeq: string }

const fs = require('fs');
const path = require('path');

class FileIndex {
    constructor(indexPath) {
        this.indexPath = indexPath;
        this.directories = {}; // id: { x, y, name, parent }
        this.files = {}; // filename: { id, dir }
        this.deepestDirs = []; // Array of deepest directory names
        this.connections = []; // { fileId, dirId, byteSeq }
        this.nextDirId = 1;
        this.load();
    }

    // Cartesian offset: each new dir is [x+1, y] or [x, y+1]
    addDirectory(name, parentId = 0) {
        let offset = [0, 0];
        if (parentId && this.directories[parentId]) {
            const parent = this.directories[parentId];
            offset = [parent.x + 1, parent.y];
        }
        const id = this.nextDirId++;
        this.directories[id] = { x: offset[0], y: offset[1], name, parent: parentId };
        this.save();
        return id;
    }

    addFile(name, dirId) {
        const id = this._genFileId(name, dirId);
        this.files[name] = { id, dir: dirId };
        // Connect file to dir by byte sequence
        const byteSeq = Buffer.from(name).toString('hex');
        this.connections.push({ fileId: id, dirId, byteSeq });
        // Track deepest directory names
        const dir = this.directories[dirId];
        if (dir && !this.deepestDirs.includes(dir.name)) {
            // Only add if not already present
            this.deepestDirs.push(dir.name);
        }
        this.save();
        return id;
    }

    _genFileId(name, dirId) {
        return Buffer.from(`${name}:${dirId}`).toString('base64');
    }

    findFile(name) {
        return this.files[name] ? this.files[name].id : null;
    }

    findDir(name) {
        for (const id in this.directories) {
            if (this.directories[id].name === name) return id;
        }
        return null;
    }

    getFilePath(fileId) {
        // Find file by id in files
        for (const name in this.files) {
            if (this.files[name].id === fileId) {
                const dir = this.directories[this.files[name].dir];
                if (!dir) return null;
                return path.join(dir.name, name);
            }
        }
        return null;
    }

    save() {
        fs.writeFileSync(this.indexPath, JSON.stringify({ directories: this.directories, files: this.files, deepestDirs: this.deepestDirs, connections: this.connections }, null, 2));
    }

    load() {
        if (fs.existsSync(this.indexPath)) {
            const data = JSON.parse(fs.readFileSync(this.indexPath, 'utf8'));
            this.directories = data.directories || {};
            this.files = data.files || {};
            this.deepestDirs = data.deepestDirs || [];
            this.connections = data.connections || [];
            this.nextDirId = Object.keys(this.directories).length + 1;
        } else {
            // Initialize root dir
            this.directories[0] = { x: 0, y: 0, name: '.', parent: null };
            this.deepestDirs = [];
            this.nextDirId = 1;
            this.save();
        }
    }
}

module.exports = FileIndex;
