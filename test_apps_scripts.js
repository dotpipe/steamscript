const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('Apps Directory Scripts', function() {
    const appsDir = path.join(__dirname, 'apps');
    const files = fs.readdirSync(appsDir).filter(f => f.endsWith('.js'));
    const { spawnSync } = require('child_process');
    files.forEach(file => {
        let args = [];
        // Provide valid arguments for scripts that require them
        if (file === 'cal.js') args = ['1', '2025'];
        if (file === 'cp.js') {
            const src = path.join(__dirname, 'temp_src.txt');
            const dst = path.join(__dirname, 'temp_dst.txt');
            fs.writeFileSync(src, 'test');
            args = [src, dst];
        }
        if (file === 'bc.js') args = ['1+1'];
        if (file === 'dateadd.js') args = ['2025-01-01', '5'];
        if (file === 'apropos.js') args = ['test'];
        if (file === 'basename.js') args = ['foo/bar.txt'];
        if (file === 'basenameall.js') args = ['foo/bar.txt', 'baz/qux.js'];
        if (file === 'basenameext.js') args = ['foo/bar.txt'];
        if (file === 'datemath.js') args = ['2025-01-01', '+', '5'];
        if (file === 'dc.js') args = ['2*3'];
        if (file === 'expr.js') args = ['4+4'];
        if (file === 'factor.js') args = ['12'];
        if (file === 'seq.js') args = ['1', '3', '1'];
        if (file === 'units.js') args = ['10', 'm'];
        it(`should run ${file} without error`, function() {
            const result = spawnSync('node', [path.join(appsDir, file), ...args], { encoding: 'utf8' });
            if (file === 'cp.js') {
                const src = path.join(__dirname, 'temp_src.txt');
                const dst = path.join(__dirname, 'temp_dst.txt');
                if (fs.existsSync(src)) fs.unlinkSync(src);
                if (fs.existsSync(dst)) fs.unlinkSync(dst);
            }
            assert.strictEqual(result.status, 0, result.stderr);
        });
    });
});
