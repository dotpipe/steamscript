const fs = require('fs');
const path = require('path');

function readJson(filePath) {
    try {
        const absPath = path.resolve(filePath);
        const data = fs.readFileSync(absPath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

function writeJson(filePath, obj) {
    try {
        const absPath = path.resolve(filePath);
        fs.writeFileSync(absPath, JSON.stringify(obj, null, 2), 'utf-8');
        return true;
    } catch (e) {
        return false;
    }
}

function readCsv(filePath) {
    try {
        const absPath = path.resolve(filePath);
        const data = fs.readFileSync(absPath, 'utf-8');
        const lines = data.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return [];
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const row = line.split(',');
            const obj = {};
            headers.forEach((h, idx) => obj[h.trim()] = row[idx] ? row[idx].trim() : '');
            return obj;
        });
    } catch (e) {
        return [];
    }
}

function writeCsv(filePath, arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    try {
        const absPath = path.resolve(filePath);
        const headers = Object.keys(arr[0]);
        const lines = [headers.join(',')];
        arr.forEach(obj => {
            lines.push(headers.map(h => obj[h] || '').join(','));
        });
        fs.writeFileSync(absPath, lines.join('\n'), 'utf-8');
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = { readJson, writeJson, readCsv, writeCsv };
