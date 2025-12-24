// modal.js - Terminal modal window utility for js_shell apps
// Provides ncurses-like modal windows with arrow key navigation and recursive app launching

const readline = require('readline');

/**
 * modal - Opens a modal window in the terminal, handles arrow keys, and allows launching sub-modals/apps.
 * @param {Object} opts - Options: { title, content, onKey, env }
 * @param {Function} callback - Called when modal exits
 */
async function modal(opts, callback) {
  const stdin = process.stdin;
  const stdout = process.stdout;
  let active = true;
  let cursor = 0;
  let content = opts.content || [];
  let env = opts.env || {};
  let title = opts.title || 'Modal';

  // Draw modal window
  function draw() {
    stdout.write('\x1b[2J\x1b[H'); // Clear screen
    stdout.write(`=== ${title} ===\n`);
    content.forEach((line, i) => {
      if (i === cursor) stdout.write('> ');
      else stdout.write('  ');
      stdout.write(line + '\n');
    });
    stdout.write('\n[Arrow keys to navigate, Enter to select, q to quit]\n');
  }

  function onData(char) {
    if (!active) return;
    if (char === '\u001b[A') { // Up
      cursor = (cursor - 1 + content.length) % content.length;
      draw();
    } else if (char === '\u001b[B') { // Down
      cursor = (cursor + 1) % content.length;
      draw();
    } else if (char === '\r' || char === '\n') { // Enter
      if (opts.onKey) opts.onKey('enter', cursor, env, launchSubModal);
    } else if (char === 'q') {
      active = false;
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener('data', onData);
      if (callback) callback();
    } else if (opts.onKey) {
      opts.onKey(char, cursor, env, launchSubModal);
    }
  }

  // Allow launching sub-modals/apps recursively
  function launchSubModal(subOpts) {
    active = false;
    stdin.removeListener('data', onData);
    modal(subOpts, () => {
      active = true;
      draw();
      stdin.on('data', onData);
    });
  }

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  stdin.on('data', onData);
  draw();
}

module.exports = modal;
