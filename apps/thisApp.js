// thisApp.js - Demo app for QuickJS shell
// Usage: In the shell, type: thisApp.js

export default async function thisApp(args, io) {
  io = io || { stdout: print, stderr: print, stdin: () => '' };
  io.stdout('Hello from thisApp.js!\n');
  io.stdout('Args: ' + JSON.stringify(args) + '\n');
  return 0;
}

// For direct CLI use (if not loaded as a module)
if (typeof globalThis.runApp === 'function') {
  globalThis.runApp('thisApp.js', [], { stdout: print, stderr: print, stdin: () => '' });
}
