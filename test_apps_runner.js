// test_apps_runner.js - Unit test for running all JS apps in /apps
const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const appFiles = fs.readdirSync(appsDir).filter(f => f.endsWith('.js'));

console.log('Testing all JS apps in /apps...');

let passed = 0, failed = 0;

appFiles.forEach(file => {
    const appPath = path.join(appsDir, file);
    try {
        const appModule = require(appPath);
        const io = {
            stdout: (msg) => process.stdout.write(msg),
            stderr: (msg) => process.stderr.write(msg)
        };
        const shell = {
            cwd: process.cwd(),
            env: process.env,
            homeDir: __dirname,
            user: process.env.USER || process.env.USERNAME || 'home'
        };
        if (typeof appModule === 'function') {
            appModule([], io, shell);
            console.log(`PASS: ${file}`);
            passed++;
        } else if (typeof appModule.main === 'function') {
            appModule.main([], io, shell);
            console.log(`PASS: ${file}`);
            passed++;
        } else {
            console.log(`FAIL: ${file} (no entry point)`);
            failed++;
        }
    } catch (e) {
        console.log(`FAIL: ${file} (${e.message})`);
        failed++;
    }
});

console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
