// thread_viewer.js - Enhanced thread reader for htodo threads
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const TODO_FILE = path.join(__dirname, '..', 'todo.json');

function loadTodos() {
    if (!fs.existsSync(TODO_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
    } catch {
        return [];
    }
}
function printOut(io, s) {
    if (io && typeof io.stdout === 'function') return io.stdout(s);
    if (io && io.stdout && typeof io.stdout.write === 'function') return io.stdout.write(s);
    if (typeof process.stdout.write === 'function') return process.stdout.write(s);
}

module.exports = function threadViewer(index, io, dashboardString) {
    return new Promise((resolve) => {
        // Enter alternate screen buffer (preserves shell screen)
        printOut(io, '\x1b[?1049h');
        // Clear the terminal screen on entry
        printOut(io, '\x1b[2J\x1b[H');
        let todos = loadTodos();
        let todo = todos[index];
        if (!todo) {
            printOut(io, 'No such thread.\n');
            // Clear again and return to shell prompt
            printOut(io, '\x1b[2J\x1b[H');
            printOut(io, '\x1b[?1049l');
            resolve(0);
            return;
        }
        // Migrate flat array to tree if needed
        if (Array.isArray(todo.thread)) {
            todo.thread = todo.thread.map(msg => typeof msg === 'string' ? { text: msg, replies: [] } : msg);
            fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
        }
        if (!Array.isArray(todo.thread)) todo.thread = [];
        // Ensure at least one message in the thread
        if (todo.thread.length === 0) {
            // Use the todo's text as the root thread message
            todo.thread.push({ text: todo.text, replies: [] });
            fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
        }
        let path = [0]; // Start at first message
        let running = true;
        let lines = [];
        let cleanedUp = false;
        // System-level handle for input context
        let inputHandle = { mode: 'os' }; // modes: 'os', 'edit', 'reply'
        function getNodeByPath(thread, path) {
            let node = { replies: thread };
            for (let i = 0; i < path.length; ++i) {
                if (!node.replies || !node.replies[path[i]]) return null;
                node = node.replies[path[i]];
            }
            return node;
        }
    function getSiblings() {
        if (path.length === 0) return todo.thread;
        let parent = getNodeByPath(todo.thread, path.slice(0, -1));
        return parent && parent.replies ? parent.replies : todo.thread;
    }
    function moveSelection(delta) {
        let siblings = getSiblings();
        let idx = path[path.length - 1] || 0;
        idx = Math.max(0, Math.min(siblings.length - 1, idx + delta));
        path[path.length - 1] = idx;
    }
    function cleanup() {
        if (cleanedUp) return;
        cleanedUp = true;
        running = false;
        process.stdin.removeAllListeners('keypress');
        if (process.stdin.isTTY) {
            try { process.stdin.setRawMode(false); } catch { }
        }
        printOut(io, '\nF12: Toggle dashboard | Up/Down: Move | d: Delete | q: Quit\n');
        printOut(io, '\x1b[?1049l');
        resolve(0);
    }
    function renderThread() {
        lines = [];
        // Clear screen and move cursor to top left
        lines.push('\x1b[2J\x1b[H');
        // Minimal header
        lines.push('THREAD VIEWER');
        lines.push('');
        // Render thread as a tree with selection highlight
        function renderTree(nodes, depth, selPath) {
            nodes.forEach((msg, i) => {
                const isSel = JSON.stringify(path) === JSON.stringify([...selPath, i]);
                const indent = ' '.repeat(depth * 2);
                const selMark = isSel ? '>' : ' ';
                // Split message text by newlines and render each line
                const msgLines = msg.text.split('\n');
                msgLines.forEach((line, idx) => {
                    const prefix = idx === 0 ? `${indent}${selMark} [${i+1}] ` : `${indent}    `;
                    const msgText = isSel && idx === 0 ? line : line;
                    lines.push(`${prefix}${msgText}`);
                });
                if (msg.replies && msg.replies.length) renderTree(msg.replies, depth + 1, [...selPath, i]);
            });
        }
        if (todo.thread.length) renderTree(todo.thread, 0, []);
        else lines.push('(No thread messages)');
        lines.push('');
        // Minimal controls
        lines.push('Up/Down: Move  |  Right: Reply  |  Left: Up  |  e: Edit  |  del: Delete | Ctrl+X: Exit');
        printOut(io, lines.join('\n') + '\n');
    }
    (async function mainLoop() {
        renderThread(); // Draw UI immediately
        while (running) {
            await new Promise((keyResolve) => {
                // Remove any previous keypress listeners to prevent accumulation
                process.stdin.removeAllListeners('keypress');
                inputHandle.mode = 'os';
                function moveSelectionTree(delta) {
                    // Move selection among siblings or replies
                    let siblings = getSiblings();
                    let idx = path[path.length - 1] || 0;
                    idx = Math.max(0, Math.min(siblings.length - 1, idx + delta));
                    path[path.length - 1] = idx;
                }
                function onKey(str, key) {
                    if (!running) return;
                    let shouldRedraw = true;
                    if (key && key.ctrl && key.name === 'x') { cleanup(); return; }
                    if (key && key.name === 'down') { moveSelectionTree(1); }
                    else if (key && key.name === 'up') { moveSelectionTree(-1); }
                    else if (key && key.name === 'left' && path.length > 1) { path.pop(); } // left = up
                    else if (key && key.name === 'right') { // right = reply
                        let node = getNodeByPath(todo.thread, path);
                        if (!node) { keyResolve(); return; }
                        printOut(io, '\nType your reply. Enter: new line, Ctrl+S: save/submit\n');
                        // Always start with a clean, empty buffer
                        let replyBuffer = '';
                        let replyInputActive = true;
                        process.stdin.setRawMode(false); // Disable raw mode for multiline input
                        let inputLineCount = 0;
                        function printReplyPrompt() { printOut(io, '> '); }
                        printReplyPrompt();
                        inputHandle.mode = 'reply';
                        function onReplyKey(str, key) {
                            if (inputHandle.mode !== 'reply') return;
                            if (!replyInputActive) return;
                            // Ctrl+S for submit
                            if (key && key.ctrl && key.name === 's') {
                                replyInputActive = false;
                                inputHandle.mode = 'os';
                                process.stdin.removeListener('keypress', onReplyKey);
                                process.stdin.setRawMode(true); // Restore raw mode after submission
                                const username = process.env.JS_SHELL_USER || os.userInfo().username || 'unknown';
                                const today = new Date().toISOString().slice(0, 10);
                                if (!node.replies) node.replies = [];
                                node.replies.push({ text: `[${username} @ ${today}]: ${replyBuffer.trim()}`, replies: [] });
                                fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
                                renderThread();
                                keyResolve();
                                return;
                            }
                            // Backspace support
                            if (key && (key.name === 'backspace' || key.name === 'delete')) {
                                if (replyBuffer.length > 0) {
                                    // Remove last character
                                    replyBuffer = replyBuffer.slice(0, -1);
                                    // Move cursor back, clear character
                                    printOut(io, '\b \b');
                                }
                                return false;
                            }
                            // Enter for newline (suppress OS prompt)
                            if (key && key.name === 'return') {
                                replyBuffer += '\n';
                                printOut(io, '\n');
                                printReplyPrompt();
                                inputLineCount++;
                                return false; // Prevent default
                            }
                            if (typeof str === 'string' && str && str !== '\r' && str !== '\n') {
                                replyBuffer += str;
                                printOut(io, str);
                            }
                        }
                        process.stdin.on('keypress', onReplyKey);
                        shouldRedraw = false;
                        return;
                    }
                    else if (key && key.name === 'e') {
                        // Always edit the currently selected message
                        let node = getNodeByPath(todo.thread, path);
                        if (!node) { keyResolve(); return; }
                        printOut(io, `\nEdit message. Enter: new line, Ctrl+S: save/submit\n`);
                        // Always start with a clean, empty buffer for editing
                        let editBuffer = '';
                        let editInputActive = true;
                        process.stdin.setRawMode(false); // Disable raw mode for multiline input
                        let editLineCount = 0;
                        function printEditPrompt() { printOut(io, '> '); }
                        printEditPrompt();
                        inputHandle.mode = 'edit';
                        function onEditKey(str, key) {
                            if (inputHandle.mode !== 'edit') return;
                            if (!editInputActive) return;
                            // Ctrl+S for submit
                            if (key && key.ctrl && key.name === 's') {
                                editInputActive = false;
                                inputHandle.mode = 'os';
                                process.stdin.removeListener('keypress', onEditKey);
                                process.stdin.setRawMode(true); // Restore raw mode after submission
                                node.text = editBuffer.trim();
                                fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
                                renderThread();
                                keyResolve();
                                return;
                            }
                            // Backspace support
                            if (key && (key.name === 'backspace' || key.name === 'delete')) {
                                if (editBuffer.length > 0) {
                                    editBuffer = editBuffer.slice(0, -1);
                                    printOut(io, '\b \b');
                                }
                                return false;
                            }
                            // Enter for newline (suppress OS prompt)
                            if (key && key.name === 'return') {
                                editBuffer += '\n';
                                printOut(io, '\n');
                                printEditPrompt();
                                editLineCount++;
                                return false; // Prevent default
                            }
                            if (typeof str === 'string' && str && str !== '\r' && str !== '\n') {
                                editBuffer += str;
                                printOut(io, str);
                            }
                        }
                        process.stdin.on('keypress', onEditKey);
                        shouldRedraw = false;
                        return;
                    }
                    else if (key && (key.name === 'delete' || key.name === 'backspace')) {
                        let siblings = getSiblings();
                        let idx = path[path.length - 1];
                        siblings.splice(idx, 1);
                        if (path[path.length - 1] > 0) path[path.length - 1]--;
                        fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2));
                    }
                    else if (key && key.name === 'o') { todo.threadStatus = 'open'; fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2)); }
                    else if (key && key.name === 'g') { todo.threadStatus = 'approved'; fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2)); }
                    else if (key && key.name === 'x') { todo.threadStatus = 'rejected'; fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2)); }
                    if (shouldRedraw) renderThread();
                    keyResolve();
                }
                process.stdin.once('keypress', onKey);
            });
        }
        // Exit alternate screen buffer (restores shell screen)
        printOut(io, '\x1b[?1049l');
        resolve(0);
    })();
    });
};