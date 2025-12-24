// thin_client.js
// Minimal client for DotFly Shell JSON UI protocol
// Connects to a shell server via stdin/stdout (or WebSocket/pipe in future)
// Renders menu/select UIs and sends user input back


const { renderMenu, renderBoolean, renderTextBox, renderCenteredBox } = require('./thin_components');

function runThinClient(menuOptions) {
    let selected = 0;
    let hasSelected = false;
    renderMenu(menuOptions, selected);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const onKey = (data) => {
        if (hasSelected) return;
        const key = data.toString();
        if (key === '\u001b[A') { // up
            selected--;
            if (selected < 0) selected = menuOptions.length - 1;
            renderMenu(menuOptions, selected);
        } else if (key === '\u001b[B') { // down
            selected++;
            if (selected >= menuOptions.length) selected = 0;
            renderMenu(menuOptions, selected);
        } else if (key === '\r' || key === '\n') { // enter
            hasSelected = true;
            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener('data', onKey);
            process.stdout.write(`Selected: ${menuOptions[selected].label}\n`);
            process.exit(0);
        }
    };
    process.stdin.on('data', onKey);
}

// Example usage: pass options as array of {label: string}
if (require.main === module) {
    // Demo: static menu
    runThinClient([
        { label: 'Option 1' },
        { label: 'Option 2' },
        { label: 'Option 3' }
    ]);
    // To demo other components, you could call:
    // renderBoolean('Are you sure?', true);
    // renderTextBox('Enter your name:', '', 0);
    // renderCenteredBox('Hello!\n[1]/[1]', 20);
}
