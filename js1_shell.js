// js1_shell.js - Entrypoint for hierarchical Shell class

const fs = require('fs');
const path = require('path');
const Shell = require('./core/Shell');

if (require.main === module) {
    const baseDir = __dirname;
    const shell = new Shell(baseDir);
    shell.loginPrompt(() => {
        const cliArgs = process.argv.slice(2);
        shell.setupKeyBindings();
        shell.startLoop();
    });
}
