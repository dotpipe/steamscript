const fs = require('fs').promises;
const path = require('path');

async function readJson(filePath) {
    try {
        const absPath = path.resolve(filePath);
        const data = await fs.readFile(absPath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

async function writeJson(filePath, obj) {
    try {
        const absPath = path.resolve(filePath);
        await fs.writeFile(absPath, JSON.stringify(obj, null, 2), 'utf-8');
        return true;
    } catch (e) {
        return false;
    }
}

async function readCsv(filePath) {
    try {
        const absPath = path.resolve(filePath);
        const data = await fs.readFile(absPath, 'utf-8');
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

async function writeCsv(filePath, arr) {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    try {
        const absPath = path.resolve(filePath);
        const headers = Object.keys(arr[0]);
        const lines = [headers.join(',')];
        arr.forEach(obj => {
            lines.push(headers.map(h => obj[h] || '').join(','));
        });
        await fs.writeFile(absPath, lines.join('\n'), 'utf-8');
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = { readJson, writeJson, readCsv, writeCsv };
