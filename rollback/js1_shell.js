#!/usr/bin/env node
let promptWasShown = false;

// js1_shell.js - Robust Linux-friendly JSON shell
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const appsDir = path.join(__dirname, 'apps');
let globalReadline = null;

function clearScreen() {
    process.stdout.write('\x1b[2J\x1b[H');
}

function center(text) {
    const width = process.stdout.columns || 80;
    return text.split('\n').map(line => {
        const pad = Math.max(0, Math.floor((width - line.length) / 2));
        return ' '.repeat(pad) + line;
    }).join('\n');
}

function showPrompt() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    process.stdout.write(`\n[${timeStr}] > `);
    promptWasShown = true;
}

function setupKeyBindings() {
    const stdin = process.stdin;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.removeAllListeners('data');
    let inputBuffer = '';
    let cursorPos = 0;
    let promptActive = true;
    function redrawPrompt() {
        // Move to start of line, print prompt, clear only the buffer area, print buffer, move cursor
        const promptStr = `[${new Date().toTimeString().split(' ')[0]}] > `;
        process.stdout.write('\r' + promptStr);
        // Clear only the buffer area (not the prompt)
        let clearLen = Math.max(0, process.stdout.columns - promptStr.length);
        process.stdout.write(' '.repeat(clearLen));
        process.stdout.write('\r' + promptStr);
        // Print buffer (truncate if too long for terminal)
        let maxBufferLen = Math.max(0, process.stdout.columns - promptStr.length);
        let shownBuffer = inputBuffer.slice(0, maxBufferLen);
        process.stdout.write(shownBuffer);
        // Move cursor to correct position (relative to shownBuffer)
        let shownCursor = Math.min(cursorPos, shownBuffer.length);
        const moveLeft = shownBuffer.length - shownCursor;
        if (moveLeft > 0) process.stdout.write(`\x1b[${moveLeft}D`);
    }
    function resetPrompt() {
        inputBuffer = '';
        cursorPos = 0;
        promptActive = true;
        redrawPrompt();
    }
    resetPrompt();
    stdin.on('data', (data) => {
        const key = data.toString('utf8');
        if (!promptActive) return;
        // Ctrl+C
        if (key === '\u0003') {
            process.stdout.write('\nExiting shell.\n');
            process.exit(0);
        } else if (key === '\u001b[24~') {
            launchDashboard();
        } else if (key === '\r' || key === '\n') {
            process.stdout.write('\n');
            // Here you can process the inputBuffer as a command if needed
            resetPrompt();
            return;
        } else if (key === '\u0008' || key === '\u007f') { // Backspace (Ctrl+H or DEL)
            if (cursorPos > 0) {
                inputBuffer = inputBuffer.slice(0, cursorPos - 1) + inputBuffer.slice(cursorPos);
                cursorPos--;
            }
            redrawPrompt();
        } else if (key === '\u001b[3~') { // Delete (escape sequence)
            if (cursorPos < inputBuffer.length) {
                inputBuffer = inputBuffer.slice(0, cursorPos) + inputBuffer.slice(cursorPos + 1);
            }
            if (cursorPos > inputBuffer.length) cursorPos = inputBuffer.length;
            redrawPrompt();
        } else if (key === '\u001b[3~') { // Delete (forward delete)
            if (cursorPos < inputBuffer.length) {
                inputBuffer = inputBuffer.slice(0, cursorPos) + inputBuffer.slice(cursorPos + 1);
            }
            if (cursorPos > inputBuffer.length) cursorPos = inputBuffer.length;
        } else if (key === '\u001b[D') { // Left arrow
            if (cursorPos > 0) {
                cursorPos--;
            }
        } else if (key === '\u001b[C') { // Right arrow
            if (cursorPos < inputBuffer.length) {
                cursorPos++;
            }
        } else if (key.length === 1 && key >= ' ' && key <= '~') {
            inputBuffer = inputBuffer.slice(0, cursorPos) + key + inputBuffer.slice(cursorPos);
            cursorPos++;
        }
        // Always redraw prompt and buffer after any keystroke (except Enter)
        redrawPrompt();
    });
}

function launchDashboard() {
    clearScreen();
    process.stdout.write(center('=== DASHBOARD ===') + '\n');
    process.stdout.write(center('Status: All systems nominal.') + '\n');
    process.stdout.write(center('Press Enter to return to shell.') + '\n');
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeAllListeners('data');
    if (globalReadline) { try { globalReadline.close(); } catch {} globalReadline = null; }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    globalReadline = rl;
    rl.question('', () => {
        rl.close();
        globalReadline = null;
        process.stdin.setRawMode(true);
        process.stdin.resume();
        setupKeyBindings();
        showPrompt();
    });
}

function runJsonApp(appName, args) {
    const appPath = path.join(appsDir, appName + '.json');
    if (!fs.existsSync(appPath)) {
        process.stderr.write(`[ERROR] JSON app not found: ${appPath}\n`);
        return;
    }
    let appConfig;
    try {
        appConfig = JSON.parse(fs.readFileSync(appPath, 'utf-8'));
    } catch (e) {
        process.stderr.write(`[ERROR] Failed to parse JSON app: ${e.message}\n`);
        return;
    }
    // Propagate root showPrompt as context
    let rootShowPrompt = true;
    if (typeof appConfig.showPrompt !== 'undefined') rootShowPrompt = appConfig.showPrompt;
    renderJsonUI(appConfig, { rootShowPrompt });
}

function renderJsonUI(node, context = {}) {
    if (!node) return;
    if (Array.isArray(node)) {
        node.forEach(child => renderJsonUI(child, context));
        return;
    }
    // Propagate showPrompt:false from root/context to all children and prompt types
    let effectiveShowPrompt = true;
    if (typeof node.showPrompt !== 'undefined') {
        effectiveShowPrompt = node.showPrompt;
    } else if (typeof context.showPrompt !== 'undefined') {
        effectiveShowPrompt = context.showPrompt;
    } else if (typeof context.rootShowPrompt !== 'undefined') {
        effectiveShowPrompt = context.rootShowPrompt;
    }
    // let isLastModal = false;
    // if (node.type === 'modal' && !node.next) isLastModal = true;
    switch (node.type) {
        case 'text':
            process.stdout.write((node.value || node.text || '') + '\n');
            // Only show prompt if explicitly allowed and not inside steps
            if (effectiveShowPrompt && !context.inSteps) {
                setupKeyBindings();
                showPrompt();
            }
            break;
        case 'columns':
            if (Array.isArray(node.items)) {
                let colStrs = node.items.map(item => {
                    let buf = [];
                    renderJsonUI(item, { ...context, buffer: buf });
                    return buf.join('');
                });
                let maxLen = Math.max(...colStrs.map(s => s.split('\n').length));
                for (let i = 0; i < maxLen; i++) {
                    let line = colStrs.map(s => (s.split('\n')[i] || '').padEnd(20)).join(' | ');
                    process.stdout.write(line + '\n');
                }
            }
            break;
        case 'rows':
            if (Array.isArray(node.items)) {
                node.items.forEach(item => renderJsonUI(item, context));
            }
            break;
        case 'loop':
            if (Array.isArray(node.items)) {
                let idx = 0;
                function nextLoop() {
                    if (idx >= node.items.length) {
                        process.stdout.write('[End of loop]\n');
                        showPrompt();
                        setupKeyBindings();
                        return;
                    }
                    renderJsonUI(node.items[idx], context);
                    idx++;
                    process.stdin.setRawMode(false);
                    process.stdin.removeAllListeners('data');
                    if (globalReadline) { try { globalReadline.close(); } catch {} globalReadline = null; }
                    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
                    globalReadline = rl;
                    rl.question('Press Enter for next item... ', () => {
                        rl.close();
                        globalReadline = null;
                        nextLoop();
                    });
                }
                nextLoop();
            }
            break;
        case 'select':
            if (Array.isArray(node.options)) {
                let selected = node.selected || 0;
                function renderSelect() {
                    clearScreen();
                    node.options.forEach((opt, i) => {
                        const isSel = i === selected;
                        process.stdout.write(`${isSel ? '>' : ' '} ${opt.label || opt} ${(isSel && node.hint) ? node.hint : ''}\n`);
                    });
                    process.stdout.write('[Arrow keys to navigate, Enter to select]\n');
                }
                renderSelect();
                const stdin = process.stdin;
                stdin.setRawMode(true);
                stdin.resume();
                stdin.removeAllListeners('data');
                function onKey(data) {
                    const key = data.toString();
                    if (key === '\u001b[A') { // up
                        selected = (selected - 1 + node.options.length) % node.options.length;
                        renderSelect();
                    } else if (key === '\u001b[B') { // down
                        selected = (selected + 1) % node.options.length;
                        renderSelect();
                    } else if (key === '\r' || key === '\n') { // enter
                        process.stdout.write(`Selected: ${node.options[selected].label || node.options[selected]}\n`);
                        stdin.removeListener('data', onKey);
                        setupKeyBindings();
                        showPrompt();
                        if (node.onSelect) node.onSelect(node.options[selected], selected);
                    }
                }
                stdin.on('data', onKey);
            }
            break;
        case 'modal':
            modal(node, context, effectiveShowPrompt);
            break;
        case 'pipe':
            pipes(node, context, effectiveShowPrompt);
            break;
        case 'prompt':
            process.stdin.setRawMode(false);
            process.stdin.removeAllListeners('data');
            if (globalReadline) { try { globalReadline.close(); } catch {} globalReadline = null; }
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            globalReadline = rl;
            rl.question((node.text || node.prompt || 'Input: ') + ' ', answer => {
                process.stdout.write(`You entered: ${answer}\n`);
                rl.close();
                globalReadline = null;
                if (node.next) renderJsonUI(node.next, context);
                if (effectiveShowPrompt && !context.inSteps) {
                    setupKeyBindings();
                    showPrompt();
                }
            });
            break;
        default:
            if (node.title) process.stdout.write(`=== ${node.title} ===\n`);
            // Pass showPrompt context to steps, and mark inSteps to suppress prompt after each step
            if (Array.isArray(node.steps)) node.steps.forEach(step => renderJsonUI(step, { ...context, showPrompt: effectiveShowPrompt, inSteps: true }));
            if (node.prompt) renderJsonUI({ type: 'prompt', text: node.prompt, showPrompt: effectiveShowPrompt }, context);
            // Only show prompt if not handled by steps and allowed
            if (!Array.isArray(node.steps) && effectiveShowPrompt) {
                setupKeyBindings();
                showPrompt();
            }
            break;
    }
}

function modal(node, context, showPromptAfter = true) {
    clearScreen();
    if (node.title) process.stdout.write(center(node.title) + '\n');
    if (node.content) process.stdout.write(center(node.content) + '\n');
    if (node.file) {
        try {
            const filePath = path.join(appsDir, node.file);
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                process.stdout.write(center(fileContent) + '\n');
            } else {
                process.stdout.write(center(`[File not found: ${node.file}]`) + '\n');
            }
        } catch (e) {
            process.stdout.write(center(`[Error loading file: ${e.message}]`) + '\n');
        }
    }
    let closeOn = (node.closeOn || 'Enter').split(',').map(k => k.trim().toLowerCase());
    let closeMsg = 'Press ' + closeOn.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' or ') + ' to close modal.';
    process.stdout.write(center(closeMsg) + '\n');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.removeAllListeners('data');
    let closed = false;
    function onKey(data) {
        if (closed) return;
        const key = data.toString('utf8');
        if ((closeOn.includes('enter') && (key === '\r' || key === '\n')) ||
            (closeOn.includes('esc') && key === '\x1b')) {
            closed = true;
            process.stdin.removeListener('data', onKey);
            process.stdin.setRawMode(false);
            process.stdin.pause();
            if (globalReadline) { try { globalReadline.close(); } catch {} globalReadline = null; }
            process.stdin.setRawMode(true);
            process.stdin.resume();
            if (node.next) {
                renderJsonUI(node.next, { ...context, showPrompt: showPromptAfter, inSteps: true });
            } else {
                setImmediate(() => {
                    setupKeyBindings();
                    promptWasShown = true;
                    showPrompt();
                });
            }
        }
    }
    process.stdin.on('data', onKey);
}

function pipes(node, context, showPromptAfter = true) {
    clearScreen();
    if (node.title) process.stdout.write(center(node.title) + '\n');
    if (node.command) process.stdout.write(center(`Running: ${node.command}`) + '\n');
    if (node.content) process.stdout.write(center(node.content) + '\n');
    if (node.file) {
        try {
            const filePath = path.join(appsDir, node.file);
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                process.stdout.write(center(fileContent) + '\n');
            } else {
                process.stdout.write(center(`[File not found: ${node.file}]`) + '\n');
            }
        } catch (e) {
            process.stdout.write(center(`[Error loading file: ${e.message}]`) + '\n');
        }
    }
        if (showPromptAfter) {
            process.stdout.write(center('Press Enter to return to the shell.') + '\n');
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeAllListeners('data');
            if (globalReadline) { try { globalReadline.close(); } catch {} globalReadline = null; }
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            globalReadline = rl;
            rl.question('', () => {
                rl.close();
                globalReadline = null;
                process.stdin.setRawMode(true);
                process.stdin.resume();
                if (node.next) {
                    // Go directly to next node, never show prompt between chained nodes
                    renderJsonUI(node.next, { ...context, showPrompt: showPromptAfter, inSteps: true });
                } else {
                    setupKeyBindings();
                    showPrompt();
                }
            });
        } else if (node.next) {
            renderJsonUI(node.next, { ...context, showPrompt: showPromptAfter, inSteps: true });
        } else {
            // If no next, drop to shell (prompt+input)
            setupKeyBindings();
            promptWasShown = true;
            showPrompt();
        }
}

function main() {
    const cliArgs = process.argv.slice(2);
    if (cliArgs.length === 0) {
        console.log('Usage: node js1_shell.js <json_app_name> [args...]');
        // Only show prompt if not suppressed globally
        let rootShowPrompt = true;
        // Try to read default app config if exists
        const defaultAppPath = path.join(appsDir, 'default.json');
        if (fs.existsSync(defaultAppPath)) {
            try {
                const appConfig = JSON.parse(fs.readFileSync(defaultAppPath, 'utf-8'));
                if (typeof appConfig.showPrompt !== 'undefined') rootShowPrompt = appConfig.showPrompt;
            } catch {}
        }
        if (rootShowPrompt) {
            setupKeyBindings();
            showPrompt();
        }
        return;
    }
    const appName = cliArgs[0];
    const args = cliArgs.slice(1);
    // Read app config to check root showPrompt
    const appPath = path.join(appsDir, appName + '.json');
    let rootShowPrompt = true;
    if (fs.existsSync(appPath)) {
        try {
            const appConfig = JSON.parse(fs.readFileSync(appPath, 'utf-8'));
            if (typeof appConfig.showPrompt !== 'undefined') rootShowPrompt = appConfig.showPrompt;
        } catch {}
    }
    promptWasShown = false;
    setupKeyBindings();
    runJsonApp(appName, args);
    if (rootShowPrompt && !promptWasShown) showPrompt();
}

main();
