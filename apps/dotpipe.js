// dotpipe.js - DotPipe remote connection and UX app for js_shell
// This app allows connecting to other machines running dotPipe-compatible shells
// and provides a self-contained window for remote command execution and testing.

module.exports = async function dotpipe(args, io) {
  // Show a window (shell.html) for the UX
  // Only Node.js CLI context supported
  const { spawn } = require('child_process');
  const path = require('path');
  const launcher = path.join(__dirname, '..', 'launcher.py');
  const htmlPath = path.join(__dirname, '..', 'js_shell', 'shell.html');
  spawn('python', [launcher, htmlPath, '--dotpipe'], { detached: true, stdio: 'ignore' });
  io.stdout('DotPipe window launched.\n');
  return 0;
}
