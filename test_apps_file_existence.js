const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('Apps Directory File Existence', function() {
    const appsDir = path.join(__dirname, 'apps');
    const files = fs.readdirSync(appsDir).filter(f => f.endsWith('.js'));
    files.forEach(file => {
        it(`should exist: ${file}` , function() {
            assert.ok(fs.existsSync(path.join(appsDir, file)));
        });
    });
});
