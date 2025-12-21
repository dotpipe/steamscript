const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('User File Write', function() {
    const userDir = path.join(__dirname, '../users/home');
    const userFile = path.join(userDir, 'testuser.json');
    const testData = { name: 'Test User', password: 'abstractpassword123' };

    after(function() {
        if (fs.existsSync(userFile)) fs.unlinkSync(userFile);
        // Optionally remove the directory if empty
        if (fs.existsSync(userDir) && fs.readdirSync(userDir).length === 0) fs.rmdirSync(userDir);
    });

    it('should write user data to file', function(done) {
        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
        fs.writeFile(userFile, JSON.stringify(testData), (err) => {
            assert.strictEqual(err, null);
            assert.ok(fs.existsSync(userFile));
            const data = JSON.parse(fs.readFileSync(userFile));
            assert.strictEqual(data.name, testData.name);
            assert.strictEqual(data.password, testData.password);
            done();
        });
    });
});
