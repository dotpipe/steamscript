// Main UI engine for shell: handles menu, boolean, textbox nodes
function interactiveJsonNode(node, context, renderJsonUI, setupKeyBindings, showPrompt) {
    if (!node) return;
    let exited = false;
    // F12 ownership protocol: only the top-level (f12Owner) handles F12
    const isF12Owner = context && context.f12Owner;
    function exitToShell() {
        if (exited) return;
        exited = true;
        if (context && typeof context.exitByF12 === 'function') {
            context.exitByF12();
        } else {
            setupKeyBindings();
            showPrompt();
        }
    }
    if (node.type === 'menu') {
        let opts = node.options;
        // Expand [{{todos}}] style
        if (typeof opts === 'string' && opts.match(/^\[{{\s*([\w.\-]+)\s*}}\]$/)) {
            const key = opts.match(/^\[{{\s*([\w.\-]+)\s*}}\]$/)[1];
            let val = context.data && context.data.todos;
            if (key && context.data) {
                const keys = key.split('.');
                val = context.data;
                for (const k of keys) {
                    if (val && typeof val === 'object' && k in val) val = val[k];
                    else { val = []; break; }
                }
            }
            opts = Array.isArray(val) ? val : [];
        }
        if (Array.isArray(opts)) {
            opts = opts.map(opt => {
                if (typeof opt === 'string') return { label: opt };
                if (typeof opt === 'object' && opt !== null && typeof opt.label === 'string') return opt;
                if (typeof opt === 'object' && opt !== null) return { label: opt.label || JSON.stringify(opt) };
                return { label: String(opt) };
            });
            if (opts.length === 0) {
                process.stdout.write('[No options available. Returning to shell prompt.]\n');
                setupKeyBindings();
                showPrompt();
                return;
            }
            let selected = node.selected || 0;
            renderMenu(opts, selected);
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.removeAllListeners('data');
            process.stdin.on('data', function onKey(data) {
                const key = data.toString();
                if (key === '\u001b[A') { // up
                    selected = (selected - 1 + opts.length) % opts.length;
                    renderMenu(opts, selected);
                } else if (key === '\u001b[B') { // down
                    selected = (selected + 1) % opts.length;
                    renderMenu(opts, selected);
                } else if (key === '\r' || key === '\n') { // enter
                    process.stdin.removeListener('data', onKey);
                    process.stdout.write(`\nSelected: ${opts[selected].label}\n`);
                    if (typeof node.onSelect === 'function') {
                        node.onSelect(opts[selected], selected);
                    } else if (typeof node.onSelect === 'string') {
                        // Try context.handlers[onSelect] or global[onSelect]
                        let handler = (context && context.handlers && context.handlers[node.onSelect]) || global[node.onSelect];
                        if (typeof handler === 'function') handler(opts[selected], selected);
                    }
                    if (opts[selected].next) renderJsonUI(opts[selected].next, context);
                    else if (node.next) renderJsonUI(node.next, context);
                    else {
                        exitToShell();
                    }
                } else if (key === '\u001b[24~') { // F12
                    if (isF12Owner) {
                        process.stdin.removeListener('data', onKey);
                        exitToShell();
                    }
                }
            });
        }
    } else if (node.type === 'boolean') {
        let value = !!node.value;
        renderBoolean(node.prompt || node.label || 'Choose:', value);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.removeAllListeners('data');
        process.stdin.on('data', function onKey(data) {
            const key = data.toString();
            if (key === '\u001b[C' || key === 'l') { // right
                value = false;
                renderBoolean(node.prompt || node.label || 'Choose:', value);
            } else if (key === '\u001b[D' || key === 'h') { // left
                value = true;
                renderBoolean(node.prompt || node.label || 'Choose:', value);
            } else if (key === '\r' || key === '\n') { // enter
                process.stdin.removeListener('data', onKey);
                process.stdout.write(`\nSelected: ${value ? 'Yes' : 'No'}\n`);
                if (node.onSelect) node.onSelect(value);
                if (node.next) renderJsonUI(node.next, context);
                else {
                    exitToShell();
                }
            } else if (key === '\u001b[24~') { // F12
                if (isF12Owner) {
                    process.stdin.removeListener('data', onKey);
                    exitToShell();
                }
            }
        });
    } else if (node.type === 'textbox') {
        let text = node.value || '';
        let cursor = text.length;
        renderTextBox(node.prompt || node.label || 'Enter text:', text, cursor);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.removeAllListeners('data');
        process.stdin.on('data', function onKey(data) {
            const key = data.toString();
            if (key === '\u001b[C') { // right
                if (cursor < text.length) cursor++;
                renderTextBox(node.prompt || node.label || 'Enter text:', text, cursor);
            } else if (key === '\u001b[D') { // left
                if (cursor > 0) cursor--;
                renderTextBox(node.prompt || node.label || 'Enter text:', text, cursor);
            } else if (key === '\u0008' || key === '\x7f') { // backspace
                if (cursor > 0) {
                    text = text.slice(0, cursor - 1) + text.slice(cursor);
                    cursor--;
                    renderTextBox(node.prompt || node.label || 'Enter text:', text, cursor);
                }
            } else if (key === '\r' || key === '\n') { // enter
                process.stdin.removeListener('data', onKey);
                process.stdout.write(`\nEntered: ${text}\n`);
                // Support onSubmit as function or string handler name
                if (node.onSubmit) {
                    if (typeof node.onSubmit === 'function') {
                        node.onSubmit(text);
                    } else if (typeof node.onSubmit === 'string') {
                        // Try context.handlers[onSubmit] or global[onSubmit]
                        let handler = (context && context.handlers && context.handlers[node.onSubmit]) || global[node.onSubmit];
                        if (typeof handler === 'function') handler(text);
                    }
                }
                if (node.next) renderJsonUI(node.next, context);
                else {
                    exitToShell();
                }
            } else if (key === '\u001b[24~') { // F12
                if (isF12Owner) {
                    process.stdin.removeListener('data', onKey);
                    exitToShell();
                }
            } else if (key.length === 1 && key >= ' ' && key <= '~') {
                text = text.slice(0, cursor) + key + text.slice(cursor);
                cursor++;
                renderTextBox(node.prompt || node.label || 'Enter text:', text, cursor);
            }
        });
    }
}
// thin_components.js
// Reusable UI components for thin_client.js and similar minimal clients

function renderMenu(options, selected) {
    console.clear();
    options.forEach((opt, i) => {
        if (i === selected) {
            process.stdout.write('\x1b[7m> ' + opt.label + '\x1b[0m\n');
        } else {
            process.stdout.write('  ' + opt.label + '\n');
        }
    });
    process.stdout.write('[Arrow keys to navigate, Enter to select]\n');
}

function renderBoolean(prompt, value) {
    console.clear();
    process.stdout.write(prompt + ' ');
    process.stdout.write(value ? '[Yes]' : ' Yes ');
    process.stdout.write(' / ');
    process.stdout.write(!value ? '[No]' : ' No ');
    process.stdout.write('\n[Left/Right to toggle, Enter to confirm]\n');
}

function renderTextBox(prompt, value, cursorPos) {
    console.clear();
    process.stdout.write(prompt + '\n');
    let display = value;
    if (typeof cursorPos === 'number') {
        display = value.slice(0, cursorPos) + '|' + value.slice(cursorPos);
    }
    process.stdout.write('[' + display + ']\n');
    process.stdout.write('[Type to edit, Enter to confirm]\n');
}

function renderCenteredBox(content, width) {
    const lines = content.split('\n');
    const termWidth = process.stdout.columns || 80;
    const boxWidth = width || Math.max(...lines.map(l => l.length)) + 4;
    const pad = Math.floor((termWidth - boxWidth) / 2);
    const border = ' '.repeat(pad) + '+' + '-'.repeat(boxWidth - 2) + '+\n';
    let out = border;
    lines.forEach(line => {
        const linePad = Math.floor((boxWidth - 2 - line.length) / 2);
        out += ' '.repeat(pad) + '|' + ' '.repeat(linePad) + line + ' '.repeat(boxWidth - 2 - line.length - linePad) + '|\n';
    });
    out += border;
    process.stdout.write(out);
}

module.exports = {
    renderMenu,
    renderBoolean,
    renderTextBox,
    renderCenteredBox
    ,interactiveJsonNode
};


// Demo runner: showcase each component if run directly
if (require.main === module) {
    // Interactive demo for each component
    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function interactiveMenuDemo() {
        const menuOptions = [
            { label: 'Menu Option 1' },
            { label: 'Menu Option 2' },
            { label: 'Menu Option 3' }
        ];
        let selected = 0;
        let done = false;
        renderMenu(menuOptions, selected);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        return new Promise(resolve => {
            function onKey(data) {
                const key = data.toString();
                if (key === '\u001b[A') { // up
                    selected = (selected - 1 + menuOptions.length) % menuOptions.length;
                    renderMenu(menuOptions, selected);
                } else if (key === '\u001b[B') { // down
                    selected = (selected + 1) % menuOptions.length;
                    renderMenu(menuOptions, selected);
                } else if (key === '\r' || key === '\n') { // enter
                    done = true;
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeListener('data', onKey);
                    process.stdout.write(`\nSelected: ${menuOptions[selected].label}\n`);
                    resolve();
                }
            }
            process.stdin.on('data', onKey);
        });
    }

    async function interactiveBooleanDemo() {
        let value = true;
        let done = false;
        renderBoolean('Are you sure?', value);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        return new Promise(resolve => {
            function onKey(data) {
                const key = data.toString();
                if (key === '\u001b[C' || key === 'l') { // right
                    value = false;
                    renderBoolean('Are you sure?', value);
                } else if (key === '\u001b[D' || key === 'h') { // left
                    value = true;
                    renderBoolean('Are you sure?', value);
                } else if (key === '\r' || key === '\n') { // enter
                    done = true;
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeListener('data', onKey);
                    process.stdout.write(`\nSelected: ${value ? 'Yes' : 'No'}\n`);
                    resolve();
                }
            }
            process.stdin.on('data', onKey);
        });
    }

    async function interactiveTextBoxDemo() {
        let value = '';
        let cursor = 0;
        let done = false;
        renderTextBox('Enter your name:', value, cursor);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        return new Promise(resolve => {
            function onKey(data) {
                const key = data.toString();
                if (key === '\u001b[C') { // right
                    if (cursor < value.length) cursor++;
                    renderTextBox('Enter your name:', value, cursor);
                } else if (key === '\u001b[D') { // left
                    if (cursor > 0) cursor--;
                    renderTextBox('Enter your name:', value, cursor);
                } else if (key === '\u0008' || key === '\x7f') { // backspace
                    if (cursor > 0) {
                        value = value.slice(0, cursor - 1) + value.slice(cursor);
                        cursor--;
                        renderTextBox('Enter your name:', value, cursor);
                    }
                } else if (key === '\r' || key === '\n') { // enter
                    done = true;
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeListener('data', onKey);
                    process.stdout.write(`\nEntered: ${value}\n`);
                    resolve();
                } else if (key.length === 1 && key >= ' ' && key <= '~') {
                    value = value.slice(0, cursor) + key + value.slice(cursor);
                    cursor++;
                    renderTextBox('Enter your name:', value, cursor);
                }
            }
            process.stdin.on('data', onKey);
        });
    }

    async function interactiveCenteredBoxDemo() {
        renderCenteredBox('Centered!\n[1]/[1]', 20);
        process.stdout.write('\nPress Enter to continue...');
        process.stdin.setRawMode(false);
        process.stdin.resume();
        return new Promise(resolve => {
            process.stdin.once('data', () => {
                process.stdin.pause();
                resolve();
            });
        });
    }

    (async () => {
        process.stdout.write('--- Menu Demo ---\n');
        await interactiveMenuDemo();
        await wait(400);
        process.stdout.write('\n--- Boolean Demo ---\n');
        await interactiveBooleanDemo();
        await wait(400);
        process.stdout.write('\n--- Text Box Demo ---\n');
        await interactiveTextBoxDemo();
        await wait(400);
        process.stdout.write('\n--- Centered Box Demo ---\n');
        await interactiveCenteredBoxDemo();
        process.stdout.write('\nDemo complete.\n');
        process.exit(0);
    })();
}
