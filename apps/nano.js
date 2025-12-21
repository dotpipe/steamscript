// nano.js - Enhanced terminal text editor for js_shell (raw mode, scroll, exit)
const fs = require('fs');

module.exports = async function(args, io, shell) {
  const file = args[0];
  if (!file) {
    io.stderr('nano: usage: nano <file>\n');
    return 1;
  }
  let lines = [];
  if (fs.existsSync(file)) {
    lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  }
  if (lines.length === 0) lines.push('');
  let cursor = 0;
  let dirty = false;
  let cutBuffer = '';
  let scroll = 0;
  const height = process.stdout.rows ? process.stdout.rows - 4 : 20;
  function render() {
    process.stdout.write('\x1b[2J\x1b[H'); // clear screen
    process.stdout.write(`--- nano: ${file} --- (Ctrl+S=save, Ctrl+X=exit, Ctrl+K=cut, Ctrl+U=uncut)\n`);
    let start = Math.max(0, cursor - Math.floor(height / 2));
    let end = Math.min(lines.length, start + height);
    if (end - start < height) start = Math.max(0, end - height);
    for (let i = start; i < end; ++i) {
      if (i === cursor) process.stdout.write('> ' + lines[i] + '\n');
      else process.stdout.write('  ' + lines[i] + '\n');
    }
    for (let i = end; i < start + height; ++i) process.stdout.write('\n');
    process.stdout.write(`\nLine: ${cursor + 1}/${lines.length}  [Ctrl+X to exit]\n`);
  }
  function saveFile() {
    fs.writeFileSync(file, lines.join('\n'));
    dirty = false;
    process.stdout.write('[ File saved ]\n');
  }
  function exitEditor() {
    process.stdin.setRawMode(false);
    process.stdin.removeListener('data', handleKey);
    process.stdout.write('\x1b[2J\x1b[H[ Exited nano ]\n');
  }
  function askSaveAndExit() {
    process.stdout.write('Save modified buffer (Y/N)? ');
    process.stdin.setRawMode(false);
    process.stdin.once('data', (data) => {
      const answer = data.toString().trim().toLowerCase();
      if (answer === 'y') saveFile();
      exitEditor();
    });
  }
  function handleKey(buf) {
    // Accept both Buffer and string
    if (typeof buf === 'string') buf = Buffer.from(buf, 'utf8');
    const key = buf.length === 1 ? buf[0] : null;
    // Ctrl+S
    if (buf.length === 1 && buf[0] === 19) { saveFile(); render(); return; }
    // Ctrl+X
    if (buf.length === 1 && buf[0] === 24) {
      if (dirty) askSaveAndExit();
      else exitEditor();
      return;
    }
    // Ctrl+K (cut)
    if (buf.length === 1 && buf[0] === 11) {
      if (lines.length > 0) {
        cutBuffer = lines.splice(cursor, 1)[0];
        if (cursor >= lines.length) cursor = Math.max(0, lines.length - 1);
        dirty = true;
      }
      render();
      return;
    }
    // Ctrl+U (uncut)
    if (buf.length === 1 && buf[0] === 21) {
      if (cutBuffer) {
        lines.splice(cursor, 0, cutBuffer);
        dirty = true;
      }
      render();
      return;
    }
    // Up arrow
    if (buf.length === 3 && buf[0] === 27 && buf[1] === 91 && buf[2] === 65) { cursor = Math.max(0, cursor-1); render(); return; }
    // Down arrow
    if (buf.length === 3 && buf[0] === 27 && buf[1] === 91 && buf[2] === 66) { cursor = Math.min(lines.length-1, cursor+1); render(); return; }
    // Enter
    if (buf.length === 1 && buf[0] === 13) {
      lines.splice(cursor+1, 0, '');
      cursor++;
      dirty = true;
      render();
      return;
    }
    // Backspace
    if (buf.length === 1 && (buf[0] === 8 || buf[0] === 127)) {
      if (lines[cursor].length > 0) {
        lines[cursor] = lines[cursor].slice(0, -1);
        dirty = true;
      } else if (lines.length > 1) {
        lines.splice(cursor, 1);
        if (cursor >= lines.length) cursor = Math.max(0, lines.length - 1);
        dirty = true;
      }
      render();
      return;
    }
    // Printable characters
    if (buf.length === 1 && buf[0] >= 32 && buf[0] <= 126) {
      lines[cursor] += String.fromCharCode(buf[0]);
      dirty = true;
      render();
      return;
    }
  }
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', handleKey);
  render();
};